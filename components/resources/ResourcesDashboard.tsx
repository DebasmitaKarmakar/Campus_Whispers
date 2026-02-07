
import React, { useState, useEffect } from 'react';
import { User, QuestionPaper, HelpRequest, ExamType, HelpCategory, SessionType } from '../../types';
import { resourceService } from '../../services/resourceService';

export const ResourcesDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState<'Repository' | 'PeerHelp'>('Repository');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  
  // UI States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [paperFilters, setPaperFilters] = useState({ year: '', semester: '', examType: '' as ExamType | '', branch: '' });

  useEffect(() => {
    setPapers(resourceService.getPapers());
    setHelpRequests(resourceService.getHelpRequests());
  }, []);

  const refreshData = () => {
    setPapers(resourceService.getPapers());
    setHelpRequests(resourceService.getHelpRequests());
  };

  const filteredPapers = papers.filter(p => {
    if (p.isArchived && user.role !== 'admin') return false;
    const matchesYear = !paperFilters.year || p.year === paperFilters.year;
    const matchesSem = !paperFilters.semester || p.semester === paperFilters.semester;
    const matchesExam = !paperFilters.examType || p.examType === paperFilters.examType;
    const matchesBranch = !paperFilters.branch || p.branch.toLowerCase().includes(paperFilters.branch.toLowerCase());
    return matchesYear && matchesSem && matchesExam && matchesBranch;
  });

  return (
    <div className="w-full max-w-6xl space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-nfsu-navy tracking-tighter uppercase italic">Resource Sharing</h2>
            <p className="text-slate-500 font-bold text-sm mt-1">Unified examination repository and peer academic exchange.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
            <button
              onClick={() => setActiveView('Repository')}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeView === 'Repository' ? 'bg-nfsu-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              Paper Bank
            </button>
            <button
              onClick={() => setActiveView('PeerHelp')}
              className={`px-8 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeView === 'PeerHelp' ? 'bg-nfsu-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              Skill Share
            </button>
          </div>
        </div>
      </div>

      {activeView === 'Repository' ? (
        <div className="space-y-8">
          {/* Repository Controls */}
          <div className="bg-nfsu-navy p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-nfsu-gold/50 grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Exam Year</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="2024" value={paperFilters.year} onChange={e => setPaperFilters({...paperFilters, year: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Semester</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="05" value={paperFilters.semester} onChange={e => setPaperFilters({...paperFilters, semester: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Exam Mode</label>
              <select className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] font-black border-2 border-white/10 outline-none uppercase tracking-widest" value={paperFilters.examType} onChange={e => setPaperFilters({...paperFilters, examType: e.target.value as ExamType})}>
                <option className="text-nfsu-navy" value="">ALL MODES</option>
                <option className="text-nfsu-navy" value="Mid-Sem">MID-SEM</option>
                <option className="text-nfsu-navy" value="End-Sem">END-SEM</option>
                <option className="text-nfsu-navy" value="Internal">INTERNAL</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Branch Code</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="CSE" value={paperFilters.branch} onChange={e => setPaperFilters({...paperFilters, branch: e.target.value})} />
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="py-5 bg-nfsu-gold text-nfsu-navy font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl shadow-black/20"
            >
              Contribute PDF
            </button>
          </div>

          {/* Paper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPapers.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                <p className="text-slate-300 font-black uppercase text-xs tracking-[0.5em] italic">No matching records found</p>
              </div>
            ) : (
              filteredPapers.map(paper => (
                <div key={paper.id} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-nfsu-navy hover:shadow-2xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-nfsu-navy text-white text-[10px] font-black uppercase rounded-lg border-2 border-black/10">{paper.examType}</span>
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{paper.year} • SEM {paper.semester}</span>
                  </div>
                  <h4 className="text-xl font-black text-nfsu-navy mb-2 uppercase italic tracking-tighter leading-tight">{paper.branch}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-10">CONTRIBUTOR: {paper.uploaderEmail.split('@')[0]}</p>
                  
                  <div className="flex gap-3">
                    <a 
                      href={paper.pdfUrl} 
                      download={`${paper.branch}_${paper.examType}_${paper.year}.pdf`}
                      className="flex-1 py-4 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl text-center uppercase tracking-widest hover:bg-nfsu-maroon transition-all border-b-4 border-black/20 shadow-xl"
                    >
                      Access PDF
                    </a>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => { resourceService.archivePaper(paper.id); refreshData(); }}
                        className="px-5 py-4 bg-nfsu-maroon text-white rounded-2xl hover:bg-red-700 transition-colors border-b-4 border-black/20 shadow-xl"
                        title="Archive Record"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  {paper.isArchived && (
                    <div className="mt-4 p-2.5 bg-slate-100 text-slate-400 text-[9px] font-black text-center rounded-xl uppercase border-2 border-slate-200">Historical Record Archived</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Peer Help Controls */}
          <div className="bg-nfsu-maroon p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-black/20 text-white flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Skill Share Registry</h3>
              <p className="text-nfsu-lightgold/60 text-xs font-bold mt-1 uppercase tracking-tight">Post requests or offer mentorship in the campus help marketplace.</p>
            </div>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="px-10 py-4 bg-white text-nfsu-maroon font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-nfsu-gold hover:text-nfsu-navy transition-all shadow-2xl shadow-black/20 border-b-4 border-black/10"
            >
              Request Skill
            </button>
          </div>

          {/* Help Requests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpRequests.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                <p className="text-slate-300 font-black uppercase text-xs tracking-[0.5em] italic">Community help board clear</p>
              </div>
            ) : (
              helpRequests.map(req => {
                const isMyRequest = req.requesterEmail === user.email;
                const isIHelping = req.helperEmail === user.email;
                const isSomeoneElseHelping = req.helperEmail && req.helperEmail !== user.email;

                return (
                  <div key={req.id} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 flex flex-col hover:border-nfsu-navy hover:shadow-2xl transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border-2 ${req.category === 'Academic' ? 'bg-nfsu-navy text-white border-black/10' : 'bg-nfsu-gold text-nfsu-navy border-white/30'}`}>
                        {req.category}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 ${
                        req.status === 'Open' ? 'bg-green-50 text-green-600 border-green-100 animate-pulse' :
                        req.status === 'Completed' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-nfsu-maroon text-white border-black/10'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <h4 className="text-xl font-black text-nfsu-navy mb-2 uppercase italic tracking-tighter">{req.topic}</h4>
                    <p className="text-[11px] text-slate-500 font-bold mb-8 flex-1 leading-relaxed uppercase">{req.description || 'Description strictly academic.'}</p>
                    
                    <div className="space-y-3 mb-10 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {req.preferredTime && <div className="flex items-center gap-3"><span className="text-nfsu-navy">TIME</span> {req.preferredTime}</div>}
                      {req.preferredPlace && <div className="flex items-center gap-3"><span className="text-nfsu-navy">LOC</span> {req.preferredPlace}</div>}
                      <div className="flex items-center gap-3"><span className="text-nfsu-navy">MODE</span> {req.sessionType}</div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      {/* Workflow Logic */}
                      {req.status === 'Open' && !isMyRequest && (
                        <button 
                          onClick={() => { resourceService.offerHelp(req.id, user.email, req.sessionType); refreshData(); }}
                          className="w-full py-4 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.3em] hover:bg-nfsu-maroon transition-all shadow-xl border-b-4 border-black/20"
                        >
                          Provide Help
                        </button>
                      )}

                      {req.status === 'Matched' && isIHelping && (
                        <div className="space-y-3">
                          <button 
                            disabled
                            className="w-full py-4 bg-slate-100 text-slate-400 text-[10px] font-black rounded-2xl uppercase tracking-widest border-b-4 border-slate-200"
                          >
                            Interested Expressed
                          </button>
                          <button 
                            onClick={() => { resourceService.withdrawHelp(req.id); refreshData(); }}
                            className="w-full py-3 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-red-100 transition-colors"
                          >
                            Withdraw Help
                          </button>
                        </div>
                      )}

                      {req.status === 'Matched' && isSomeoneElseHelping && (
                        <button 
                          disabled
                          className="w-full py-4 bg-slate-50 text-slate-300 text-[10px] font-black rounded-2xl uppercase tracking-widest italic"
                        >
                          Help Assigned
                        </button>
                      )}

                      {req.status === 'Matched' && isMyRequest && (
                        <button 
                          onClick={() => { resourceService.updateHelpStatus(req.id, 'Scheduled'); refreshData(); }}
                          className="w-full py-4 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl border-b-4 border-black/10"
                        >
                          Confirm & Schedule
                        </button>
                      )}

                      {req.status === 'Scheduled' && (isMyRequest || isIHelping) && (
                        <div className="space-y-3">
                           <div className="text-center text-[10px] font-black text-nfsu-navy uppercase mb-2 tracking-[0.3em] italic underline decoration-nfsu-gold decoration-4">Meeting Officialized</div>
                           {isMyRequest && (
                             <button 
                                onClick={() => { resourceService.updateHelpStatus(req.id, 'Completed'); refreshData(); }}
                                className="w-full py-4 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-black transition-all border-b-4 border-white/10"
                              >
                                Mark Completed
                              </button>
                           )}
                        </div>
                      )}

                      {req.status === 'Completed' && (
                        <div className="text-center py-3 bg-slate-50 rounded-2xl border-2 border-slate-100">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Help Transfer Finalized</div>
                        </div>
                      )}

                      {isMyRequest && req.status === 'Open' && (
                        <button 
                          onClick={() => { resourceService.updateHelpStatus(req.id, 'Archived'); refreshData(); }}
                          className="w-full py-4 bg-white text-slate-400 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-all border-2 border-slate-100"
                        >
                          Close Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {showUploadModal && (
        <RepositoryUploadModal user={user} onClose={() => setShowUploadModal(false)} onCreated={() => { setShowUploadModal(false); refreshData(); }} />
      )}
      {showHelpModal && (
        <HelpRequestModal user={user} onClose={() => setShowHelpModal(false)} onCreated={() => { setShowHelpModal(false); refreshData(); }} />
      )}
    </div>
  );
};

// Modals styling preserved but labels verified...
const RepositoryUploadModal: React.FC<{ user: User, onClose: () => void, onCreated: () => void }> = ({ user, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ year: '', semester: '', examType: 'Mid-Sem' as ExamType, branch: '', pdfUrl: '' });
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Strictly PDF format only.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, pdfUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = resourceService.uploadPaper(user, formData);
    if (!res.success) {
      setError(res.message);
    } else {
      onCreated();
    }
  };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border-4 border-nfsu-gold">
        <div className="bg-nfsu-navy p-10 text-white">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Paper Registry</h2>
          <p className="text-nfsu-gold text-[10px] font-black uppercase tracking-[0.3em] mt-3">Single PDF file per session permitted.</p>
        </div>
        <form onSubmit={submit} className="p-10 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <input required type="text" placeholder="YEAR (E.G. 2024)" className="p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            <input required type="text" placeholder="SEMESTER (E.G. 4)" className="p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
          </div>
          <select className="w-full p-5 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value as ExamType})}>
            <option value="Mid-Sem">MID-SEM</option>
            <option value="End-Sem">END-SEM</option>
            <option value="Internal">INTERNAL</option>
          </select>
          <input required type="text" placeholder="BRANCH (E.G. B.TECH CSE)" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
          
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-slate-50 relative group">
            {formData.pdfUrl ? (
              <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Document Registry Success</div>
            ) : (
              <>
                <input required type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-nfsu-navy transition-colors">Select PDF Document</div>
              </>
            )}
          </div>

          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-tight">{error}</p>}

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200">Dismiss</button>
            <button type="submit" className="flex-2 py-5 bg-nfsu-navy text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl border-b-4 border-black/20">Commit PDF</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HelpRequestModal: React.FC<{ user: User, onClose: () => void, onCreated: () => void }> = ({ user, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ topic: '', category: 'Academic' as HelpCategory, sessionType: 'Individual' as SessionType, description: '', preferredTime: '', preferredPlace: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    resourceService.createHelpRequest(user.email, formData);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border-4 border-nfsu-gold">
        <div className="bg-nfsu-maroon p-10 text-white">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Skill Share Registry</h2>
          <p className="text-nfsu-lightgold/70 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Community Mentorship Initialization</p>
        </div>
        <form onSubmit={submit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Skill / Topic Required</label>
            <input required type="text" placeholder="E.G. DATA STRUCTURES OR FIGMA" className="w-full p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
              <select className="w-full p-5 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as HelpCategory})}>
                <option value="Academic">ACADEMIC</option>
                <option value="Skill-based">SKILL-BASED</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mode</label>
              <select className="w-full p-5 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.sessionType} onChange={e => setFormData({...formData, sessionType: e.target.value as SessionType})}>
                <option value="Individual">INDIVIDUAL</option>
                <option value="Group">GROUP</option>
              </select>
            </div>
          </div>
          <textarea placeholder="Describe specifically what you aim to learn or solve..." className="w-full p-5 bg-slate-50 rounded-2xl text-xs font-bold h-32 outline-none border-2 border-slate-100 focus:border-nfsu-navy uppercase" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-6">
            <input type="text" placeholder="TIME (E.G. 4 PM TUE)" className="p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100" value={formData.preferredTime} onChange={e => setFormData({...formData, preferredTime: e.target.value})} />
            <input type="text" placeholder="LOCATION (E.G. LIBRARY)" className="p-5 bg-slate-50 rounded-2xl text-[11px] font-black uppercase border-2 border-slate-100" value={formData.preferredPlace} onChange={e => setFormData({...formData, preferredPlace: e.target.value})} />
          </div>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border-b-4 border-slate-200">Dismiss</button>
            <button type="submit" className="flex-2 py-5 bg-nfsu-maroon text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl border-b-4 border-black/20">Post Registry</button>
          </div>
        </form>
      </div>
    </div>
  );
};
