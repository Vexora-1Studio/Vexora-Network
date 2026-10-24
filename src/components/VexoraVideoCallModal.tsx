import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2, 
  Settings, Sliders, Volume2, VolumeX, User, ChevronDown, Sparkles, 
  MessageSquare, Radio, Shield, CheckCircle2, X, RefreshCw, Layers
} from 'lucide-react';
import { UserProfile } from '../types';
import { callAudio } from '../utils/callAudio';
import { callSignaling, CallSignalPayload } from '../services/callSignaling';

interface VexoraVideoCallProps {
  call: { 
    type: 'voice' | 'video'; 
    status: 'calling' | 'incoming' | 'connected'; 
    targetId: string;
    callId?: string;
  };
  currentUser?: UserProfile | null;
  language?: 'ar' | 'en';
  onEnd: () => void;
  onAccept: () => void;
  onMinimize: () => void;
  targetProfile: UserProfile;
}

export function VexoraVideoCallModal({
  call,
  currentUser,
  language = 'ar',
  onEnd,
  onAccept,
  onMinimize,
  targetProfile
}: VexoraVideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(call.type === 'voice');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaPermissionDenied, setMediaPermissionDenied] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Audio meters
  const [localAudioLevel, setLocalAudioLevel] = useState<number>(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState<number>(0);
  const [isRemoteSpeaking, setIsRemoteSpeaking] = useState<boolean>(false);
  const [remoteVolume, setRemoteVolume] = useState<number>(100);
  const [isRemoteMuted, setIsRemoteMuted] = useState<boolean>(false);

  // Hardware & stream settings
  const [showMediaSettings, setShowMediaSettings] = useState(false);
  const [cameraFit, setCameraFit] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);
  const [micGain, setMicGain] = useState<number>(1.0);
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  const [echoCancellation, setEchoCancellation] = useState<boolean>(true);

  // Track if offer was already created
  const offerCreatedRef = useRef<boolean>(false);

  // Handle call sounds based on state
  useEffect(() => {
    if (call.status === 'calling') {
      callAudio.playOutgoingRinging();
    } else if (call.status === 'incoming') {
      callAudio.playIncomingRingtone();
    } else if (call.status === 'connected') {
      callAudio.playConnectedChime();
    }

    return () => {
      callAudio.stopAllSounds();
    };
  }, [call.status]);

  // WebRTC Signaling Listener for Offer, Answer, ICE Candidates
  useEffect(() => {
    const unsubscribe = callSignaling.subscribe(async (payload: CallSignalPayload) => {
      if (payload.callId && call.callId && payload.callId !== call.callId) {
        return; // Ignore other calls
      }

      if (payload.type === 'SDP_OFFER' && payload.sdp) {
        // We received an SDP offer (we are the callee / answerer)
        const answer = await callSignaling.handleOffer(payload.sdp);
        if (answer && currentUser) {
          callSignaling.sendSignal({
            type: 'SDP_ANSWER',
            callId: call.callId || 'direct-call',
            fromUser: {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar,
              isVerified: currentUser.isVerified
            },
            toUserId: payload.fromUser.id,
            callType: call.type,
            sdp: answer,
            timestamp: Date.now()
          });
        }
      } else if (payload.type === 'SDP_ANSWER' && payload.sdp) {
        // We received an SDP answer (we are the caller / offerer)
        await callSignaling.handleAnswer(payload.sdp);
      } else if (payload.type === 'ICE_CANDIDATE' && payload.candidate) {
        await callSignaling.addIceCandidate(payload.candidate);
      } else if (payload.type === 'HANGUP' || payload.type === 'REJECT') {
        callAudio.stopAllSounds();
        callAudio.playEndedChime();
        onEnd();
      }
    });

    return () => unsubscribe();
  }, [call.callId, currentUser, call.type, onEnd]);

  // WebRTC Peer Connection & Media Capture
  useEffect(() => {
    let streamInstance: MediaStream | null = null;
    offerCreatedRef.current = false;

    if (call.status === 'connected') {
      const getMedia = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setMediaPermissionDenied(true);
          return;
        }

        try {
          try {
            streamInstance = await navigator.mediaDevices.getUserMedia({ 
              video: call.type === 'video' ? {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              } : false, 
              audio: {
                echoCancellation: echoCancellation,
                noiseSuppression: noiseSuppression,
                autoGainControl: true
              } 
            });
          } catch (firstErr) {
            // Fallback to audio-only if video failed or camera is busy
            if (call.type === 'video') {
              try {
                streamInstance = await navigator.mediaDevices.getUserMedia({
                  video: false,
                  audio: {
                    echoCancellation: echoCancellation,
                    noiseSuppression: noiseSuppression,
                    autoGainControl: true
                  }
                });
                setIsVideoOff(true);
              } catch {
                setMediaPermissionDenied(true);
              }
            } else {
              setMediaPermissionDenied(true);
            }
          }

          if (streamInstance) {
            setLocalStream(streamInstance);
            setMediaPermissionDenied(false);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = streamInstance;
            }

            // Set up WebRTC peer connection
            callSignaling.createPeerConnection(
              streamInstance,
              (rStream) => {
                setRemoteStream(rStream);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = rStream;
                }
                if (remoteAudioRef.current) {
                  remoteAudioRef.current.srcObject = rStream;
                  remoteAudioRef.current.volume = remoteVolume / 100;
                  remoteAudioRef.current.muted = false;
                  remoteAudioRef.current.play().then(() => {
                    setAutoplayBlocked(false);
                  }).catch(err => {
                    console.warn("Audio autoplay blocked by browser policy:", err);
                    setAutoplayBlocked(true);
                  });
                }
              },
              (candidate) => {
                if (currentUser) {
                  callSignaling.sendSignal({
                    type: 'ICE_CANDIDATE',
                    callId: call.callId || 'direct-call',
                    fromUser: {
                      id: currentUser.id,
                      name: currentUser.name,
                      avatar: currentUser.avatar,
                      isVerified: currentUser.isVerified
                    },
                    toUserId: targetProfile.id,
                    callType: call.type,
                    candidate: candidate.toJSON(),
                    timestamp: Date.now()
                  });
                }
              }
            );

            // Deterministic initiator check: caller or higher user ID
            const isDeterministicOfferer = (currentUser && targetProfile && currentUser.id > targetProfile.id) || call.status === 'calling';

            setTimeout(async () => {
              if (!offerCreatedRef.current && isDeterministicOfferer) {
                offerCreatedRef.current = true;
                const offer = await callSignaling.createOffer();
                if (offer && currentUser) {
                  callSignaling.sendSignal({
                    type: 'SDP_OFFER',
                    callId: call.callId || 'direct-call',
                    fromUser: {
                      id: currentUser.id,
                      name: currentUser.name,
                      avatar: currentUser.avatar,
                      isVerified: currentUser.isVerified
                    },
                    toUserId: targetProfile.id,
                    callType: call.type,
                    sdp: offer,
                    timestamp: Date.now()
                  });
                }
              }
            }, 300);
          }
        } catch {
          setMediaPermissionDenied(true);
        }
      };

      getMedia();
    }

    return () => {
      if (streamInstance) {
        streamInstance.getTracks().forEach(track => track.stop());
      }
      callSignaling.cleanupPeerConnection();
    };
  }, [call.status, call.type, echoCancellation, noiseSuppression, targetProfile.id, currentUser, call.callId, remoteVolume]);

  // Adjust remote audio volume
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isRemoteMuted ? 0 : Math.max(0, Math.min(1, remoteVolume / 100));
    }
  }, [remoteVolume, isRemoteMuted]);

  // Unblock Audio Output
  const handleUnblockAudio = () => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = remoteVolume / 100;
      remoteAudioRef.current.play().then(() => {
        setAutoplayBlocked(false);
      }).catch(console.error);
    }
  };

  // Local audio level analyzer (Web Audio API)
  useEffect(() => {
    if (isMuted || call.status !== 'connected') {
      setLocalAudioLevel(0);
      return;
    }

    if (localStream) {
      let audioContext: AudioContext | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let analyser: AnalyserNode | null = null;
      let animationFrameId: number;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContext = new AudioContextClass();
          source = audioContext.createMediaStreamSource(localStream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const tick = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const finalLevel = Math.min(100, Math.round(average * micGain * 2.2));
            setLocalAudioLevel(finalLevel);
            animationFrameId = requestAnimationFrame(tick);
          };

          tick();
        }
      } catch {}

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (audioContext) {
          try { audioContext.close(); } catch {}
        }
      };
    }
  }, [localStream, isMuted, micGain, call.status]);

  // Remote audio level analyzer from real remote stream
  useEffect(() => {
    if (call.status !== 'connected' || isRemoteMuted) {
      setRemoteAudioLevel(0);
      setIsRemoteSpeaking(false);
      return;
    }

    if (remoteStream && remoteStream.getAudioTracks().length > 0) {
      let audioContext: AudioContext | null = null;
      let source: MediaStreamAudioSourceNode | null = null;
      let analyser: AnalyserNode | null = null;
      let animationFrameId: number;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContext = new AudioContextClass();
          source = audioContext.createMediaStreamSource(remoteStream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const tick = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const finalLevel = Math.min(100, Math.round(average * 2.5));
            setRemoteAudioLevel(finalLevel);
            setIsRemoteSpeaking(finalLevel > 6);
            animationFrameId = requestAnimationFrame(tick);
          };

          tick();
        }
      } catch {}

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (audioContext) {
          try { audioContext.close(); } catch {}
        }
      };
    }
  }, [remoteStream, call.status, isRemoteMuted]);

  // Video track toggle
  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
      }
    }
  }, [isVideoOff, localStream]);

  // Audio track mute toggle
  useEffect(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
      }
    }
  }, [isMuted, localStream]);

  // Handle End Call with audio chime
  const handleEndCall = () => {
    callAudio.stopAllSounds();
    callAudio.playEndedChime();
    callAudio.cancelSpeech();
    
    // Broadcast hangup
    if (currentUser) {
      callSignaling.sendSignal({
        type: 'HANGUP',
        callId: call.callId || 'direct-call',
        fromUser: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        toUserId: targetProfile.id,
        callType: call.type,
        timestamp: Date.now()
      });
    }

    onEnd();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-[1000] inset-4 flex items-center justify-center pointer-events-none"
    >
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className={`pointer-events-auto bg-black/95 backdrop-blur-3xl border border-white/15 rounded-[3rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.9)] flex flex-col transition-all duration-500 ${
        isFullscreen ? 'w-full h-full inset-0 rounded-none' : 'w-[92%] max-w-4xl h-[82%]'
      }`}>
        
        {/* Call Content Stage */}
        <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
          
          {/* Floating Top Status Bar */}
          <div className="absolute top-6 left-8 right-8 flex items-center justify-between z-[110] pointer-events-none">
            <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${
                call.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500 animate-ping'
              }`} />
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                {call.status === 'connected' 
                  ? (language === 'ar' ? '🟢 اتصال فيديو نشط ومشفر' : '🟢 Neural Link Active')
                  : call.status === 'calling' 
                    ? (language === 'ar' ? '📡 جارٍ إرسال إشارة الاتصال...' : '📡 Calling Node...')
                    : (language === 'ar' ? '📲 مكالمة واردة' : '📲 Incoming Signal')}
              </span>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={onMinimize}
                className="w-10 h-10 rounded-2xl bg-black/70 backdrop-blur-xl hover:bg-black/90 flex items-center justify-center text-white/80 hover:text-white transition-all border border-white/10 cursor-pointer shadow-lg active:scale-95"
                title={language === 'ar' ? 'تصغير المكالمة' : 'Minimize Call'}
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage: Remote Video / Avatar */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-zinc-950 via-black to-zinc-950">
            {call.status === 'connected' ? (
              call.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {/* Remote Banner Backdrop with Blur */}
                  <img 
                    src={targetProfile.banner} 
                    className="absolute inset-0 w-full h-full object-cover opacity-25 blur-2xl scale-110" 
                    alt="" 
                  />
                  
                  {/* If real remote stream exists */}
                  {remoteStream ? (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover relative z-10"
                    />
                  ) : (
                    /* Interactive Neural Peer Visual Feed */
                    <div className="relative z-10 flex flex-col items-center gap-6">
                      <div className="relative group">
                        <div className={`absolute -inset-6 rounded-full transition-all duration-300 ${
                          isRemoteSpeaking 
                            ? 'bg-purple-500/30 blur-xl animate-pulse scale-110' 
                            : 'bg-emerald-500/10 blur-lg'
                        }`} />
                        <img 
                          src={targetProfile.avatar} 
                          className={`w-44 h-44 rounded-full border-4 shadow-2xl object-cover transition-all duration-300 ${
                            isRemoteSpeaking 
                              ? 'border-purple-400 scale-105 shadow-[0_0_50px_rgba(168,85,247,0.5)]' 
                              : 'border-white/20'
                          }`}
                          alt="" 
                        />
                        {isRemoteSpeaking && (
                          <div className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                            <Volume2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                            {targetProfile.name}
                          </h3>
                          {targetProfile.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                            {isRemoteSpeaking 
                              ? (language === 'ar' ? '🔊 يتحدث الآن...' : '🔊 Speaking now...') 
                              : (language === 'ar' ? '🟢 يستمع إليك' : '🟢 Listening...')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remote Audio Oscillometer (Top Right) */}
                  <div className="absolute top-20 right-8 bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl z-20 flex items-center gap-3">
                    <Volume2 className={`w-4 h-4 ${isRemoteSpeaking ? 'text-purple-400 animate-pulse' : 'text-white/40'}`} />
                    <div className="flex gap-1 h-3 items-center w-20">
                      {Array.from({ length: 8 }).map((_, idx) => {
                        const active = (remoteAudioLevel / 100) * 8 > idx;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-full rounded-[1px] transition-all duration-75 ${
                              active ? 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]' : 'bg-white/10'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Voice Call Connected View */
                <div className="flex flex-col items-center gap-8 z-10 text-center px-6">
                  <div className="relative">
                    <div className={`absolute -inset-8 rounded-full transition-all duration-500 ${
                      isRemoteSpeaking ? 'bg-purple-500/25 blur-2xl animate-ping' : 'bg-white/5'
                    }`} />
                    <img 
                      src={targetProfile.avatar} 
                      className={`w-36 h-36 rounded-full border-4 shadow-2xl object-cover transition-all ${
                        isRemoteSpeaking ? 'border-purple-400 scale-105' : 'border-white/20'
                      }`}
                      alt="" 
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-white">{targetProfile.name}</h3>
                    <p className="text-purple-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                      {isRemoteSpeaking 
                        ? (language === 'ar' ? 'صوت الطرف الآخر ينبض عبر المكبر' : 'Peer Voice Streaming') 
                        : (language === 'ar' ? 'المكالمة الصوتية نشطة ومستقرة' : 'Neural Voice Link Active')}
                    </p>
                  </div>
                </div>
              )
            ) : call.status === 'incoming' ? (
              /* Incoming Call Ringing View */
              <div className="flex flex-col items-center gap-8 text-center my-auto px-6 z-10">
                <div className="relative">
                  <div className="absolute -inset-10 rounded-full border-2 border-emerald-500/40 animate-ping [animation-duration:2s]" />
                  <div className="absolute -inset-5 rounded-full border border-emerald-400/60 animate-pulse" />
                  <img 
                    src={targetProfile.avatar} 
                    className="w-36 h-36 rounded-full border-4 border-emerald-400 relative z-10 shadow-2xl" 
                    alt="" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 animate-pulse">
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    {language === 'ar' ? 'مكالمة فيديو واردة' : 'Incoming Video Link'}
                  </div>
                  <h3 className="text-3xl font-black uppercase text-white tracking-tight">{targetProfile.name}</h3>
                  <p className="text-white/60 font-mono text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'يرغب في بدء مكالمة فيديو ومحادثة صوتية معك' : 'Wants to initiate bidirectional neural audio & video'}
                  </p>
                </div>
              </div>
            ) : (
              /* Outgoing Calling View */
              <div className="flex flex-col items-center gap-8 text-center my-auto px-6 z-10">
                <div className="relative">
                  <div className="absolute -inset-10 rounded-full border-2 border-purple-500/30 animate-ping [animation-duration:2.5s]" />
                  <div className="absolute -inset-5 rounded-full border border-purple-400/40 animate-pulse" />
                  <img 
                    src={targetProfile.avatar} 
                    className="w-36 h-36 rounded-full border-4 border-purple-500/40 relative z-10 shadow-2xl grayscale contrast-125" 
                    alt="" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-purple-300 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                    {language === 'ar' ? 'جارٍ الاتصال والرنين...' : 'Ringing & Signaling Node...'}
                  </div>
                  <h3 className="text-3xl font-black uppercase text-white/90 tracking-tight">{targetProfile.name}</h3>
                  <p className="text-purple-400/60 font-mono text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'بانتظار قبول الطرف الآخر للمكالمة...' : 'Waiting for link handshake...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Local Camera (Draggable Picture-in-Picture) */}
          {call.status === 'connected' && call.type === 'video' && (
            <motion.div 
              drag 
              dragConstraints={{ left: -350, right: 350, top: -220, bottom: 220 }}
              className="absolute bottom-28 right-8 w-44 h-60 rounded-3xl overflow-hidden bg-black border-2 border-white/20 shadow-2xl z-50 cursor-move group/self"
            >
              {localStream && !isVideoOff ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full transition-all duration-300"
                  style={{
                    objectFit: cameraFit,
                    transform: `scale(${cameraZoom})`,
                    transformOrigin: 'center center'
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white/40 gap-2">
                  <User className="w-10 h-10" />
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Camera Muted</span>
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded-xl backdrop-blur-md border border-white/10">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-white uppercase tracking-widest font-mono">You (أنت)</span>
              </div>

              {/* Local Audio Level Meter Indicator */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md rounded-xl p-1.5 border border-white/10 flex items-center gap-2">
                <Mic className={`w-3 h-3 ${isMuted ? 'text-red-400' : 'text-emerald-400'}`} />
                <div className="flex-1 flex gap-0.5 h-2 items-center">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-full rounded-[1px] ${
                        (localAudioLevel / 100) * 6 > idx ? 'bg-emerald-400 shadow-sm' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Media Settings Panel Overlay */}
          <AnimatePresence>
            {showMediaSettings && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute right-0 top-0 bottom-0 w-84 bg-black/95 border-l border-white/10 z-[200] backdrop-blur-2xl p-6 flex flex-col space-y-6 shadow-2xl overflow-y-auto pointer-events-auto text-white"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-5 h-5 text-purple-400 rotate-90" />
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">إعدادات الصوت والصورة</h4>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">Hardware & Stream Settings</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMediaSettings(false)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors border border-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Speaker Audio Volume */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/80">صوت الطرف الآخر (السماعة)</span>
                    <span className="text-[10px] font-mono text-purple-400 font-semibold">{remoteVolume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-white/40" />
                    <input 
                      type="range"
                      min="0"
                      max="150"
                      value={remoteVolume}
                      onChange={(e) => setRemoteVolume(parseInt(e.target.value))}
                      className="flex-1 accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize focus:outline-none"
                    />
                  </div>
                </div>

                {/* Camera Zoom & Fit */}
                {call.type === 'video' && (
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/80">تقريب الكاميرا (Zoom)</span>
                      <span className="text-[10px] font-mono text-purple-400 font-semibold">{cameraZoom.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={cameraZoom}
                      onChange={(e) => setCameraZoom(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize focus:outline-none"
                    />
                  </div>
                )}

                {/* Mic Gain Sensitivity */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-white/80">حساسية الميكروفون (Mic Gain)</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">{Math.round(micGain * 100)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.1"
                    value={micGain}
                    onChange={(e) => setMicGain(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-ew-resize focus:outline-none"
                  />
                </div>

                {/* Audio Check / Speaker Test */}
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-white/80 block">فحص الصوت والمكبر</span>
                  <button
                    type="button"
                    onClick={() => {
                      callAudio.playConnectedChime();
                      handleUnblockAudio();
                    }}
                    className="w-full py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-xl text-purple-200 text-[10px] font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? '🔊 تجربة رنين المكبر وفك كتم المتصفح' : '🔊 Test Speaker Output'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Autoplay Unblock Overlay Floating Banner */}
          {call.status === 'connected' && autoplayBlocked && (
            <div className="absolute top-20 left-0 right-0 flex justify-center z-[150] pointer-events-none">
              <button
                type="button"
                onClick={handleUnblockAudio}
                className="pointer-events-auto bg-amber-500 hover:bg-amber-400 text-black font-black text-xs py-2.5 px-5 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-2.5 animate-bounce border-2 border-white cursor-pointer transition-all active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-black animate-pulse" />
                <span>{language === 'ar' ? '🔇 كتم المتصفح الصوت تلقائياً — اضغط هنا لتفعيل الصوت فوراً' : '🔇 Browser muted audio — Click here to unmute'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-8 flex items-center justify-between bg-gradient-to-t from-black to-black/60 relative z-[100] border-t border-white/10">
          {call.status === 'incoming' ? (
            <div className="flex items-center justify-center gap-6 w-full">
              <button 
                onClick={handleEndCall}
                type="button"
                className="px-8 py-4 bg-red-500/15 border border-red-500/30 hover:bg-red-600 hover:text-white active:scale-95 text-red-400 font-black rounded-2xl flex items-center gap-3 transition-all tracking-wider uppercase text-xs shadow-lg cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>{language === 'ar' ? 'رفض المكالمة' : 'Decline'}</span>
              </button>
              <button 
                onClick={onAccept}
                type="button"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black font-black rounded-2xl flex items-center gap-3 transition-all tracking-wider uppercase text-xs shadow-[0_0_40px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                {call.type === 'video' ? <Video className="w-5 h-5 fill-black" /> : <Phone className="w-5 h-5 fill-black" />}
                <span>{language === 'ar' ? 'قبول والرد' : 'Accept Link'}</span>
              </button>
            </div>
          ) : call.status === 'calling' ? (
            <div className="flex items-center justify-center gap-4 w-full">
              <button 
                onClick={handleEndCall}
                type="button"
                className="px-8 py-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black rounded-2xl flex items-center gap-3 transition-all tracking-wider uppercase text-xs shadow-[0_0_35px_rgba(239,68,68,0.4)] cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>{language === 'ar' ? 'إلغاء الاتصال' : 'Cancel Call'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Left Controls: Mic & Video Toggle */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
                    isMuted 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                >
                  {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>

                {call.type === 'video' && (
                  <button 
                    onClick={() => setIsVideoOff(!isVideoOff)} 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
                      isVideoOff 
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-white/10 border-white/10 hover:bg-white/20 text-white'
                    }`}
                    title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-purple-400" />}
                  </button>
                )}
              </div>

              {/* Center: End Call button */}
              <button 
                onClick={handleEndCall}
                type="button"
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(239,68,68,0.5)] cursor-pointer"
                title={language === 'ar' ? 'إنهاء المكالمة' : 'Hang Up'}
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Right Controls: Fullscreen, Settings */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                
                <button 
                  onClick={() => setShowMediaSettings(!showMediaSettings)}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    showMediaSettings 
                      ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                      : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                  }`}
                  title="Audio & Video Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
