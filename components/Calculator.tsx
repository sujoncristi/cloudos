
import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const handleNumber = (num: string) => {
    if (display === '0' || shouldReset) {
      setDisplay(num);
      setShouldReset(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setShouldReset(true);
  };

  const calculate = () => {
    try {
      const fullEq = equation + display;
      // Note: In a real app, use a proper math parser, eval is used here for simplicity in this demo environment
      const result = eval(fullEq.replace('×', '*').replace('÷', '/'));
      setDisplay(String(result));
      setEquation('');
      setShouldReset(true);
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const toggleSign = () => {
    setDisplay(String(Number(display) * -1));
  };

  const percent = () => {
    setDisplay(String(Number(display) / 100));
  };

  const Btn = ({ label, onClick, className = "", variant = "number" }: any) => {
    const base = "h-14 md:h-16 flex items-center justify-center text-lg md:text-xl font-medium transition-all active:brightness-75";
    const variants: any = {
      number: "bg-gray-200/50 dark:bg-white/10 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20",
      operator: "bg-orange-500 text-white hover:bg-orange-400 font-bold text-2xl",
      special: "bg-gray-300/50 dark:bg-zinc-700/50 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-zinc-600/50"
    };

    return (
      <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
        {label}
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#1C1C1E] text-white">
      <div className="flex-1 flex flex-col justify-end items-end p-6 bg-black/20">
        <div className="text-gray-500 text-sm h-6 overflow-hidden uppercase tracking-widest font-black">{equation}</div>
        <div className="text-5xl md:text-6xl font-light tracking-tight truncate w-full text-right">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-[1px] bg-black/10 shrink-0">
        <Btn label="AC" onClick={clear} variant="special" />
        <Btn label="+/-" onClick={toggleSign} variant="special" />
        <Btn label="%" onClick={percent} variant="special" />
        <Btn label="÷" onClick={() => handleOperator('/')} variant="operator" />

        <Btn label="7" onClick={() => handleNumber('7')} />
        <Btn label="8" onClick={() => handleNumber('8')} />
        <Btn label="9" onClick={() => handleNumber('9')} />
        <Btn label="×" onClick={() => handleOperator('*')} variant="operator" />

        <Btn label="4" onClick={() => handleNumber('4')} />
        <Btn label="5" onClick={() => handleNumber('5')} />
        <Btn label="6" onClick={() => handleNumber('6')} />
        <Btn label="-" onClick={() => handleOperator('-')} variant="operator" />

        <Btn label="1" onClick={() => handleNumber('1')} />
        <Btn label="2" onClick={() => handleNumber('2')} />
        <Btn label="3" onClick={() => handleNumber('3')} />
        <Btn label="+" onClick={() => handleOperator('+')} variant="operator" />

        <Btn label="0" onClick={() => handleNumber('0')} className="col-span-2" />
        <Btn label="." onClick={() => handleNumber('.')} />
        <Btn label="=" onClick={calculate} variant="operator" />
      </div>
    </div>
  );
};

export default Calculator;
