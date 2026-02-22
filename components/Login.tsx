import React, { useState } from 'react';
import { authenticateUser } from '../services/authService';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { Images } from '@/src/assets/images';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [institutionalId, setInstitutionalId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanId = institutionalId.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Invalid Credential: Enter a valid campus email');
      return;
    }

    if (!cleanId) {
      setError('Required: Provide Institutional ID');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(cleanEmail, cleanId);
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

  const handleRequestSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    // Simulate administrative processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRequestSubmitted(true);
    setIsRequesting(false);
  };

  return (
    <div className="w-full max-w-2xl px-4 py-12 flex flex-col items-center">
      <div className="w-full bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,33,71,0.08)] border-2 border-slate-100/50 overflow-hidden relative">
        <div className="flex h-1.5 w-full">
          <div className="flex-1 bg-nfsu-navy"></div>
          <div className="flex-1 bg-nfsu-gold"></div>
          <div className="flex-1 bg-nfsu-maroon"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-nfsu-navy p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-institutional-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center p-3 shadow-2xl border-2 border-nfsu-gold/20 transform hover:scale-105 transition-all">
               <img src={Images.nfsuLogo} alt="NFSU Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none mb-4">
                Campus<br/><span className="text-nfsu-gold">Whispers</span>
              </h2>
              <div className="w-12 h-1 bg-nfsu-gold mx-auto mb-6"></div>
              <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                Central Authority<br/>Authentication Terminal
              </p>
            </div>
          </div>

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
                    className="w-full px-6 py-5 rounded-2xl bg-[#FFFBEB] border-2 border-amber-100/50 focus:border-nfsu-navy focus:bg-white outline-none transition-all font-bold text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder-slate-300"
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
                    className="w-full px-6 py-5 rounded-2xl bg-[#FFFBEB] border-2 border-amber-100/50 focus:border-nfsu-maroon focus:bg-white outline-none transition-all font-mono font-black tracking-[0.3em] text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] uppercase placeholder-slate-300"
                    placeholder="ID NUMBER"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="space-y-3">
                  <div className="bg-red-50 border-l-4 border-nfsu-maroon p-4 rounded-r-2xl animate-shake">
                    <p className="text-[9px] text-nfsu-maroon font-black uppercase tracking-tight">{error}</p>
                  </div>
                  {error.includes('whitelist') && (
                    <button 
                      type="button" 
                      onClick={() => dbService.clearData()}
                      className="text-[9px] font-black text-nfsu-navy underline decoration-nfsu-gold uppercase block text-center w-full"
                    >
                      Troubleshoot: Clear & Re-seed Whitelist
                    </button>
                  )}
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

      {/* Institutional Access Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[3rem] p-10 md:p-14 max-w-lg w-full shadow-2xl border-4 border-nfsu-gold animate-slideUp relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -rotate-12 translate-x-12 -translate-y-12 flex items-center justify-center opacity-40">
               <span className="text-[10px] font-black text-nfsu-navy">REQU</span>
            </div>

            {requestSubmitted ? (
              <div className="text-center py-10 space-y-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-nfsu-navy uppercase italic tracking-tighter">Request Logged</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4 leading-relaxed max-w-xs mx-auto">
                    Institutional enrollment request submitted to registry. Reference ID: <span className="text-nfsu-gold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                  </p>
                </div>
                <button 
                  onClick={() => { setShowRequestModal(false); setRequestSubmitted(false); }}
                  className="w-full py-5 bg-nfsu-navy text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-black/20"
                >
                  Return to Hub
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-nfsu-navy uppercase italic tracking-tighter">Enrollment Desk</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Identity Binding & Whitelist Authority</p>
                </div>

                <form onSubmit={handleRequestSubmission} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Email</label>
                    <input required type="email" className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black focus:border-nfsu-navy outline-none transition-all uppercase" placeholder="NAME@NFSU.AC.IN" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Access</label>
                    <textarea required className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-bold h-24 outline-none focus:border-nfsu-gold transition-all uppercase" placeholder="SPECIFY DEPARTMENT AND ENROLLMENT YEAR..."></textarea>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setShowRequestModal(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      disabled={isRequesting}
                      className="flex-2 py-4 bg-nfsu-navy text-white font-black rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-black/20"
                    >
                      {isRequesting ? 'Verifying...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};