"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatTime } from "@/lib/utils";

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
  timerSound: boolean;
  timerVibration: boolean;
  timerFlash: boolean;
}

export function RestTimer({
  duration,
  onComplete,
  onSkip,
  timerSound,
  timerVibration,
  timerFlash,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [active, setActive] = useState(true);
  const [flashActive, setFlashActive] = useState(false);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playBeep = useCallback(() => {
    if (!timerSound) return;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.value = 0.15;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1100;
        osc2.type = "square";
        gain2.gain.value = 0.15;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
        // Close context after sounds finish
        setTimeout(() => ctx.close(), 500);
      }, 300);
    } catch {
      // Audio not available
    }
  }, [timerSound]);

  const vibrate = useCallback(() => {
    if (!timerVibration) return;
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [timerVibration]);

  const flash = useCallback(() => {
    if (!timerFlash) return;
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 500);
  }, [timerFlash]);

  useEffect(() => {
    if (!active) return;

    function tick() {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, duration - elapsed);
      setRemaining(Math.ceil(left));

      if (left <= 0) {
        setActive(false);
        playBeep();
        vibrate();
        flash();
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, duration, onComplete, playBeep, vibrate, flash]);

  const progress = remaining / duration;

  return (
    <>
      {flashActive && (
        <div className="fixed inset-0 bg-term-green/20 z-[200] pointer-events-none screen-flash" />
      )}

      <div className="border border-term-green p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-term-green uppercase tracking-widest">
            rest timer
          </span>
          <button
            onClick={() => {
              setActive(false);
              onSkip();
            }}
            className="text-[10px] text-term-gray-light uppercase tracking-widest hover:text-term-white"
          >
            [skip]
          </button>
        </div>

        <div className="text-center mb-3">
          <span className="text-4xl font-bold text-term-green font-mono tabular-nums">
            {formatTime(remaining)}
          </span>
        </div>

        <div className="h-1 bg-term-gray">
          <div
            className="h-full bg-term-green transition-all duration-200"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
