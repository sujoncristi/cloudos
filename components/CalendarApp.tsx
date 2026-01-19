
import React, { useState } from 'react';

const CalendarApp: React.FC = () => {
  const [date, setDate] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const monthName = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  const prevMonth = () => setDate(new Date(year, date.getMonth() - 1, 1));
  const nextMonth = () => setDate(new Date(year, date.getMonth() + 1, 1));

  const days = [];
  const startDay = firstDayOfMonth(year, date.getMonth());
  const totalDays = daysInMonth(year, date.getMonth());
  
  // Fill empty slots
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-16 md:h-20 border-b border-r border-black/5 dark:border-white/5 opacity-20"></div>);
  }
  
  // Fill days
  for (let d = 1; d <= totalDays; d++) {
    const isToday = d === new Date().getDate() && date.getMonth() === new Date().getMonth() && year === new Date().getFullYear();
    days.push(
      <div key={d} className={`h-16 md:h-20 border-b border-r border-black/5 dark:border-white/5 p-2 transition-colors hover:bg-blue-500/5 ${isToday ? 'bg-blue-500/10' : ''}`}>
        <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700 dark:text-white/70'}`}>
          {d}
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      <div className="p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-black/20">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">{monthName} <span className="text-blue-600">{year}</span></h2>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Neural Chronology</p>
        </div>
        <div className="flex space-x-2">
           <button onClick={prevMonth} className="p-2 rounded-xl bg-white dark:bg-white/10 border border-black/5 shadow-sm hover:scale-105 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" /></svg>
           </button>
           <button onClick={nextMonth} className="p-2 rounded-xl bg-white dark:bg-white/10 border border-black/5 shadow-sm hover:scale-105 active:scale-95 transition-all">
              <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" /></svg>
           </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 border-l border-t border-black/5 dark:border-white/5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center border-b border-r border-black/5 dark:border-white/5 bg-gray-100/50 dark:bg-black/40">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{day}</span>
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CalendarApp;
