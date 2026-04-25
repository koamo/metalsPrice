'use client';

import React, { useEffect, useState } from 'react';

interface ClockProps {
  timezone?: string;
}

const Clock: React.FC<ClockProps> = ({ timezone = "Asia/Seoul" }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
      setTime(tzDate);
    }, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours % 12) * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-56 h-56 rounded-full glass gold-border flex items-center justify-center shadow-xl animate-pulse-gold">
        {/* Clock Center Pin */}
        <div className="absolute w-3 h-3 bg-gold rounded-full z-20 shadow-[0_0_10px_rgba(212,175,55,1)]" />
        
        {/* Markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-3 bg-gold/40"
            style={{
              transform: `rotate(${i * 30}deg) translateY(-95px)`,
            }}
          />
        ))}

        {/* Hour Hand Container */}
        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out"
          style={{ transform: `rotate(${hourDeg}deg)` }}
        >
          <div className="w-1.5 h-14 bg-gold rounded-full shadow-lg" style={{ marginBottom: '56px' }} />
        </div>

        {/* Minute Hand Container */}
        <div
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out"
          style={{ transform: `rotate(${minuteDeg}deg)` }}
        >
          <div className="w-1 h-20 bg-gold/70 rounded-full shadow-md" style={{ marginBottom: '80px' }} />
        </div>

        {/* Second Hand Container */}
        <div
          className="absolute w-full h-full flex items-center justify-center"
          style={{ transform: `rotate(${secondDeg}deg)` }}
        >
          <div className="w-0.5 h-22 bg-red-500/80 rounded-full shadow-sm" style={{ marginBottom: '88px' }} />
        </div>

        {/* Decorative inner circle */}
        <div className="absolute w-44 h-44 rounded-full border border-gold/5" />
      </div>
      
      <div className="mt-6 text-4xl font-light gold-text tracking-[0.2em] drop-shadow-lg">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
    </div>
  );
};

export default Clock;
