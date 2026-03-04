"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// ==========================================================
// 【1】タイマーの画面 (こちらが現在の「主役」)
// ==========================================================
export default function TimerPage() {
  const [seconds, setSeconds] = useState(300); // 5分 = 300秒
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">LT Timer</h1>
      <div className={`text-9xl font-mono mb-12 ${seconds < 60 && seconds > 0 ? "text-red-500 animate-pulse" : ""}`}>
        {formatTime(seconds)}
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-4 rounded-full text-2xl font-bold transition-all ${isActive ? "bg-orange-500" : "bg-blue-600"}`}
        >
          {isActive ? "PAUSE" : "START"}
        </button>
        <button 
          onClick={() => { setSeconds(300); setIsActive(false); }}
          className="px-8 py-4 bg-gray-600 rounded-full text-2xl"
        >
          RESET
        </button>
      </div>
    </div>
  );
}

// ==========================================================
// 【2】Next.js初期画面 (「控え」として残しておく)
// ==========================================================
// 比べるために残す場合は、頭の「export default」を消しておきます
function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
        </div>
      </main>
    </div>
  );
}