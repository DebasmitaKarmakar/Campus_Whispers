
import React, { useState } from 'react';
import { dbService } from '../../services/dbService';
import { StudentMaster, Role, AccountStatus } from '../../types';

export const AdminStudentManager: React.FC = () => {
  const [students, setStudents] = useState<StudentMaster[]>(dbService.getTable<StudentMaster>('students'));
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStu, setNewStu] = useState({ email: '', enrollment: '', fullName: '', department: '', role: 'student' as Role });

  const refresh = () => setStudents(dbService.getTable<StudentMaster>('students'));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `${newStu.role === 'admin' ? 'ADM' : 'STU'}-${newStu.enrollment}`;
    const entry: StudentMaster = { ...newStu, id, status: 'Active', createdAt: Date.now() };
    dbService.saveTable('students', [entry, ...students]);
    setIsAdding(false);
    refresh();
  };

  const toggleStatus = (id: string, current: AccountStatus) => {
    dbService.updateRow<StudentMaster>('students', id, { status: current === 'Active' ? 'Disabled' : 'Active' });
    refresh();
  };

  const filtered = students.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.enrollment.includes(search));

  return (
    <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
      <div className="bg-nfsu-navy p-10 rounded-[2.5rem] text-white flex justify-between items-center border-b-8 border-nfsu-gold">
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Student Master Table</h2>
          <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Identity Oversight</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-white text-nfsu-navy rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-nfsu-gold transition-all">Add Whitelist Entry</button>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
        <input 
          type="text" 
          placeholder="SEARCH IDENTITY REGISTRY..." 
          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 outline-none focus:border-nfsu-navy"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity / ID</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-black text-nfsu-navy uppercase text-sm">{s.fullName}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{s.id} • {s.email}</div>
                  </td>
                  <td className="p-4 text-[10px] font-black text-slate-500 uppercase">{s.department}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase">{s.role}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => toggleStatus(s.id, s.status)} className="text-[10px] font-black uppercase text-nfsu-maroon underline decoration-2 underline-offset-4">
                      {s.status === 'Active' ? 'Disable' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleAdd} className="bg-white rounded-[3rem] p-10 max-w-lg w-full space-y-6 border-4 border-nfsu-gold">
             <h3 className="text-2xl font-black italic uppercase text-nfsu-navy mb-8">New Whitelist Entry</h3>
             <input required placeholder="FULL NAME" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs" value={newStu.fullName} onChange={e => setNewStu({...newStu, fullName: e.target.value})} />
             <input required type="email" placeholder="INSTITUTIONAL EMAIL" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs" value={newStu.email} onChange={e => setNewStu({...newStu, email: e.target.value})} />
             <div className="grid grid-cols-2 gap-4">
                <input required placeholder="ENROLLMENT" className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs" value={newStu.enrollment} onChange={e => setNewStu({...newStu, enrollment: e.target.value})} />
                <select className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs" value={newStu.role} onChange={e => setNewStu({...newStu, role: e.target.value as Role})}>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
             </div>
             <input required placeholder="DEPARTMENT (E.G. CSE)" className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 uppercase font-black text-xs" value={newStu.department} onChange={e => setNewStu({...newStu, department: e.target.value})} />
             <div className="flex gap-4 pt-4">
               <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">Cancel</button>
               <button type="submit" className="flex-1 py-4 bg-nfsu-navy text-white rounded-2xl font-black uppercase text-[10px]">Verify & Add</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};
