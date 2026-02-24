
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
import { GrievanceDashboard } from './grievance/GrievanceDashboard';
import { CampusDirectory } from './directory/CampusDirectory';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

type ViewType = 'home' | 'canteen' | 'lostfound' | 'resources' | 'opportunity' | 'profile' | 'students' | 'grievance' | 'directory';

const ROLE_ACTIVITIES: Record<string, Array<{id: string; label: string; sub: string; tag: string}>> = {
  student: [
    { id: 'canteen', label: 'Meal Registry', sub: 'Browse menu, place orders, track order status, and submit canteen feedback.', tag: 'MEAL' },
    { id: 'lostfound', label: 'Lost & Found', sub: 'Report lost items or claim found assets within campus grounds.', tag: 'ITEM' },
    { id: 'opportunity', label: 'Career Window', sub: 'Browse internships, placements, hackathons, and skill-building opportunities.', tag: 'CAREER' },
    { id: 'resources', label: 'Skill Share', sub: 'Access question papers, notes, and request or offer peer mentorship sessions.', tag: 'STUDY' },
    { id: 'grievance', label: 'Grievance Portal', sub: 'Report campus issues - academic, hostel, infrastructure, fees, and more.', tag: 'ISSUE' },
    { id: 'directory', label: 'Campus Directory', sub: 'Browse all campus clubs, committees, academic cells, libraries, and technical bodies.', tag: 'DIR' },
    { id: 'profile', label: 'Profile Setup', sub: 'Manage your identity card, profile photo, preferred name, and contact details.', tag: 'ID' },
  ],
  admin: [
    { id: 'students', label: 'Identity Governance', sub: 'Manage whitelist, add or disable accounts, and review full access audit logs.', tag: 'GOV' },
    { id: 'canteen', label: 'Canteen Audit', sub: 'Review operational compliance, monitor all orders, and analyze feedback reports.', tag: 'AUDIT' },
    { id: 'lostfound', label: 'Lost & Found Control', sub: 'Oversee item reports, manage handovers, and resolve disputed claims.', tag: 'ITEM' },
    { id: 'opportunity', label: 'Opportunity Review', sub: 'Approve, reject, expire, or directly post verified opportunities for students.', tag: 'OPP' },
    { id: 'resources', label: 'Resource Oversight', sub: 'Moderate uploaded academic papers, notes, and skill-share mentorship requests.', tag: 'STUDY' },
    { id: 'grievance', label: 'Grievance Management', sub: 'Review, respond to, categorize, and resolve all student-filed campus grievances.', tag: 'ISSUE' },
    { id: 'directory', label: 'Campus Directory', sub: 'Browse and reference all registered campus organizations, cells, and bodies.', tag: 'DIR' },
    { id: 'profile', label: 'Profile Setup', sub: 'Manage your administrative identity card, photo, and institutional preferences.', tag: 'ID' },
  ],
  staff: [
    { id: 'canteen', label: 'Service Operations', sub: 'Manage active order pipeline, mark orders as served, and update inventory.', tag: 'OPS' },
    { id: 'lostfound', label: 'Lost & Found', sub: 'Report found items and assist in identity-bound asset recovery on campus.', tag: 'ITEM' },
    { id: 'grievance', label: 'Grievance View', sub: 'View grievances related to canteen service and campus facilities.', tag: 'ISSUE' },
    { id: 'directory', label: 'Campus Directory', sub: 'Browse all campus clubs, committees, academic cells, libraries, and technical bodies.', tag: 'DIR' },
    { id: 'profile', label: 'Profile Setup', sub: 'Manage your staff identity card, contact details, and display preferences.', tag: 'ID' },
  ],
};

