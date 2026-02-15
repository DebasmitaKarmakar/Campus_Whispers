
import React, { useState } from 'react';
import { User } from '../types';
import { StudentCanteen } from './canteen/StudentCanteen';
import { AdminCanteen } from './canteen/AdminCanteen';
import { StaffCanteen } from './canteen/StaffCanteen';
import { LostFoundDashboard } from './lostfound/LostFoundDashboard';
import { ResourcesDashboard } from './resources/ResourcesDashboard';
import { OpportunityDashboard } from './opportunity/OpportunityDashboard';
import { MyProfile } from './profile/MyProfile';
import { AdminStudentManager } from './admin/AdminStudentManager';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [view, setView] = useState<'home' | 'canteen' | 'lostfound' | 'resources' | 'opportunity' | 'profile' | 'students'>('home');

  const renderContent = () => {
    switch (view) {
      case 'canteen':
        if (user.role === 'admin') return <AdminCanteen user={user} />;
        if (user.role === 'staff') return <StaffCanteen user={user} />;
        return <StudentCanteen user={user} />;
      case 'lostfound':
        return <LostFoundDashboard user={user} />;
      case 'resources':
        return <ResourcesDashboard user={user} />;
      case 'opportunity':
        return <OpportunityDashboard user={user} />;
      case 'profile':
        return <MyProfile user={user} onProfileUpdate={onUpdateUser} />;
      case 'students':
        return <AdminStudentManager />;
      default:
        return (
          <div className="w-full max-w-6xl space-y-10 animate-fadeIn">
            {/* Identity Card Header */}
            <div className="bg-white rounded-[3rem] shadow-2xl border-2 border-nfsu-gold/20 overflow-hidden">
              <div className="p-8 lg:p-12 border-b-2 border-nfsu-paper flex flex-col md:flex-row md:items-center justify-between gap-8 bg-gradient-to-br from-nfsu-paper to-white">
                <div className="flex items-center gap-8">
                  <button onClick={() => setView('profile')} className="group relative">
                    <div className="w-24 h-24 bg-nfsu-navy rounded-[2rem] flex items-center justify-center p-1.5 border-4 border-nfsu-gold shadow-2xl overflow-hidden transform group-hover:rotate-6 transition-transform">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} className="w-full h-full object-cover rounded-[1.5rem]" alt="Profile" />
                      ) : (
                        <span className="text-white font-black text-3xl italic">{user.fullName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-nfsu-gold rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-lg">✓</div>
                  </button>
                  <div>
                    <h2 className="text-4xl font-black text-nfsu-navy tracking-tighter italic uppercase leading-tight mb-1">
                      {user.preferredName || user.fullName.split(' ')[0]}'s <span className="text-nfsu-gold">Dashboard</span>
                    </h2>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className="px-3 py-1 bg-nfsu-maroon text-white text-[9px] font-black rounded uppercase tracking-widest">{user.role} AUTH</span>
                      <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{user.department} REGISTRY</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {user.role === 'admin' && (
                    <button onClick={() => setView('students')} className="px-6 py-4 bg-nfsu-gold text-nfsu-navy font-black rounded-2xl shadow-xl hover:bg-white hover:ring-2 hover:ring-nfsu-gold transition-all uppercase text-[10px] tracking-widest border-b-4 border-black/10">Manage Whitelist</button>
                  )}
                  <button onClick={() => setView('profile')} className="px-6 py-4 bg-nfsu-navy text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-nfsu-maroon transition-all shadow-xl">Profile Setup</button>
                  <button onClick={onLogout} className="px-6 py-4 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:border-nfsu-maroon hover:text-nfsu-maroon transition-all">Exit Portal</button>
                </div>
              </div>
              
              <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Module Cards */}
                <button onClick={() => setView('canteen')} className="text-left p-8 bg-nfsu-paper rounded-[2.5rem] border-2 border-transparent hover:border-nfsu-navy hover:bg-white transition-all group shadow-sm flex flex-col justify-between h-full min-h-[220px]">
                  <div>
                    <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">🍱</div>
                    <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic group-hover:text-nfsu-maroon transition-colors">
                      {user.role === 'admin' ? 'Canteen Audit' : user.role === 'staff' ? 'Service Ops' : 'Meal Registry'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-relaxed opacity-80">
                      {user.role === 'admin' ? 'Review operational compliance and feedback.' : user.role === 'staff' ? 'Manage active pipeline and inventory.' : 'Standardized university nutrition access.'}
                    </p>
                  </div>
                  <div className="mt-4 text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em]">Access →</div>
                </button>

                <button onClick={() => setView('lostfound')} className="text-left p-8 bg-nfsu-paper rounded-[2.5rem] border-2 border-transparent hover:border-nfsu-maroon hover:bg-white transition-all group shadow-sm flex flex-col justify-between h-full min-h-[220px]">
                  <div>
                     <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">🔍</div>
                    <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic group-hover:text-nfsu-maroon transition-colors">Lost & Found</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-relaxed opacity-80">Trace and recover identity-bound assets within campus.</p>
                  </div>
                  <div className="mt-4 text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em]">Access →</div>
                </button>

                {user.role !== 'staff' && (
                  <button onClick={() => setView('opportunity')} className="text-left p-8 bg-nfsu-paper rounded-[2.5rem] border-2 border-transparent hover:border-nfsu-navy hover:bg-white transition-all group shadow-sm flex flex-col justify-between h-full min-h-[220px]">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">💼</div>
                      <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic group-hover:text-nfsu-maroon transition-colors">Career Window</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-relaxed opacity-80">Verified professional pathways and skill growth.</p>
                    </div>
                    <div className="mt-4 text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em]">Access →</div>
                  </button>
                )}

                {user.role !== 'staff' && (
                  <button onClick={() => setView('resources')} className="text-left p-8 bg-nfsu-paper rounded-[2.5rem] border-2 border-transparent hover:border-nfsu-maroon hover:bg-white transition-all group shadow-sm flex flex-col justify-between h-full min-h-[220px]">
                    <div>
                      <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">📚</div>
                      <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic group-hover:text-nfsu-maroon transition-colors">Skill Share</h3>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight leading-relaxed opacity-80">Academic repository and peer mentorship bank.</p>
                    </div>
                    <div className="mt-4 text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em]">Access →</div>
                  </button>
                )}
              </div>
            </div>

            {/* Verification Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-nfsu-gold/30 flex items-center gap-8 group hover:scale-[1.02] transition-all">
                <div className="w-24 h-24 bg-nfsu-navy rounded-[2rem] flex items-center justify-center border-4 border-nfsu-gold shadow-2xl group-hover:rotate-12 transition-transform">
                  <span className="text-white font-black text-3xl italic">ID</span>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Reference</div>
                  <div className="font-mono text-3xl font-black text-nfsu-navy tracking-tighter">{user.id}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded uppercase border border-nfsu-navy/10">VERIFIED ASSET</div>
                </div>
              </div>
              
              <div className="lg:col-span-2 bg-nfsu-navy p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-center border-b-8 border-nfsu-gold relative overflow-hidden">
                <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4">NFSU Institutional Accountability</h4>
                  <p className="text-nfsu-gold/60 text-xs font-bold leading-relaxed uppercase tracking-[0.05em]">
                    This unified portal acts as the single source of truth for student governance. 
                    Integrity is our mandate. All interactions are identity-bound.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center max-w-7xl mx-auto">
      {view !== 'home' && (
        <button onClick={() => setView('home')} className="mb-8 flex items-center gap-4 text-nfsu-navy font-black transition-all self-start uppercase text-[10px] tracking-[0.3em] group">
          <div className="p-3 rounded-2xl bg-white border-2 border-nfsu-paper group-hover:border-nfsu-gold transition-all shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-nfsu-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </div>
          Return to Institutional Hub
        </button>
      )}
      {renderContent()}
    </div>
  );
};
