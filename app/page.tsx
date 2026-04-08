"use client";
import { useEffect, useRef, useState } from "react";

// ==========================================================
// 【1】タイマーの画面 (こちらが現在の「主役」)
// ==========================================================
export default function TimerPage() {
  const [seconds, setSeconds] = useState(300);
  const [duration, setDuration] = useState(300);
  const [customInput, setCustomInput] = useState("300");
  const [isActive, setIsActive] = useState(false);
  const endTimeRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const secs = value % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const playBell = () => {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
  };

  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + seconds * 1000;
    }

    const tick = window.setInterval(() => {
      if (!endTimeRef.current) return;
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining <= 0) {
        setIsActive(false);
        endTimeRef.current = null;
      }
    }, 200);

    return () => window.clearInterval(tick);
  }, [isActive, seconds]);

  useEffect(() => {
    if (seconds === 0) {
      playBell();
    }
  }, [seconds]);

  const handleStartPause = () => {
    const startSeconds = seconds === 0 ? duration : seconds;
    if (seconds === 0) {
      setSeconds(duration);
    }
    setIsActive((current) => !current);
    if (!isActive) {
      endTimeRef.current = Date.now() + startSeconds * 1000;
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(duration);
    endTimeRef.current = null;
  };

  const applyCustomTime = () => {
    const parsed = Math.max(1, Math.min(3600, parseInt(customInput, 10) || 1));
    setDuration(parsed);
    setSeconds(parsed);
    setCustomInput(String(parsed));
    setIsActive(false);
    endTimeRef.current = null;
  };

  const setPreset = (value: number) => {
    setDuration(value);
    setSeconds(value);
    setCustomInput(String(value));
    setIsActive(false);
    endTimeRef.current = null;
  };

  const progressPercent = duration ? Math.max(0, Math.min(100, (seconds / duration) * 100)) : 0;
  const isUrgent = seconds <= 10 && seconds > 0;
  const isWarning = seconds <= 60 && seconds > 10;

  return (
    <div className="group relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          seconds === 0 ? "bg-red-950/95" : isUrgent ? "bg-red-950/80" : isWarning ? "bg-amber-950/80" : "bg-emerald-950/90"
        }`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.06),_transparent_18%)]" />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-10 text-sm uppercase tracking-[0.35em] text-white/70">LT Timer</div>
        <div className="text-[clamp(5rem,12vw,12rem)] font-mono font-semibold tracking-tight text-white drop-shadow-[0_0_25px_rgba(0,0,0,0.45)]">
          <span className={isUrgent ? "animate-pulse text-red-200" : isWarning ? "text-amber-200" : "text-white"}>{formatTime(seconds)}</span>
        </div>
        <div className="mt-4 text-base text-white/80">{seconds === 0 ? "時間です！" : `残り ${seconds} 秒`}</div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-8">
          <div className="pointer-events-auto w-full max-w-5xl rounded-full bg-white/10 p-4 opacity-0 transition duration-300 group-hover:opacity-100 sm:opacity-100">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr] lg:grid-cols-[2fr_1fr]">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 shadow-xl backdrop-blur">
                <div className="flex flex-wrap items-center gap-3">
                  {[180, 300, 600].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPreset(preset)}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/10"
                    >
                      {preset / 60}分
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex-1 text-left text-sm text-white/80">
                    カスタム (秒)
                    <input
                      type="number"
                      min={1}
                      max={3600}
                      step={1}
                      value={customInput}
                      onChange={(event) => setCustomInput(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-lg text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={applyCustomTime}
                    className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-blue-400"
                  >
                    設定
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handleStartPause}
                    className={`w-full rounded-3xl px-5 py-4 text-lg font-semibold uppercase tracking-[0.12em] text-white transition ${isActive ? "bg-orange-500 hover:bg-orange-400" : "bg-emerald-500 hover:bg-emerald-400"}`}
                  >
                    {isActive ? "一時停止" : seconds === 0 ? "再スタート" : "開始"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full rounded-3xl border border-white/15 bg-white/5 px-5 py-4 text-lg font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/10 sm:w-auto"
                  >
                    リセット
                  </button>
                </div>
                <div className="mt-4 rounded-3xl bg-white/5 p-4 text-sm text-white/75">
                  <div>プログレス: {Math.round(progressPercent)}%</div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        seconds === 0 ? "from-red-500 to-red-400" : isUrgent ? "from-red-500 to-orange-400" : isWarning ? "from-amber-400 to-yellow-300" : "from-emerald-400 to-teal-400"
                      } transition-all duration-300`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
