
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
          <div className="w-full max-w-5xl space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-nfsu-navy/5 overflow-hidden">
              <div className="p-10 border-b-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                <div className="flex items-center gap-6">
                  <button onClick={() => setView('profile')} className="group relative">
                    <div className="w-16 h-16 bg-nfsu-navy rounded-2xl flex items-center justify-center p-1 border-2 border-nfsu-gold shadow-xl overflow-hidden">
                      {user.profilePhoto ? (
                        <img src={user.profilePhoto} className="w-full h-full object-cover rounded-xl" alt="Profile" />
                      ) : (
                        <span className="text-white font-black text-xl italic">{user.fullName.charAt(0)}</span>
                      )}
                    </div>
                  </button>
                  <div>
                    <h2 className="text-4xl font-black text-nfsu-navy tracking-tighter italic uppercase leading-none">
                      {user.preferredName || user.fullName.split(' ')[0]} Hub
                    </h2>
                    <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-widest">{user.role} Authorization • {user.department}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  {user.role === 'admin' && (
                    <button onClick={() => setView('students')} className="px-6 py-3 bg-nfsu-gold text-nfsu-navy font-black rounded-2xl shadow-sm uppercase text-[10px] tracking-widest border-b-4 border-black/10">Manage Students</button>
                  )}
                  <button onClick={() => setView('profile')} className="px-6 py-3 bg-slate-50 border-2 border-slate-100 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest">My Profile</button>
                  <button onClick={onLogout} className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest">Sign Out</button>
                </div>
              </div>
              
              <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Canteen View - Shared by all but functionality differs */}
                <button onClick={() => setView('canteen')} className="text-left p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-nfsu-navy transition-all group shadow-sm">
                  <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic">
                    {user.role === 'admin' ? 'Canteen Audit' : user.role === 'staff' ? 'Canteen Service' : 'Order Food'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {user.role === 'admin' ? 'Strategic menu audit and feedback review.' : user.role === 'staff' ? 'Manage active orders and daily menu registry.' : 'Access standardized university nutrition plan.'}
                  </p>
                </button>

                {/* Lost & Found - Shared by all */}
                <button onClick={() => setView('lostfound')} className="text-left p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-nfsu-navy transition-all group shadow-sm">
                  <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic">Lost & Found</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">Trace and recover items via identity-bound claims.</p>
                </button>

                {/* Opportunity - Hidden for Staff */}
                {user.role !== 'staff' && (
                  <button onClick={() => setView('opportunity')} className="text-left p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-nfsu-navy transition-all group shadow-sm">
                    <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic">Opportunity</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Verified pathways for internships and skill growth.</p>
                  </button>
                )}

                {/* Resource Share - Hidden for Staff */}
                {user.role !== 'staff' && (
                  <button onClick={() => setView('resources')} className="text-left p-8 bg-white rounded-3xl border-2 border-slate-100 hover:border-nfsu-navy transition-all group shadow-sm">
                    <h3 className="font-black text-nfsu-navy mb-3 text-lg uppercase italic">Resource Share</h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">Repository for papers and peer academic exchange.</p>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-nfsu-gold/20 flex items-center gap-8">
                <div className="w-24 h-24 bg-nfsu-lightgold rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                  <span className="text-nfsu-navy font-black text-2xl italic">ID</span>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional ID</div>
                  <div className="font-mono text-3xl font-black text-nfsu-navy tracking-widest">{user.id}</div>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-nfsu-navy text-white text-[10px] font-black rounded uppercase">VERIFIED ENTITY</div>
                </div>
              </div>
              <div className="bg-nfsu-maroon p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-center border-b-8 border-black/20">
                <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">NFSU Community Database</h4>
                <p className="text-nfsu-lightgold/70 text-xs font-bold leading-relaxed">This portal acts as the centralized authority for student welfare and academic transparency.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {view !== 'home' && (
        <button onClick={() => setView('home')} className="mb-8 flex items-center gap-3 text-nfsu-navy font-black transition-all self-start uppercase text-xs tracking-widest group">
          <div className="p-2 rounded-xl bg-white border-2 border-slate-200 group-hover:border-nfsu-maroon transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </div>
          Return to Hub
        </button>
      )}
      {renderContent()}
    </div>
  );
};
