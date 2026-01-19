
import React from 'react';
import { User, FileItem } from '../types';

interface DashboardProps {
  stats: {
    totalUsers: number;
    totalFiles: number;
    activeSessions: number;
    totalStorageUsed: number;
  };
  users: User[];
  files: FileItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, users, files }) => {
  const recentFiles = [...files].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="h-full p-10 bg-gradient-to-br from-white/10 to-white/5 dark:from-black/60 dark:to-black/40 overflow-y-auto no-scrollbar backdrop-blur-3xl">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white mb-2">Systems Hub</h2>
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em]">Operational Telemetry v5.1</p>
        </div>
        <div className="px-5 py-3 bg-white/90 dark:bg-white/10 rounded-[20px] border border-white/40 shadow-2xl flex items-center space-x-4">
           <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,1)]" />
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-700 dark:text-gray-300">System Nominal</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Cloud Entities', val: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Active Links', val: stats.activeSessions, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Neural Assets', val: stats.totalFiles, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Vault Load', val: `${(stats.totalStorageUsed / (1024*1024)).toFixed(1)} MB`, color: 'text-orange-500', bg: 'bg-orange-500/5' }
        ].map((s, i) => (
          <div key={i} className={`p-8 ${s.bg} rounded-[32px] border border-white/40 dark:border-white/10 shadow-xl group hover:scale-[1.03] transition-all duration-500 backdrop-blur-md`}>
            <p className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.15em] mb-3">{s.label}</p>
            <p className={`text-5xl font-black tracking-tighter ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[12px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.25em] flex items-center">
               <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
               Recent File Ingestions
            </h3>
            <button className="text-[10px] font-black text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest">View All Files</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentFiles.map(f => (
              <div key={f.id} className="group p-6 bg-white/60 dark:bg-white/5 rounded-[28px] flex items-center justify-between border border-white/40 dark:border-white/10 shadow-lg hover:shadow-2xl hover:translate-y-[-4px] transition-all cursor-default backdrop-blur-md">
                <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-[22%] bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {f.isFolder ? '📂' : '📄'}
                  </div>
                  <div>
                    <p className="text-[13px] font-black dark:text-white tracking-tight mb-0.5">{f.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{new Date(f.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 opacity-60 uppercase tracking-widest mb-0.5">{f.type}</p>
                   <p className="text-[10px] font-bold text-gray-400">{(f.size/1024).toFixed(0)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="text-[12px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-[0.25em] flex items-center">
             <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
             Core Distribution
          </h3>
          <div className="p-10 bg-white/60 dark:bg-white/5 rounded-[40px] border border-white/40 dark:border-white/10 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group backdrop-blur-md min-h-[380px]">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity opacity-50" />
             <div className="w-48 h-48 rounded-full border-[20px] border-white/10 dark:border-white/5 flex items-center justify-center relative shadow-2xl">
                <div className="absolute inset-[-4px] rounded-full border-[4px] border-blue-500 border-t-transparent animate-spin duration-[5s]" />
                <div className="absolute inset-[-4px] rounded-full border-[4px] border-purple-500 border-b-transparent animate-spin duration-[8s] scale-[0.85]" />
                <div className="text-center z-10">
                  <span className="text-5xl font-black dark:text-white tracking-tighter">{stats.totalUsers}</span>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mt-2 tracking-[0.3em]">Verified</p>
                </div>
             </div>
             <div className="mt-10 text-center relative z-10">
               <p className="text-[11px] font-black text-gray-800 dark:text-gray-300 uppercase tracking-[0.2em] mb-2">Network Nodes</p>
               <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 max-w-[180px]">All identities are currently synchronized with the neural core.</p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
