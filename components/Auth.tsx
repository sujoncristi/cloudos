
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [roleMode, setRoleMode] = useState<'USER' | 'ADMIN'>('USER');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Static Admin Check
    if (roleMode === 'ADMIN') {
      if (email === 'admin@cloudos.io' && password === 'admin') {
        const adminUser: User = {
          id: 'root-0',
          username: 'System Admin',
          email: 'admin@cloudos.io',
          role: 'PREMIUM',
          status: 'ACTIVE',
          storageUsed: 0,
          isAdmin: true
        };
        localStorage.setItem('cloudos_user', JSON.stringify(adminUser));
        onLogin(adminUser);
        return;
      } else {
        alert("Root Credentials Invalid: Terminal restricted.");
        return;
      }
    }

    const registry = JSON.parse(localStorage.getItem('cloudos_global_registry') || '[]');
    
    if (isLogin) {
      const existingUser = registry.find((u: any) => u.email === email && u.isAdmin === false);
      if (existingUser) {
        localStorage.setItem('cloudos_user', JSON.stringify(existingUser));
        onLogin(existingUser);
      } else {
        alert("Authentication Failed: User identity not found.");
      }
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: username || email.split('@')[0],
        email: email,
        role: 'FREE' as UserRole,
        status: 'ACTIVE',
        storageUsed: 0,
        isAdmin: false
      };

      const updatedRegistry = [...registry, newUser];
      localStorage.setItem('cloudos_global_registry', JSON.stringify(updatedRegistry));
      localStorage.setItem('cloudos_user', JSON.stringify(newUser));
      onLogin(newUser);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-md mx-auto">
      {/* Role Toggle */}
      <div className="flex bg-black/5 p-1 rounded-2xl mb-12 w-full max-w-[280px]">
        <button 
          onClick={() => { setRoleMode('USER'); setIsLogin(true); }}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${roleMode === 'USER' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
        >
          Identity
        </button>
        <button 
          onClick={() => { setRoleMode('ADMIN'); setIsLogin(true); }}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${roleMode === 'ADMIN' ? 'bg-gray-900 shadow-xl text-white' : 'text-gray-400'}`}
        >
          System Root
        </button>
      </div>

      <div className={`w-24 h-24 rounded-[26%] shadow-2xl flex items-center justify-center mb-10 transition-all duration-500 ${roleMode === 'ADMIN' ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-indigo-700'}`}>
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={roleMode === 'ADMIN' ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.618A9.959 9.959 0 014.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"} />
        </svg>
      </div>

      <h2 className="text-4xl font-black text-gray-800 mb-2 tracking-tight">
        {roleMode === 'ADMIN' ? 'Root Terminal' : isLogin ? 'Establish Identity' : 'Core Registration'}
      </h2>
      <p className="text-gray-400 mb-10 text-center text-sm font-medium">
        {roleMode === 'ADMIN' ? 'Secure bypass for system management.' : 'Establish your digital footprint.'}
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {!isLogin && roleMode === 'USER' && (
          <input type="text" placeholder="Identity Alias" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 bg-white/60 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm" required />
        )}
        <input type="email" placeholder="Terminal ID (Email)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-4 bg-white/60 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm" required />
        <input type="password" placeholder="Access Key" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 bg-white/60 border border-black/5 rounded-[20px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm" required />
        <button type="submit" className={`w-full py-5 rounded-[20px] font-black text-sm transition-all shadow-2xl active:scale-95 flex items-center justify-center space-x-3 text-white ${roleMode === 'ADMIN' ? 'bg-gray-900 hover:bg-black' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <span>{isLogin ? 'Initiate Link' : 'Register Identity'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </form>

      {roleMode === 'USER' && (
        <button onClick={() => setIsLogin(!isLogin)} className="mt-8 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-blue-600 transition-colors">
          {isLogin ? "Generate New Instance" : "Return to Authenticator"}
        </button>
      )}

      {roleMode === 'ADMIN' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-black/5">
           <p className="text-[9px] text-gray-400 font-black uppercase text-center">Root Credentials: admin@cloudos.io / admin</p>
        </div>
      )}
    </div>
  );
};

export default Auth;