const CARD_ACCENTS = [
  'hover:border-nfsu-navy',
  'hover:border-nfsu-maroon',
  'hover:border-nfsu-gold',
  'hover:border-blue-400',
  'hover:border-green-500',
  'hover:border-purple-500',
  'hover:border-amber-500',
];

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onUpdateUser }) => {
  const [view, setView] = useState<ViewType>('home');

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
      case 'grievance':
        return <GrievanceDashboard user={user} />;
      case 'directory':
        return <CampusDirectory />;
      default:
        return renderHome();
    }
  };

  const renderHome = () => {
    const activities = ROLE_ACTIVITIES[user.role] || ROLE_ACTIVITIES.student;
    const roleLabel = user.role === 'admin' ? 'Administrative' : user.role === 'staff' ? 'Canteen Staff' : 'Student';
    return (
      <div className="w-full max-w-6xl space-y-6 md:space-y-10 animate-fadeIn">
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border-2 border-nfsu-gold/20 overflow-hidden">
          <div className="p-5 md:p-8 lg:p-12 border-b-2 border-nfsu-paper flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 bg-gradient-to-br from-nfsu-paper to-white">
            <div className="flex items-center gap-4 md:gap-8">
              <button onClick={() => setView('profile')} className="group relative flex-shrink-0">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-nfsu-navy rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center p-1.5 border-4 border-nfsu-gold shadow-2xl overflow-hidden transform group-hover:rotate-6 transition-transform">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} className="w-full h-full object-cover rounded-[1rem] md:rounded-[1.5rem]" alt="Profile" />
                  ) : (
                    <span className="text-white font-black text-2xl md:text-3xl italic">{user.fullName.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-nfsu-gold rounded-full border-4 border-white flex items-center justify-center text-[9px] font-black shadow-lg">ID</div>
              </button>
              <div className="min-w-0">
                <h2 className="text-2xl md:text-4xl font-black text-nfsu-navy tracking-tighter italic uppercase leading-tight mb-1 break-words">
                  {user.preferredName || user.fullName.split(' ')[0]}'s <span className="text-nfsu-gold">Dashboard</span>
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3 items-center mt-2">
                  <span className="px-2 md:px-3 py-1 bg-nfsu-maroon text-white text-[9px] font-black rounded uppercase tracking-widest">{user.role}</span>
                  <span className="px-2 md:px-3 py-1 bg-nfsu-navy/10 text-nfsu-navy text-[9px] font-black rounded uppercase tracking-widest">{user.department}</span>
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{user.id}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={onLogout} className="px-4 md:px-6 py-3 md:py-4 bg-white border-2 border-slate-200 text-slate-400 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:border-nfsu-maroon hover:text-nfsu-maroon transition-all">Exit Portal</button>
            </div>
          </div>

          <div className="p-5 md:p-8 lg:p-12">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
              <span>{roleLabel} Activities</span>
              <div className="flex-1 h-[1px] bg-slate-100"></div>
              <span className="text-nfsu-gold">{activities.length} Modules</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((act, i) => (
                <button
                  key={act.id}
                  onClick={() => setView(act.id as ViewType)}
                  className={`text-left p-5 md:p-8 bg-nfsu-paper rounded-[1.5rem] md:rounded-[2rem] border-2 border-transparent ${CARD_ACCENTS[i % CARD_ACCENTS.length]} hover:bg-white transition-all group shadow-sm flex flex-col justify-between min-h-[150px] md:min-h-[180px]`}
                >
                  <div>
                    <div className="w-14 h-8 bg-white rounded-lg shadow-inner flex items-center justify-center mb-5 group-hover:scale-110 transition-transform text-[9px] font-black text-nfsu-navy uppercase tracking-tighter">
                      {act.tag}
                    </div>
                    <h3 className="font-black text-nfsu-navy mb-2 text-base uppercase italic group-hover:text-nfsu-maroon transition-colors">
                      {act.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed opacity-80">
                      {act.sub}
                    </p>
                  </div>
                  <div className="mt-4 text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em]">Access →</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border-2 border-nfsu-gold/30 flex items-center gap-5 md:gap-8 group hover:scale-[1.02] transition-all">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-nfsu-navy rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center border-4 border-nfsu-gold shadow-2xl group-hover:rotate-12 transition-transform flex-shrink-0">
              <span className="text-white font-black text-2xl md:text-3xl italic">ID</span>
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Reference</div>
              <div className="font-mono text-2xl md:text-3xl font-black text-nfsu-navy tracking-tighter break-all">{user.id}</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded uppercase border border-nfsu-navy/10">VERIFIED ASSET</div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-nfsu-navy p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl text-white flex flex-col justify-center border-b-8 border-nfsu-gold relative overflow-hidden">
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
