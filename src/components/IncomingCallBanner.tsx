import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Video, Mic, CheckCircle2, Shield, Bell } from 'lucide-react';
import { callAudio } from '../utils/callAudio';

export interface IncomingCallData {
  callId: string;
  caller: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  type: 'voice' | 'video';
  timestamp: number;
}

interface IncomingCallBannerProps {
  incomingCall: IncomingCallData | null;
  language?: 'ar' | 'en';
  onAccept: (call: IncomingCallData) => void;
  onDecline: (call: IncomingCallData) => void;
}

export function IncomingCallBanner({
  incomingCall,
  language = 'ar',
  onAccept,
  onDecline
}: IncomingCallBannerProps) {
  useEffect(() => {
    if (incomingCall) {
      callAudio.playIncomingRingtone();
    } else {
      callAudio.stopAllSounds();
    }
    return () => {
      callAudio.stopAllSounds();
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-110 z-[9999] pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950/95 border-2 border-emerald-500/40 p-5 shadow-[0_0_50px_rgba(16,185,129,0.35)] backdrop-blur-2xl text-white">
          {/* Glowing pulse background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-purple-500/10 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Caller avatar with ringing ripple animation */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2.5 rounded-full border-2 border-emerald-500/50 animate-ping [animation-duration:1.5s]" />
              <div className="absolute -inset-1.5 rounded-full border border-emerald-400 animate-pulse" />
              <img
                src={incomingCall.caller.avatar}
                alt={incomingCall.caller.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400 relative z-10 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center z-20 shadow-md">
                {incomingCall.type === 'video' ? <Video className="w-3.5 h-3.5 fill-black" /> : <Phone className="w-3.5 h-3.5 fill-black" />}
              </div>
            </div>

            {/* Caller info */}
            <div className="flex-1 min-w-0" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-sm text-white truncate max-w-[160px]">
                  {incomingCall.caller.name}
                </span>
                {incomingCall.caller.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 animate-pulse uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {incomingCall.type === 'video' 
                    ? (language === 'ar' ? 'مكالمة فيديو واردة 📹' : 'Incoming Video Call 📹')
                    : (language === 'ar' ? 'مكالمة صوتية واردة 📞' : 'Incoming Voice Call 📞')}
                </span>
              </div>
              
              <p className="text-[10px] text-white/50 font-mono mt-0.5 truncate">
                {language === 'ar' ? 'يرغب بالتواصل المباشر معك الآن' : 'Requests live neural audio & video link'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
            {/* Decline Button */}
            <button
              type="button"
              onClick={() => onDecline(incomingCall)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-600 hover:text-white border border-red-500/30 active:scale-95 transition-all text-red-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <PhoneOff className="w-4 h-4" />
              <span>{language === 'ar' ? 'رفض' : 'Decline'}</span>
            </button>

            {/* Accept Button */}
            <button
              type="button"
              onClick={() => onAccept(incomingCall)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition-all text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              {incomingCall.type === 'video' ? <Video className="w-4 h-4 fill-black" /> : <Phone className="w-4 h-4 fill-black" />}
              <span>{language === 'ar' ? 'رد وقبول الاتصال' : 'Accept Call'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
