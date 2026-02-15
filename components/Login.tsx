
import React, { useState } from 'react';
import { authenticateUser } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid Credential: Enter a valid campus email');
      return;
    }

    if (!institutionalId) {
      setError('Required: Provide Institutional ID');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(email, institutionalId);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Unauthorized Access: Identity not found in whitelist');
      }
    } catch (err) {
      setError('System Error: Authentication service synchronization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl px-4 py-12 flex flex-col items-center">
      <div className="w-full bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,33,71,0.2)] border-2 border-nfsu-gold/20 overflow-hidden relative">
        {/* Triple branding accent */}
        <div className="flex h-2 w-full">
          <div className="flex-1 bg-nfsu-navy"></div>
          <div className="flex-1 bg-nfsu-gold"></div>
          <div className="flex-1 bg-nfsu-maroon"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Brand Panel */}
          <div className="bg-nfsu-navy p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-institutional-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center p-3 shadow-[0_0_30px_rgba(197,179,88,0.4)] border-4 border-nfsu-gold/40 transform hover:scale-110 transition-transform">
                 <span className="text-nfsu-navy font-black text-2xl italic leading-none">NFSU</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-4">
                Campus<br/><span className="text-nfsu-gold">Whispers</span>
              </h2>
              <div className="w-12 h-1 bg-nfsu-gold mx-auto mb-6"></div>
              <p className="text-nfsu-gold/70 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                Central Authority<br/>Authentication Terminal
              </p>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-10 lg:p-14 bg-white">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-navy transition-colors">
                    University Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-nfsu-paper border-2 border-slate-100 focus:border-nfsu-navy focus:bg-white outline-none transition-all font-bold text-sm shadow-inner"
                    placeholder="name@nfsu.ac.in"
                    disabled={isLoading}
                  />
                </div>

                <div className="group">
                  <label htmlFor="institutionalId" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-maroon transition-colors">
                    Institutional ID
                  </label>
                  <input
                    id="institutionalId"
                    type="text"
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    className="w-full px-6 py-5 rounded-2xl bg-nfsu-paper border-2 border-slate-100 focus:border-nfsu-maroon focus:bg-white outline-none transition-all font-mono font-black tracking-[0.3em] text-sm shadow-inner uppercase"
                    placeholder="ID NUMBER"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-nfsu-maroon p-4 rounded-r-2xl animate-shake">
                  <p className="text-[9px] text-nfsu-maroon font-black uppercase tracking-tight">{error}</p>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full py-6 bg-nfsu-navy text-white font-black rounded-2xl shadow-xl overflow-hidden transition-all hover:bg-nfsu-maroon disabled:opacity-50 uppercase tracking-[0.25em] text-[10px] border-b-4 border-black/20"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isLoading ? 'Verifying...' : 'Authorize Entry'}
                    {!isLoading && <span className="text-nfsu-gold">→</span>}
                  </span>
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(true)}
                  className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-nfsu-navy transition-colors"
                >
                  Request Institutional Access
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
        <div className="w-8 h-8 rounded border border-nfsu-gold"></div>
        <div className="w-8 h-8 rounded border border-nfsu-navy"></div>
        <div className="w-8 h-8 rounded border border-nfsu-maroon"></div>
      </div>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-12 max-w-md w-full border-4 border-nfsu-gold shadow-[0_0_100px_rgba(197,179,88,0.2)] animate-slideUp">
             <div className="w-16 h-1 bg-nfsu-gold mb-8"></div>
             <h3 className="text-3xl font-black text-nfsu-navy uppercase italic mb-6">Missing Identity</h3>
             <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed mb-10">
               Access is restricted to verified NFSU entities. If your credentials are valid but rejected, please report to the IT coordinator.
             </p>
             <div className="space-y-4">
               <div className="p-6 bg-nfsu-paper rounded-2xl border-2 border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-nfsu-navy rounded-xl flex items-center justify-center text-white text-lg">✉</div>
                 <div>
                   <div className="text-[9px] font-black text-nfsu-gold uppercase mb-0.5">Direct Support</div>
                   <div className="text-xs font-black text-nfsu-navy">auth@nfsu.ac.in</div>
                 </div>
               </div>
               <button 
                onClick={() => setShowRequestModal(false)}
                className="w-full py-5 bg-nfsu-navy text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl border-b-4 border-black/20 active:translate-y-1 active:border-b-0 transition-all"
               >
                 Return to Login
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
