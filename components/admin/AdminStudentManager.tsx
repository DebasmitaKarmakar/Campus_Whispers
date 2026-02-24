import React, { useState, useEffect } from 'react';
import { WHITELIST } from '../../services/authService';
import { dbService } from '../../services/dbService';
import { AdminLog, Role, WhitelistEntry } from '../../types';

const ROLE_BADGE: Record<Role, string> = {
  admin:   'bg-red-100 text-red-800 border-red-200',
  faculty: 'bg-purple-100 text-purple-800 border-purple-200',
  canteen: 'bg-amber-100 text-amber-800 border-amber-200',
  student: 'bg-blue-100 text-blue-800 border-blue-200',
};

const PRIVILEGE_ORDER: Record<Role, number> = {
  admin: 4, faculty: 3, canteen: 2, student: 1,
};

export const AdminStudentManager: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');

  useEffect(() => {
    const refresh = () => setLogs(dbService.getTable<AdminLog>('admin_logs'));
    refresh();
    window.addEventListener('cw_db_update', refresh);
    return () => window.removeEventListener('cw_db_update', refresh);
  }, []);

  const whitelist: WhitelistEntry[] = Array.from(WHITELIST.values()).sort(
    (a, b) => PRIVILEGE_ORDER[b.role] - PRIVILEGE_ORDER[a.role]
  );

  const filtered = whitelist.filter(entry => {
    const q = search.toLowerCase();
    const matchSearch = !q || entry.email.toLowerCase().includes(q) || entry.fullName.toLowerCase().includes(q) || String(entry.id).includes(q);
    const matchRole = filterRole === 'all' || entry.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCounts: Record<string, number> = { all: whitelist.length };
  for (const e of whitelist) roleCounts[e.role] = (roleCounts[e.role] ?? 0) + 1;

  return (
    <div className="w-full max-w-6xl space-y-6 md:space-y-10 animate-fadeIn">
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border-2 border-nfsu-gold/20 overflow-hidden">
        <div className="p-6 md:p-10 lg:p-12 border-b-2 border-nfsu-paper bg-gradient-to-br from-nfsu-paper to-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">System Administration</div>
              <h2 className="text-3xl md:text-4xl font-black text-nfsu-navy tracking-tighter italic uppercase">
                Identity <span className="text-nfsu-gold">Governance</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                Access whitelist — role and ID assignments managed by the institution.
              </p>
            </div>
            <div className="px-5 py-3 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl uppercase tracking-widest">
              {whitelist.length} Registered Entities
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-nfsu-navy outline-none font-bold text-sm placeholder-slate-300 transition-all"
            />
          </div>
        </div>

        <div className="px-6 md:px-10 lg:px-12 py-5 border-b-2 border-nfsu-paper flex gap-2 flex-wrap">
          {(['all', 'admin', 'faculty', 'canteen', 'student'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                filterRole === r
                  ? 'bg-nfsu-navy text-white border-nfsu-navy shadow-lg'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-nfsu-navy/40'
              }`}
            >
              {r === 'all' ? 'All Roles' : r}
              {roleCounts[r] !== undefined && (
                <span className={`ml-2 ${filterRole === r ? 'text-nfsu-gold' : 'text-slate-400'}`}>
                  {roleCounts[r]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-10 lg:p-12">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-[9px] font-black text-amber-800 uppercase tracking-widest mb-1">Whitelist Policy</p>
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
              The whitelist is the single source of truth for access control. Role and numeric ID are assigned
              at the institutional level and cannot be modified by users. Modification requires a system update
              by a qualified administrator. Google Sign-In verifies email identity; the whitelist determines access.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  {['ID', 'Full Name', 'Email', 'Department', 'Role', 'Privilege'].map(h => (
                    <th key={h} className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No records match</td></tr>
                ) : filtered.map(entry => (
                  <tr key={entry.email} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="font-mono font-black text-nfsu-navy text-sm">{entry.id}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-black text-nfsu-navy text-xs uppercase tracking-tight">{entry.fullName}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-[10px] font-bold text-slate-600">{entry.email}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{entry.department}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${ROLE_BADGE[entry.role]}`}>
                        {entry.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map(level => (
                          <div
                            key={level}
                            className={`w-4 h-1.5 rounded-full ${
                              level <= PRIVILEGE_ORDER[entry.role] ? 'bg-nfsu-navy' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-nfsu-maroon rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white border-b-8 border-black/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
        <div className="relative z-10">
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-nfsu-gold mb-4">Audit Trail</h3>
          {logs.length === 0 ? (
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">No admin activity recorded this session.</p>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {logs.slice(0, 20).map(log => (
                <div key={log.id} className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-black text-nfsu-gold uppercase tracking-widest bg-nfsu-gold/10 px-2.5 py-1 rounded-lg">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-[8px] font-black text-white/30">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-tight">
                    {log.adminEmail.split('@')[0]} modified {log.targetName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
