import React from 'react';
import { Star } from 'lucide-react';

interface DatePillsBarProps {
  selectedDay: string;
  onSelectDay: (day: string) => void;
  isDarkMode: boolean;
}

export const DatePillsBar: React.FC<DatePillsBarProps> = ({
  selectedDay,
  onSelectDay,
  isDarkMode,
}) => {
  const daysList = [
    { day: 'Sun', date: '22', star: false },
    { day: 'Mon', date: '23', star: true },
    { day: 'Tue', date: '24', star: true },
    { day: 'Wed', date: '25', star: false },
    { day: 'Thu', date: '26', star: true },
    { day: 'Fri', date: '27', star: true },
  ];

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 scrollbar-none">
      {daysList.map((item) => {
        const isSelected = selectedDay === item.day;

        return (
          <button
            key={item.day}
            onClick={() => onSelectDay(item.day)}
            className={`flex-1 min-w-[58px] py-3 px-2 rounded-[24px] border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
              isSelected
                ? isDarkMode
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105 font-bold'
                  : 'bg-black text-white border-black shadow-lg shadow-black/20 scale-105 font-bold'
                : isDarkMode
                ? 'bg-[#181824] text-slate-300 border-slate-800 hover:border-slate-700'
                : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
            }`}
          >
            {item.star && (
              <Star
                className={`w-3 h-3 ${
                  isSelected
                    ? isDarkMode
                      ? 'fill-black text-black'
                      : 'fill-white text-white'
                    : 'fill-slate-400 text-slate-400'
                }`}
              />
            )}
            <span className="text-[11px] font-semibold tracking-tight">{item.day}</span>
            <span className="text-sm font-black tracking-tight">{item.date}</span>
          </button>
        );
      })}
    </div>
  );
};
