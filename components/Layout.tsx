
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-nfsu-paper">
      <header className="bg-nfsu-navy py-5 px-8 sticky top-0 z-50 shadow-2xl border-b-[6px] border-nfsu-gold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1 border-2 border-nfsu-gold shadow-[0_0_15px_rgba(197,173,88,0.3)] transform hover:scale-105 transition-all">
               <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x_CqK0G985eC0FzB8W0Vf9x9_x_x_x_x&s" alt="NFSU Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement!.innerHTML = '<span class="text-nfsu-navy font-black text-[10px]">NFSU</span>'}} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-none uppercase flex items-baseline">
                CAMPUS<span className="text-nfsu-gold">WHISPERS</span>
                <span className="ml-2 w-1.5 h-1.5 bg-nfsu-gold rounded-full animate-pulse"></span>
              </h1>
              <p className="text-[10px] text-nfsu-gold/80 font-black uppercase tracking-[0.3em] mt-1.5">National Forensic Sciences University</p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4">
             <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
             <span className="px-4 py-1.5 bg-white/5 text-nfsu-gold text-[10px] font-black rounded border border-nfsu-gold/30 uppercase tracking-[0.2em] backdrop-blur-sm">
                STUDENTS HELP PORTAL
             </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        {children}
      </main>
      <footer className="bg-white py-10 px-8 border-t-4 border-nfsu-navy">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-80">
          <div className="text-[10px] font-black text-nfsu-navy uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} CampusWhispers • Institutional Authority • NFSU
          </div>
          <div className="flex gap-6">
            <span className="w-2 h-2 rounded-full bg-nfsu-navy"></span>
            <span className="w-2 h-2 rounded-full bg-nfsu-maroon"></span>
            <span className="w-2 h-2 rounded-full bg-nfsu-gold"></span>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Excellence in Forensic Science
          </div>
        </div>
      </footer>
    </div>
  );
};
