
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const WeatherApp: React.FC = () => {
  const [city, setCity] = useState('San Francisco');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchWeatherInsight = async (targetCity: string) => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Provide current mock weather data for ${targetCity} in a JSON format including temperature (C), condition (e.g. Sunny, Rainy), humidity, windSpeed, and a 3-day forecast with low/high temps and condition labels. Only return valid JSON.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setWeatherData(data);
      setCity(targetCity);
    } catch (err) {
      console.error("Weather Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherInsight(city);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      fetchWeatherInsight(search.trim());
      setSearch('');
    }
  };

  const getBgGradient = () => {
    if (!weatherData) return 'from-blue-400 to-blue-600';
    const cond = weatherData.condition?.toLowerCase() || '';
    if (cond.includes('sunny') || cond.includes('clear')) return 'from-orange-400 via-orange-500 to-blue-500';
    if (cond.includes('rain') || cond.includes('storm')) return 'from-slate-700 via-slate-800 to-indigo-900';
    if (cond.includes('cloud')) return 'from-blue-300 via-blue-400 to-gray-500';
    return 'from-blue-500 via-indigo-500 to-purple-600';
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br ${getBgGradient()} text-white p-8 overflow-y-auto no-scrollbar`}>
      <form onSubmit={handleSearch} className="mb-10 flex justify-center">
        <div className="relative w-full max-w-md group">
          <input 
            type="text" 
            placeholder="Search Global Climate..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-3xl border border-white/30 rounded-full py-3 px-6 pl-12 text-sm font-bold placeholder:text-white/60 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3" /></svg>
        </div>
      </form>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
           <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Sensors</p>
        </div>
      ) : weatherData ? (
        <div className="flex-1 flex flex-col">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">{city}</h1>
            <p className="text-8xl md:text-9xl font-thin tracking-tighter mb-4">{weatherData.temperature}°</p>
            <p className="text-xl font-bold uppercase tracking-widest opacity-80">{weatherData.condition}</p>
            <div className="flex items-center justify-center space-x-6 mt-6 opacity-60 text-[10px] font-black uppercase tracking-[0.2em]">
               <span>H: {weatherData.temperature + 4}°</span>
               <span>L: {weatherData.temperature - 3}°</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center">
                 <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeWidth="2.5" /></svg>
                 Dynamic Insight
               </h3>
               <p className="text-sm font-medium leading-relaxed italic">The atmospheric pressure in {city} is currently stabilizing. Expect a refreshing flow from the {weatherData.windSpeed} km/h currents.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 border border-white/20">
                  <span className="text-[9px] font-black opacity-40 uppercase block mb-2">Humidity</span>
                  <span className="text-2xl font-black">{weatherData.humidity}%</span>
               </div>
               <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 border border-white/20">
                  <span className="text-[9px] font-black opacity-40 uppercase block mb-2">Wind</span>
                  <span className="text-2xl font-black">{weatherData.windSpeed} <span className="text-sm">km/h</span></span>
               </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-[32px] p-8 border border-white/20 shadow-2xl overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">Neural 3-Day Forecast</h3>
            <div className="space-y-8">
              {weatherData.forecast?.map((day: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <span className="w-16 text-sm font-black uppercase tracking-widest opacity-80">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}</span>
                  <div className="flex-1 mx-4 flex items-center justify-center">
                    <span className="text-sm font-bold opacity-60">{day.condition}</span>
                  </div>
                  <div className="flex space-x-6 w-24 justify-end">
                    <span className="text-sm font-black opacity-40">{day.low}°</span>
                    <div className="w-12 h-1 bg-white/20 rounded-full relative overflow-hidden">
                       <div className="absolute inset-y-0 left-1/4 right-1/4 bg-white/60 rounded-full" />
                    </div>
                    <span className="text-sm font-black">{day.high}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      
      <div className="mt-20 text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">CloudOS Climate Sync v1.0</p>
      </div>
    </div>
  );
};

export default WeatherApp;
