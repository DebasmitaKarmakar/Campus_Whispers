
import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { StudentMaster, Role, AccountStatus, AdminLog, User } from '../../types';

export const AdminStudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentMaster[]>(dbService.getTable<StudentMaster>('students'));
  const [logs, setLogs] = useState<AdminLog[]>(dbService.getTable<AdminLog>('admin_logs'));
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStu, setNewStu] = useState({ email: '', institutionalId: '', fullName: '', department: '', role: 'student' as Role });

  const currentUserStr = localStorage.getItem('cw_user');
  const currentUser: User | null = currentUserStr ? JSON.parse(currentUserStr) : null;

  const refresh = () => {
    setStudents(dbService.getTable<StudentMaster>('students'));
    setLogs(dbService.getTable<AdminLog>('admin_logs'));
  };

  useEffect(() => {
    refresh();
    window.addEventListener('cw_db_update', refresh);
    return () => window.removeEventListener('cw_db_update', refresh);
  }, []);

  const createLog = (action: string, targetId: string, targetName: string, details?: string) => {
    if (!currentUser) return;
    const log: AdminLog = {
      id: `LOG-${Date.now()}`,
      adminId: currentUser.id,
      adminEmail: currentUser.email,
      action,
      targetId,
      targetName,
      timestamp: Date.now(),
      details
    };
    dbService.addRow('admin_logs', log);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${newStu.role === 'admin' ? 'ADM' : newStu.role === 'staff' ? 'STA' : 'STU'}-${newStu.institutionalId}`;
    
    // Check if ID already exists
    if (students.some(s => s.id === id)) {
      alert("Institutional ID Conflict: This record already exists in the whitelist.");
      return;
    }

    const entry: StudentMaster = { ...newStu, id, status: 'Active', createdAt: Date.now() };
    dbService.saveTable('students', [entry, ...students]);
    
    createLog('ADD_ENTRY', id, newStu.fullName, `Added to department: ${newStu.department}`);
    
    setIsAdding(false);
    setNewStu({ email: '', institutionalId: '', fullName: '', department: '', role: 'student' });
    refresh();
  };

  const toggleStatus = (id: string, current: AccountStatus, name: string) => {
    const newStatus = current === 'Active' ? 'Disabled' : 'Active';
    dbService.updateRow<StudentMaster>('students', id, { status: newStatus });
    
    createLog('TOGGLE_STATUS', id, name, `Account status modified to: ${newStatus}`);
    refresh();
  };

  const filtered = students.filter(s => 
    s.fullName.toLowerCase().includes(search.toLowerCase()) || 
    s.institutionalId.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl space-y-10 animate-fadeIn pb-24">
      {/* Header with quick stats */}
      <div className="bg-nfsu-navy p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-nfsu-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Identity Governance Hub</h2>
            <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Whitelist Control & Security Audit</p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-nfsu-gold/40 uppercase tracking-widest">Global Records</div>
              <div className="text-3xl font-black italic">{students.length}</div>
            </div>
            <button onClick={() => setIsAdding(true)} className="px-8 py-5 bg-nfsu-gold text-nfsu-navy rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-black/20 border-b-4 border-black/10">Add Registry Entry</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main List Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100 min-h-[600px]">
            <div className="relative mb-10 group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400 group-focus-within:text-nfsu-navy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input 
                type="text" 
                placeholder="SEARCH BY NAME, ID, OR EMAIL..." 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-nfsu-navy transition-all shadow-inner"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Metadata</th>
                    <th className="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
                    <th className="px-4 pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-[11px] font-black text-slate-300 uppercase italic tracking-[0.2em]">No registry matches identified</td>
                    </tr>
                  ) : filtered.map(s => (
                    <tr key={s.id} className="group hover:bg-slate-50/80 transition-all border-l-4 border-transparent hover:border-nfsu-gold">
                      <td className="p-6">
                        <div className="font-black text-nfsu-navy uppercase text-sm tracking-tight">{s.fullName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2 mt-1">
                          <span className="text-nfsu-maroon">{s.institutionalId}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                          {s.email}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${s.role === 'admin' ? 'bg-nfsu-navy/10 text-nfsu-navy border-nfsu-navy/20' : s.role === 'staff' ? 'bg-nfsu-gold/10 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{s.department}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${s.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {s.id !== currentUser?.id ? (
                          <button 
                            onClick={() => toggleStatus(s.id, s.status, s.fullName)} 
                            className={`text-[10px] font-black uppercase transition-all px-4 py-2 rounded-xl border-2 ${s.status === 'Active' ? 'text-nfsu-maroon border-nfsu-maroon/10 hover:bg-nfsu-maroon hover:text-white' : 'text-nfsu-navy border-nfsu-navy/10 hover:bg-nfsu-navy hover:text-white'}`}
                          >
                            {s.status === 'Active' ? 'Revoke' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-[9px] font-black text-slate-300 uppercase italic">Active Session</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Activity Log Column */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] shadow-2xl text-white border-b-8 border-black/20 relative overflow-hidden flex flex-col h-full">
              <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
              <div className="relative z-10 mb-8">
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-nfsu-gold">Audit Trail</h3>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">Real-time Admin Activity Logs</p>
              </div>
              
              <div className="relative z-10 flex-1 space-y-6 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
                {logs.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-[10px] font-black text-white/20 uppercase italic tracking-widest">No activities recorded</p>
                  </div>
                ) : logs.slice(0, 30).map(log => (
                  <div key={log.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 transition-all hover:bg-black/30 group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${log.action === 'ADD_ENTRY' ? 'bg-green-500/20 text-green-400' : 'bg-nfsu-gold/20 text-nfsu-gold'}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="text-[8px] font-black text-white/20">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/70 leading-relaxed uppercase tracking-tight">
                       Admin <span className="text-white">{log.adminEmail.split('@')[0]}</span> modified record for <span className="text-white italic">{log.targetName}</span>
                    </p>
                    {log.details && (
                      <div className="mt-3 pt-3 border-t border-white/5 text-[9px] font-black text-nfsu-gold/50 italic uppercase">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-center opacity-40">
                <span className="text-[9px] font-black uppercase tracking-widest">Authority Session</span>
                <span className="text-[9px] font-black italic">ID: {currentUser?.id}</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAdding && (
        <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-[3rem] p-10 max-w-lg w-full space-y-8 border-4 border-nfsu-gold shadow-2xl animate-slideUp">
             <div>
               <h3 className="text-3xl font-black italic uppercase text-nfsu-navy tracking-tighter">Registry Enrollment</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Identity Binding</p>
             </div>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Legal Full Name</label>
                  <input required placeholder="E.G. HARSH VARDHAN" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs outline-none focus:border-nfsu-navy transition-all" value={newStu.fullName} onChange={e => setNewStu({...newStu, fullName: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Campus Email</label>
                  <input required type="email" placeholder="NAME@NFSU.AC.IN" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs outline-none focus:border-nfsu-navy transition-all" value={newStu.email} onChange={e => setNewStu({...newStu, email: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal ID</label>
                    <input required placeholder="E.G. 4005" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs outline-none focus:border-nfsu-navy transition-all" value={newStu.institutionalId} onChange={e => setNewStu({...newStu, institutionalId: e.target.value})} />
                   </div>
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Designation</label>
                    <select className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs outline-none focus:border-nfsu-navy transition-all" value={newStu.role} onChange={e => setNewStu({...newStu, role: e.target.value as Role})}>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                    </select>
                   </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Department</label>
                  <input required placeholder="E.G. CYBER SECURITY" className="w-full p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs outline-none focus:border-nfsu-navy transition-all" value={newStu.department} onChange={e => setNewStu({...newStu, department: e.target.value})} />
                </div>
             </div>

             <div className="flex gap-4 pt-4">
               <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 border-b-4 border-slate-200">Discard</button>
               <button type="submit" className="flex-2 py-5 bg-nfsu-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl border-b-4 border-black/20">Verify & Commit</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};
