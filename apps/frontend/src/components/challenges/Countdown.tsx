/*
 * Purpose: Interactive countdown component for challenge deadlines.
 * Author: Antigravity Pair Programmer
 * Date: 2026-08-14
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  deadline: string | Date;
}

export function Countdown({ deadline }: CountdownProps): JSX.Element {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(deadline) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft.isOver) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 border border-red-500/20 text-sm font-semibold">
        <Clock className="h-4 w-4" />
        <span>Submission Period Closed</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Mins' },
        { value: timeLeft.seconds, label: 'Secs' }
      ].map((block) => (
        <div key={block.label} className="bg-white/5 border border-white/5 rounded-xl p-2.5 backdrop-blur-sm">
          <div className="text-xl font-black text-brand-primary tracking-tight">
            {String(block.value).padStart(2, '0')}
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold mt-0.5">
            {block.label}
          </div>
        </div>
      ))}
    </div>
  );
}
