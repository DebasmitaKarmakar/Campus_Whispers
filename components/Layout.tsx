
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="bg-nfsu-navy border-b border-nfsu-gold/30 py-4 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1 border-2 border-nfsu-gold shadow-inner">
               <span className="text-nfsu-navy font-black text-xs leading-none text-center">NFSU</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none uppercase">
                CAMPUS<span className="text-nfsu-gold">WHISPERS</span>
              </h1>
              <p className="text-[10px] text-nfsu-gold/70 font-bold uppercase tracking-widest mt-1">National Forensic Sciences University</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
             <span className="px-3 py-1 bg-nfsu-gold/20 text-nfsu-gold text-[10px] font-black rounded border border-nfsu-gold/30 uppercase tracking-tighter">
                STUDENTS HELP PORTAL
             </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        {children}
      </main>
      <footer className="py-6 px-6 text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} CampusWhispers • Student Community Unity • NFSU
      </footer>
    </div>
  );
};
