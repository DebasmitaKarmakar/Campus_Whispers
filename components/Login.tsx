
import React, { useState } from 'react';
import { authenticateUser } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !enrollment) {
      setError('Required: Provide Student/Staff Credentials');
      setIsLoading(false);
      return;
    }

    try {
      const user = await authenticateUser(email, enrollment);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Unauthorized Access: Entry not in whitelist');
      }
    } catch (err) {
      setError('System Error: Authentication service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-nfsu-navy/10 overflow-hidden">
      <div className="bg-nfsu-navy p-10 text-white text-center border-b-4 border-nfsu-gold">
        <div className="w-16 h-16 bg-white rounded-xl mx-auto mb-6 flex items-center justify-center p-2 shadow-xl border-2 border-nfsu-gold">
           <span className="text-nfsu-navy font-black text-base">NFSU</span>
        </div>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Students Help Portal</h2>
        <p className="text-nfsu-gold text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Community Access</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div>
          <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Campus Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-nfsu-navy outline-none transition-all font-bold text-sm"
            placeholder="USER@GMAIL.COM"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="enrollment" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Enrollment ID / Student ID
          </label>
          <input
            id="enrollment"
            type="text"
            value={enrollment}
            onChange={(e) => setEnrollment(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-nfsu-navy outline-none transition-all font-mono font-black tracking-widest text-sm"
            placeholder="0000"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <p className="text-[10px] text-red-700 font-black uppercase tracking-tight">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 bg-nfsu-navy text-white font-black rounded-2xl shadow-xl shadow-nfsu-navy/20 hover:bg-nfsu-maroon transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-xs border-b-4 border-black/20"
        >
          {isLoading ? 'Processing...' : 'Enter Portal'}
        </button>
      </form>
    </div>
  );
};
