// Real-Time WebRTC Call Signaling Service for Vexora Network
// Supports BroadcastChannel (Cross-Tab P2P), LocalStorage sync, and WebRTC PeerConnection

export interface CallSignalPayload {
  type: 'OFFER' | 'ANSWER' | 'SDP_OFFER' | 'SDP_ANSWER' | 'ICE_CANDIDATE' | 'HANGUP' | 'REJECT' | 'PING';
  callId: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  toUserId: string;
  callType: 'voice' | 'video';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  timestamp: number;
}

type CallSignalListener = (payload: CallSignalPayload) => void;

class CallSignalingService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<CallSignalListener> = new Set();
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('vexora_call_signaling');
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.warn("BroadcastChannel init failed:", e);
      }
    }

    // Fallback cross-tab storage listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'vexora_call_event' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyListeners(data);
          } catch {}
        }
      });
    }
  }

  public subscribe(listener: CallSignalListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(payload: CallSignalPayload) {
    this.listeners.forEach(cb => {
      try { cb(payload); } catch (e) { console.error("Error in call listener:", e); }
    });
  }

  public sendSignal(payload: CallSignalPayload) {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.warn("BroadcastChannel post error:", e);
      }
    }
    // Also trigger via localStorage for maximum browser compatibility across windows
    try {
      localStorage.setItem('vexora_call_event', JSON.stringify({ ...payload, _ts: Date.now() }));
    } catch {}
  }

  // WebRTC Peer Connection Initializer
  public createPeerConnection(
    localStream: MediaStream | null, 
    onRemoteStream: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void
  ): RTCPeerConnection {
    this.cleanupPeerConnection();
    this.pendingCandidates = [];

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(config);
    this.peerConnection = pc;
    this.onRemoteStreamCallback = onRemoteStream;

    // Add local tracks to WebRTC peer connection
    if (localStream) {
      localStream.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStream);
        } catch (e) {
          console.warn("Error adding local track:", e);
        }
      });
    }

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(event.streams[0]);
        }
      } else if (event.track) {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("WebRTC Connection state:", pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log("WebRTC ICE Connection state:", pc.iceConnectionState);
    };

    return pc;
  }

  // Create and return SDP Offer
  public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      // Prevent creating offer if already in have-local-offer or have-remote-offer unless stable
      if (this.peerConnection.signalingState !== 'stable') {
        console.log("Signaling state is", this.peerConnection.signalingState, "- skipping duplicate offer creation");
      }
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (e) {
      console.error("Failed to create WebRTC offer:", e);
      return null;
    }
  }

  // Handle incoming Offer and create SDP Answer
  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) return null;
    try {
      // Handle glare (offer collision) via rollback if needed
      if (this.peerConnection.signalingState !== 'stable') {
        try {
          await this.peerConnection.setLocalDescription({ type: 'rollback' });
        } catch (rollbackErr) {
          console.warn("Rollback attempt error (non-fatal):", rollbackErr);
        }
      }

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process any pending buffered ICE candidates
      while (this.pendingCandidates.length > 0) {
        const cand = this.pendingCandidates.shift();
        if (cand) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn("Failed to add buffered candidate:", e);
          }
        }
      }

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (e) {
      console.error("Failed to handle WebRTC offer:", e);
      return null;
    }
  }

  // Handle incoming Answer
  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<boolean> {
    if (!this.peerConnection) return false;
    try {
      if (this.peerConnection.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      } else {
        console.log("Ignoring answer because signalingState is:", this.peerConnection.signalingState);
        return false;
      }

      // Process any pending buffered ICE candidates
      while (this.pendingCandidates.length > 0) {
        const cand = this.pendingCandidates.shift();
        if (cand) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn("Failed to add buffered candidate:", e);
          }
        }
      }
      return true;
    } catch (e) {
      console.error("Failed to handle WebRTC answer:", e);
      return false;
    }
  }

  // Add ICE Candidate
  public async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection || !this.peerConnection.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn("Error adding WebRTC ICE candidate:", e);
    }
  }

  public cleanupPeerConnection() {
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.pendingCandidates = [];
  }

  public getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }
}

export const callSignaling = new CallSignalingService();

