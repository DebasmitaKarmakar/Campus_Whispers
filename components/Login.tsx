
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
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid Credential: Enter a valid campus email');
      return;
    }

    if (!enrollment) {
      setError('Required: Provide Enrollment/Student ID');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(email, enrollment);
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
    <div className="w-full max-w-lg px-4 py-12 flex flex-col items-center">
      <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border-2 border-nfsu-navy/5 overflow-hidden relative">
        {/* Decorative branding bar */}
        <div className="h-2 bg-gradient-to-r from-nfsu-navy via-nfsu-maroon to-nfsu-gold w-full"></div>
        
        <div className="bg-nfsu-navy p-12 text-white text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-nfsu-gold opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-8 flex items-center justify-center p-3 shadow-2xl border-4 border-nfsu-gold/20 transform hover:scale-110 transition-transform">
             <span className="text-nfsu-navy font-black text-xl leading-none">NFSU</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">CampusWhispers</h2>
          <p className="text-nfsu-gold text-[10px] font-black uppercase tracking-[0.4em] mt-4 opacity-90">Secure Students Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="email" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-navy transition-colors">
                University Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-nfsu-navy focus:bg-white outline-none transition-all font-bold text-sm shadow-inner"
                  placeholder="name@nfsu.ac.in"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="enrollment" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-nfsu-navy transition-colors">
                Student Enrollment ID
              </label>
              <input
                id="enrollment"
                type="text"
                value={enrollment}
                onChange={(e) => setEnrollment(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-nfsu-navy focus:bg-white outline-none transition-all font-mono font-black tracking-[0.3em] text-sm shadow-inner uppercase"
                placeholder="4XXX"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-nfsu-maroon p-5 rounded-r-2xl animate-shake">
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-nfsu-maroon text-white rounded-full flex items-center justify-center text-[10px] font-black italic">!</div>
                <p className="text-[10px] text-nfsu-maroon font-black uppercase tracking-tight leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-nfsu-navy text-white font-black rounded-2xl shadow-2xl shadow-nfsu-navy/30 hover:bg-nfsu-maroon transition-all disabled:opacity-50 uppercase tracking-[0.25em] text-xs border-b-4 border-black/20 flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Verifying Identity...</span>
                </>
              ) : 'Authorize Entry'}
            </button>
            
            <button 
              type="button"
              onClick={() => setShowRequestModal(true)}
              className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-nfsu-navy transition-colors"
            >
              Not on whitelist? Request Access
            </button>
          </div>
        </form>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Access Controlled • NFSU Authority</p>
        </div>
      </div>

      {/* Request Access Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full border-4 border-nfsu-gold shadow-2xl animate-slideUp">
             <h3 className="text-2xl font-black text-nfsu-navy uppercase italic mb-6">Access Request</h3>
             <p className="text-xs font-bold text-slate-500 uppercase leading-relaxed mb-10">
               If your enrollment ID is missing from our whitelist, please contact the campus coordinator or wait for the next verification batch.
             </p>
             <div className="space-y-4">
               <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                 <div className="text-[10px] font-black text-nfsu-gold uppercase mb-1">Coordinator Email</div>
                 <div className="text-xs font-black text-nfsu-navy">support.campuswhispers@nfsu.ac.in</div>
               </div>
               <button 
                onClick={() => setShowRequestModal(false)}
                className="w-full py-5 bg-nfsu-navy text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl border-b-4 border-black/20"
               >
                 Acknowledge
               </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
