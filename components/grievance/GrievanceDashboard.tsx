import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { dbService } from '../../services/dbService';

export type GrievanceCategory =
  | 'Academic'
  | 'Hostel & Accommodation'
  | 'Canteen & Food'
  | 'Infrastructure & Maintenance'
  | 'Library'
  | 'Transport'
  | 'Fee & Finance'
  | 'Examination'
  | 'Ragging & Harassment'
  | 'Medical & Health'
  | 'Sports & Facilities'
  | 'Administrative'
  | 'Other';

export type GrievancePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type GrievanceStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected';

export interface Grievance {
  id: string;
  reporterId: string;
  reporterEmail: string;
  reporterName: string;
  category: GrievanceCategory;
  priority: GrievancePriority;
  subject: string;
  description: string;
  isAnonymous: boolean;
  status: GrievanceStatus;
  adminResponse?: string;
  createdAt: number;
  updatedAt: number;
}

interface GrievanceDashboardProps {
  user: User;
}

const CATEGORIES: GrievanceCategory[] = [
  'Academic',
  'Hostel & Accommodation',
  'Canteen & Food',
  'Infrastructure & Maintenance',
  'Library',
  'Transport',
  'Fee & Finance',
  'Examination',
  'Ragging & Harassment',
  'Medical & Health',
  'Sports & Facilities',
  'Administrative',
  'Other',
];

const PRIORITIES: GrievancePriority[] = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_COLORS: Record<GrievanceStatus, string> = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-green-50 text-green-700 border-green-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
};

const PRIORITY_COLORS: Record<GrievancePriority, string> = {
  Low: 'bg-slate-100 text-slate-500',
  Medium: 'bg-blue-100 text-blue-600',
  High: 'bg-orange-100 text-orange-600',
  Urgent: 'bg-red-100 text-red-600',
};

export const GrievanceDashboard: React.FC<GrievanceDashboardProps> = ({ user }) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [filterCat, setFilterCat] = useState<GrievanceCategory | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<GrievanceStatus | 'All'>('All');
  const [adminReply, setAdminReply] = useState('');
  const [newGrievance, setNewGrievance] = useState({
    category: 'Academic' as GrievanceCategory,
    priority: 'Medium' as GrievancePriority,
    subject: '',
    description: '',
    isAnonymous: false,
  });

  const refresh = () => {
    const all = dbService.getTable<Grievance>('grievances');
    if (user.role === 'admin') {
      setGrievances(all);
    } else {
      setGrievances(all.filter(g => g.reporterId === user.id));
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener('cw_db_update', refresh);
    return () => window.removeEventListener('cw_db_update', refresh);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g: Grievance = {
      id: `GRV-${Date.now()}`,
      reporterId: user.id,
      reporterEmail: user.email,
      reporterName: newGrievance.isAnonymous ? 'Anonymous' : user.fullName,
      category: newGrievance.category,
      priority: newGrievance.priority,
      subject: newGrievance.subject,
      description: newGrievance.description,
      isAnonymous: newGrievance.isAnonymous,
      status: 'Open',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const all = dbService.getTable<Grievance>('grievances');
    dbService.saveTable('grievances', [g, ...all]);
    setNewGrievance({ category: 'Academic', priority: 'Medium', subject: '', description: '', isAnonymous: false });
    refresh();
    setView('list');
  };

  const updateStatus = (id: string, status: GrievanceStatus, response?: string) => {
    dbService.updateRow<Grievance>('grievances', id, { status, adminResponse: response, updatedAt: Date.now() });
    refresh();
    if (selected?.id === id) {
      const updated = dbService.getTable<Grievance>('grievances').find(g => g.id === id);
      if (updated) setSelected(updated);
    }
  };

  const filtered = grievances.filter(g =>
    (filterCat === 'All' || g.category === filterCat) &&
    (filterStatus === 'All' || g.status === filterStatus)
  );

  const stats = {
    total: grievances.length,
    open: grievances.filter(g => g.status === 'Open').length,
    review: grievances.filter(g => g.status === 'Under Review').length,
    resolved: grievances.filter(g => g.status === 'Resolved').length,
  };

  if (view === 'new') {
    return (
      <div className="w-full max-w-3xl animate-fadeIn">
        <button onClick={() => setView('list')} className="mb-8 flex items-center gap-3 text-nfsu-navy font-black uppercase text-[10px] tracking-[0.3em] group">
          <div className="p-2 rounded-xl bg-white border-2 border-slate-100 group-hover:border-nfsu-gold transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-nfsu-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </div>
          Back to Grievances
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
          <div className="bg-nfsu-maroon p-10 text-white">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">File Grievance</h2>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mt-1">Campus Issue Reporting Terminal</p>
          </div>
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Issue Category</label>
                <select
                  value={newGrievance.category}
                  onChange={e => setNewGrievance(p => ({ ...p, category: e.target.value as GrievanceCategory }))}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-nfsu-navy transition-all"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Priority Level</label>
                <select
                  value={newGrievance.priority}
                  onChange={e => setNewGrievance(p => ({ ...p, priority: e.target.value as GrievancePriority }))}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-nfsu-navy transition-all"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Subject</label>
              <input
                required
                value={newGrievance.subject}
                onChange={e => setNewGrievance(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-nfsu-navy transition-all"
                placeholder="Brief title of the issue..."
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Detailed Description</label>
              <textarea
                required
                value={newGrievance.description}
                onChange={e => setNewGrievance(p => ({ ...p, description: e.target.value }))}
                className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold h-36 outline-none focus:border-nfsu-gold transition-all resize-none"
                placeholder="Describe the issue in detail including location, time, and any relevant information..."
              />
            </div>

            <div className="flex items-center gap-4 p-5 bg-amber-50 rounded-2xl border-2 border-amber-100">
              <input
                type="checkbox"
                id="anon"
                checked={newGrievance.isAnonymous}
                onChange={e => setNewGrievance(p => ({ ...p, isAnonymous: e.target.checked }))}
                className="w-5 h-5 accent-nfsu-maroon cursor-pointer"
              />
              <label htmlFor="anon" className="text-[11px] font-black text-amber-700 uppercase tracking-widest cursor-pointer">
                Submit Anonymously - Your identity will not be visible to administrators
              </label>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setView('list')}
                className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-2 py-5 bg-nfsu-maroon text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-black/20 hover:bg-nfsu-navy transition-all"
              >
                Submit Grievance
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'detail' && selected) {
    return (
      <div className="w-full max-w-3xl animate-fadeIn">
        <button onClick={() => { setView('list'); setSelected(null); }} className="mb-8 flex items-center gap-3 text-nfsu-navy font-black uppercase text-[10px] tracking-[0.3em] group">
          <div className="p-2 rounded-xl bg-white border-2 border-slate-100 group-hover:border-nfsu-gold transition-all shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-nfsu-gold" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          </div>
          Back to Grievances
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-100 overflow-hidden">
          <div className="bg-nfsu-navy p-10 text-white">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${PRIORITY_COLORS[selected.priority]}`}>{selected.priority} Priority</span>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/10 text-white/70">{selected.category}</span>
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selected.subject}</h2>
            <p className="text-[10px] text-nfsu-gold/60 font-black uppercase tracking-widest mt-2">
              {selected.id} • Filed by {selected.reporterName} • {new Date(selected.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="p-10 space-y-8">
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</div>
              <p className="text-sm text-slate-700 font-bold leading-relaxed">{selected.description}</p>
            </div>

            {selected.adminResponse && (
              <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-6">
                <div className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3">Administrative Response</div>
                <p className="text-sm text-green-800 font-bold leading-relaxed">{selected.adminResponse}</p>
              </div>
            )}

            {user.role === 'admin' && selected.status !== 'Resolved' && selected.status !== 'Rejected' && (
              <div className="border-t-2 border-slate-100 pt-8 space-y-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Action Panel</div>
                <textarea
                  value={adminReply}
                  onChange={e => setAdminReply(e.target.value)}
                  placeholder="Write response or resolution note..."
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold h-28 outline-none focus:border-nfsu-navy transition-all resize-none"
                />
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => { updateStatus(selected.id, 'Under Review', adminReply); setAdminReply(''); }}
                    className="px-6 py-4 bg-amber-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => { updateStatus(selected.id, 'Resolved', adminReply); setAdminReply(''); }}
                    className="px-6 py-4 bg-green-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => { updateStatus(selected.id, 'Rejected', adminReply); setAdminReply(''); }}
                    className="px-6 py-4 bg-nfsu-maroon text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-nfsu-navy p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-nfsu-maroon relative overflow-hidden">
        <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Grievance Portal</h2>
            <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Campus Issue Resolution System</p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="grid grid-cols-4 gap-4 text-center hidden sm:grid">
              {[
                { label: 'Total', val: stats.total, color: 'text-white' },
                { label: 'Open', val: stats.open, color: 'text-blue-300' },
                { label: 'Review', val: stats.review, color: 'text-amber-300' },
                { label: 'Resolved', val: stats.resolved, color: 'text-green-300' },
              ].map(s => (
                <div key={s.label}>
                  <div className={`text-2xl font-black italic ${s.color}`}>{s.val}</div>
                  <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</div>
                </div>
              ))}
            </div>
            {user.role !== 'admin' && (
              <button
                onClick={() => setView('new')}
                className="px-8 py-5 bg-nfsu-maroon text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-800 transition-all shadow-xl border-b-4 border-black/10"
              >
                File New Grievance
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value as GrievanceCategory | 'All')}
          className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-nfsu-navy transition-all shadow-sm"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as GrievanceStatus | 'All')}
          className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-nfsu-navy transition-all shadow-sm"
        >
          <option value="All">All Statuses</option>
          {(['Open', 'Under Review', 'Resolved', 'Rejected'] as GrievanceStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[11px] font-black text-slate-300 uppercase italic tracking-[0.2em]">
              {user.role === 'admin' ? 'No grievances filed yet' : 'You have no grievances filed. Use the button above to report a campus issue.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(g => (
              <button
                key={g.id}
                onClick={() => { setSelected(g); setView('detail'); }}
                className="w-full text-left p-8 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-nfsu-maroon"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${STATUS_COLORS[g.status]}`}>{g.status}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${PRIORITY_COLORS[g.priority]}`}>{g.priority}</span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">{g.category}</span>
                    </div>
                    <div className="font-black text-nfsu-navy text-sm uppercase tracking-tight group-hover:text-nfsu-maroon transition-colors">{g.subject}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight mt-1">
                      {g.id} • {g.isAnonymous ? 'Anonymous' : g.reporterName} • {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-nfsu-gold font-black text-[10px] uppercase tracking-[0.3em] group-hover:translate-x-1 transition-transform">View →</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
