
import React, { useState, useEffect } from 'react';
import { User, QuestionPaper, HelpRequest, ExamType, HelpCategory, SessionType, SkillOffer, ResourceCategory } from '../../types';
import { resourceService } from '../../services/resourceService';

export const ResourcesDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState<'Repository' | 'PeerHelp'>('Repository');
  const [repoType, setRepoType] = useState<ResourceCategory>('Paper');
  const [peerHelpView, setPeerHelpView] = useState<'Requests' | 'Experts'>('Requests');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [skillOffers, setSkillOffers] = useState<SkillOffer[]>([]);
  
  // UI States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSkillOfferModal, setShowSkillOfferModal] = useState(false);
  const [repoFilters, setRepoFilters] = useState({ year: '', semester: '', examType: '' as ExamType | '', branch: '', subject: '' });

  useEffect(() => {
    setPapers(resourceService.getPapers());
    setHelpRequests(resourceService.getHelpRequests());
    setSkillOffers(resourceService.getSkillOffers());
  }, []);

  const refreshData = () => {
    setPapers(resourceService.getPapers());
    setHelpRequests(resourceService.getHelpRequests());
    setSkillOffers(resourceService.getSkillOffers());
  };

  const filteredResources = papers.filter(p => {
    if (p.isArchived && user.role !== 'admin') return false;
    if (p.resourceType !== repoType) return false;
    const matchesYear = !repoFilters.year || p.year === repoFilters.year;
    const matchesSem = !repoFilters.semester || p.semester === repoFilters.semester;
    const matchesExam = repoType === 'Paper' ? (!repoFilters.examType || p.examType === repoFilters.examType) : true;
    const matchesBranch = !repoFilters.branch || p.branch.toLowerCase().includes(repoFilters.branch.toLowerCase());
    const matchesSubject = !repoFilters.subject || p.subject.toLowerCase().includes(repoFilters.subject.toLowerCase());
    return matchesYear && matchesSem && matchesExam && matchesBranch && matchesSubject;
  });

  return (
    <div className="w-full max-w-6xl space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border-2 border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-nfsu-navy tracking-tighter uppercase italic">Institutional Sharing</h2>
            <p className="text-slate-500 font-bold text-sm mt-1">Unified examination repository and peer academic exchange.</p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 w-fit">
            <button
              onClick={() => setActiveView('Repository')}
              className={`px-6 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${activeView === 'Repository' ? 'bg-nfsu-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              Academic Bank
            </button>
            <button
              onClick={() => setActiveView('PeerHelp')}
              className={`px-6 md:px-8 py-3 rounded-xl text-[10px] md:text-xs font-black transition-all uppercase tracking-widest ${activeView === 'PeerHelp' ? 'bg-nfsu-navy text-white shadow-lg' : 'text-slate-400 hover:text-slate-800'}`}
            >
              Skill Share
            </button>
          </div>
        </div>
      </div>

      {activeView === 'Repository' ? (
        <div className="space-y-8">
          {/* Sub-Tabs for Repo Type */}
          <div className="flex gap-4 border-b-2 border-slate-100 pb-2 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setRepoType('Paper')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${repoType === 'Paper' ? 'border-nfsu-navy text-nfsu-navy' : 'border-transparent text-slate-300'}`}
            >
              Exam Papers
            </button>
            <button 
              onClick={() => setRepoType('Notes')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${repoType === 'Notes' ? 'border-nfsu-navy text-nfsu-navy' : 'border-transparent text-slate-300'}`}
            >
              Subject Notes
            </button>
          </div>

          {/* Repository Controls - Responsive Grid */}
          <div className="bg-nfsu-navy p-6 md:p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-nfsu-gold/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Year</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="2025" value={repoFilters.year} onChange={e => setRepoFilters({...repoFilters, year: e.target.value})} />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Sem</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="04" value={repoFilters.semester} onChange={e => setRepoFilters({...repoFilters, semester: e.target.value})} />
            </div>
            <div className={`space-y-2 lg:col-span-1 ${repoType === 'Notes' ? 'opacity-30 pointer-events-none' : ''}`}>
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Mode</label>
              <select className="w-full p-4 bg-white/5 rounded-2xl text-white text-[10px] font-black border-2 border-white/10 outline-none uppercase tracking-widest" value={repoFilters.examType} onChange={e => setRepoFilters({...repoFilters, examType: e.target.value as ExamType})}>
                <option className="text-nfsu-navy" value="">ALL</option>
                <option className="text-nfsu-navy" value="End-Sem">END-SEM</option>
                <option className="text-nfsu-navy" value="Mid-Sem">MID-SEM</option>
                <option className="text-nfsu-navy" value="CA1">CA1</option>
                <option className="text-nfsu-navy" value="CA2">CA2</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Branch</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="CSE" value={repoFilters.branch} onChange={e => setRepoFilters({...repoFilters, branch: e.target.value})} />
            </div>
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-nfsu-gold/50 uppercase tracking-[0.2em]">Subject</label>
              <input type="text" className="w-full p-4 bg-white/5 rounded-2xl text-white text-sm font-black border-2 border-white/10 outline-none focus:border-nfsu-gold" placeholder="Cyber" value={repoFilters.subject} onChange={e => setRepoFilters({...repoFilters, subject: e.target.value})} />
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="py-5 bg-nfsu-gold text-nfsu-navy font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-2xl shadow-black/20"
            >
              Upload {repoType}
            </button>
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredResources.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                <p className="text-slate-300 font-black uppercase text-xs tracking-[0.5em] italic">No {repoType} matching these parameters</p>
              </div>
            ) : (
              filteredResources.map(paper => (
                <div key={paper.id} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-nfsu-navy hover:shadow-2xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -rotate-12 translate-x-12 -translate-y-12 flex items-center justify-center opacity-40">
                      <span className="text-4xl">{repoType === 'Paper' ? '📄' : '📓'}</span>
                   </div>
                  <div className="flex justify-between items-start mb-6">
                    {repoType === 'Paper' ? (
                       <span className="px-3 py-1 bg-nfsu-navy text-white text-[10px] font-black uppercase rounded-lg border-2 border-black/10">{paper.examType}</span>
                    ) : (
                       <span className="px-3 py-1 bg-nfsu-gold text-nfsu-navy text-[10px] font-black uppercase rounded-lg border-2 border-white/30">SUBJECT NOTES</span>
                    )}
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{paper.year} • SEM {paper.semester}</span>
                  </div>
                  <h4 className="text-xl font-black text-nfsu-navy mb-2 uppercase italic tracking-tighter leading-tight relative z-10">{paper.subject}</h4>
                  <p className="text-[11px] text-nfsu-maroon font-black uppercase mb-1 tracking-widest">{paper.branch}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10">CONTRIBUTOR: {paper.uploaderName || paper.uploaderEmail.split('@')[0]}</p>
                  
                  <div className="flex gap-3 relative z-10">
                    <a 
                      href={paper.pdfUrl} 
                      download={`${paper.subject}_${paper.year}.pdf`}
                      className="flex-1 py-4 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl text-center uppercase tracking-widest hover:bg-nfsu-maroon transition-all border-b-4 border-black/20 shadow-xl"
                    >
                      Download PDF
                    </a>
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => { resourceService.archivePaper(paper.id); refreshData(); }}
                        className="px-5 py-4 bg-nfsu-maroon text-white rounded-2xl hover:bg-red-700 transition-colors border-b-4 border-black/20 shadow-xl"
                        title="Archive"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Peer Help Controls */}
          <div className="bg-nfsu-maroon p-6 md:p-10 rounded-[2.5rem] shadow-2xl border-b-8 border-black/20 text-white flex flex-col xl:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-4 w-full xl:w-auto">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Skill Share Registry</h3>
                <p className="text-nfsu-lightgold/60 text-xs font-bold mt-1 uppercase tracking-tight">Active mentorship and community support registry.</p>
              </div>
              <div className="flex bg-black/20 p-1 rounded-xl w-fit">
                 <button 
                  onClick={() => setPeerHelpView('Requests')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${peerHelpView === 'Requests' ? 'bg-nfsu-gold text-nfsu-navy' : 'text-white/40 hover:text-white'}`}
                 >
                   Help Requests
                 </button>
                 <button 
                  onClick={() => setPeerHelpView('Experts')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${peerHelpView === 'Experts' ? 'bg-nfsu-gold text-nfsu-navy' : 'text-white/40 hover:text-white'}`}
                 >
                   Expert Directory
                 </button>
              </div>
            </div>
            
            <div className="bg-black/10 p-4 rounded-2xl max-w-md hidden lg:block">
               <div className="text-[10px] font-black text-nfsu-gold uppercase mb-2">Registry Context</div>
               <p className="text-[9px] font-bold text-white/50 uppercase leading-relaxed tracking-tight italic">
                  {peerHelpView === 'Requests' ? 'POSTS BY STUDENTS NEEDING IMMEDIATE HELP WITH TOPICS.' : 'PROFILES OF VERIFIED EXPERTS AVAILABLE FOR ONGOING MENTORSHIP.'}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
               <button 
                onClick={() => setShowSkillOfferModal(true)}
                className="flex-1 xl:flex-none px-8 py-4 bg-nfsu-navy text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-nfsu-navy transition-all shadow-2xl shadow-black/20 border-b-4 border-black/10"
              >
                Become Expert
              </button>
              <button 
                onClick={() => setShowHelpModal(true)}
                className="flex-1 xl:flex-none px-8 py-4 bg-white text-nfsu-maroon font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-nfsu-gold hover:text-nfsu-navy transition-all shadow-2xl shadow-black/20 border-b-4 border-black/10"
              >
                Post Request
              </button>
            </div>
          </div>

          {/* Content View */}
          {peerHelpView === 'Requests' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {helpRequests.length === 0 ? (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                  <p className="text-slate-300 font-black uppercase text-xs tracking-[0.5em] italic">Help registry currently clear</p>
                </div>
              ) : (
                helpRequests.map(req => {
                  const isMyRequest = req.requesterEmail === user.email;
                  const isIHelping = req.helperEmail === user.email;
                  return (
                    <div key={req.id} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 flex flex-col hover:border-nfsu-navy transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border-2 ${req.category === 'Academic' ? 'bg-nfsu-navy text-white border-black/10' : 'bg-nfsu-gold text-nfsu-navy border-white/30'}`}>
                          {req.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 ${
                          req.status === 'Open' ? 'bg-green-50 text-green-600 border-green-100' :
                          req.status === 'Completed' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-nfsu-maroon text-white border-black/10'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-nfsu-navy mb-2 uppercase italic tracking-tighter">{req.topic}</h4>
                      <p className="text-[11px] text-slate-500 font-bold mb-8 flex-1 leading-relaxed uppercase">{req.description || 'Description strictly academic.'}</p>
                      <div className="space-y-3 mb-10 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl">
                        {req.preferredTime && <div className="flex items-center gap-3"><span>TIME</span> <span className="text-nfsu-navy">{req.preferredTime}</span></div>}
                        {req.preferredPlace && <div className="flex items-center gap-3"><span>LOC</span> <span className="text-nfsu-navy">{req.preferredPlace}</span></div>}
                        <div className="flex items-center gap-3"><span>MODE</span> <span className="text-nfsu-navy">{req.sessionType}</span></div>
                      </div>
                      <div className="pt-6 border-t border-slate-100">
                        {req.status === 'Open' && !isMyRequest && (
                          <button onClick={() => { resourceService.offerHelp(req.id, user.email, req.sessionType); refreshData(); }} className="w-full py-4 bg-nfsu-navy text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.3em] shadow-xl border-b-4 border-black/20">Provide Help</button>
                        )}
                        {req.status === 'Completed' && (
                          <div className="text-center py-3 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase italic">Session Closed</div>
                        )}
                        {isMyRequest && req.status === 'Open' && (
                          <button onClick={() => { resourceService.updateHelpStatus(req.id, 'Archived'); refreshData(); }} className="w-full py-4 bg-white text-slate-400 text-[10px] font-black rounded-2xl uppercase tracking-widest border-2 border-slate-100">Withdraw</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {skillOffers.length === 0 ? (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                  <p className="text-slate-300 font-black uppercase text-xs tracking-[0.5em] italic">No experts verified</p>
                </div>
              ) : (
                skillOffers.map(offer => (
                  <div key={offer.id} className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 flex flex-col hover:border-nfsu-gold hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-nfsu-gold/5 -rotate-12 translate-x-8 -translate-y-8 flex items-center justify-center p-4">
                       <span className="text-3xl opacity-20">✓</span>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg border-2 ${offer.category === 'Academic' ? 'bg-nfsu-navy text-white border-black/10' : 'bg-nfsu-gold text-nfsu-navy border-white/30'}`}>
                        {offer.category}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-nfsu-navy mb-2 uppercase italic tracking-tighter">{offer.subject}</h4>
                    <p className="text-[11px] text-slate-500 font-bold mb-8 flex-1 leading-relaxed uppercase">{offer.description}</p>
                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase">
                       IDENTIFIER: <span className="text-nfsu-navy">{offer.expertEmail.split('@')[0]}</span>
                    </div>
                    <a href={offer.proficiencyPdfUrl} download className="w-full py-4 bg-nfsu-gold text-nfsu-navy text-[10px] font-black rounded-2xl text-center uppercase tracking-widest hover:bg-nfsu-navy hover:text-white transition-all border-b-4 border-black/10">View Proficiency</a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* --- MODALS - UPDATED FOR RESPONSIVENESS AND NEW FIELDS --- */}
      {showUploadModal && (
        <RepositoryUploadModal user={user} type={repoType} onClose={() => setShowUploadModal(false)} onCreated={() => { setShowUploadModal(false); refreshData(); }} />
      )}
      {showHelpModal && (
        <HelpRequestModal user={user} onClose={() => setShowHelpModal(false)} onCreated={() => { setShowHelpModal(false); refreshData(); }} />
      )}
      {showSkillOfferModal && (
        <SkillOfferModal user={user} onClose={() => setShowSkillOfferModal(false)} onCreated={() => { setShowSkillOfferModal(false); refreshData(); }} />
      )}
    </div>
  );
};

// Modal Components - Overhauled for scrolling and mobile support
const RepositoryUploadModal: React.FC<{ user: User, type: ResourceCategory, onClose: () => void, onCreated: () => void }> = ({ user, type, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ year: '', semester: '', examType: 'Mid-Sem' as ExamType, branch: '', subject: '', pdfUrl: '' });
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, pdfUrl: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setError('PDF files only.');
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pdfUrl) {
      setError('PDF file required.');
      return;
    }
    const res = resourceService.uploadResource(user, { ...formData, resourceType: type });
    if (!res.success) setError(res.message); else onCreated();
  };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border-4 border-nfsu-gold flex flex-col max-h-[90vh]">
        <div className="bg-nfsu-navy p-6 md:p-8 text-white shrink-0">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Academic Contribution</h2>
          <p className="text-nfsu-gold text-[10px] font-black uppercase tracking-[0.3em] mt-2">Registry: {type}</p>
        </div>
        <form onSubmit={submit} className="p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="YEAR (2025)" className="p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
            <input required type="text" placeholder="SEM (04)" className="p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} />
          </div>
          {type === 'Paper' && (
            <select className="w-full p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.examType} onChange={e => setFormData({...formData, examType: e.target.value as ExamType})}>
              <option value="End-Sem">END-SEM</option>
              <option value="Mid-Sem">MID-SEM</option>
              <option value="CA1">CA1</option>
              <option value="CA2">CA2</option>
            </select>
          )}
          <input required type="text" placeholder="SUBJECT NAME" className="w-full p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          <input required type="text" placeholder="BRANCH (E.G. CSE)" className="w-full p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none focus:border-nfsu-navy" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
          <input disabled type="text" value={`CONTRIBUTOR: ${user.fullName.toUpperCase()}`} className="w-full p-4 bg-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase border-2 border-slate-100 italic" />
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 relative group">
            <input required type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{formData.pdfUrl ? 'DOCUMENT LOADED' : 'ATTACH PDF RECORD'}</div>
          </div>
          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest">Cancel</button>
            <button type="submit" className="flex-2 py-4 bg-nfsu-navy text-white font-black rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-xl">Commit Registry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HelpRequestModal: React.FC<{ user: User, onClose: () => void, onCreated: () => void }> = ({ user, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ topic: '', category: 'Academic' as HelpCategory, sessionType: 'Individual' as SessionType, description: '', preferredTime: '', preferredPlace: '' });
  const submit = (e: React.FormEvent) => { e.preventDefault(); resourceService.createHelpRequest(user.email, formData); onCreated(); };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border-4 border-nfsu-gold flex flex-col max-h-[90vh]">
        <div className="bg-nfsu-maroon p-6 md:p-8 text-white shrink-0">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Help Wanted</h2>
          <p className="text-nfsu-lightgold/70 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Community Peer Request</p>
        </div>
        <form onSubmit={submit} className="p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <input required type="text" placeholder="HELP TOPIC" className="w-full p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select className="w-full p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as HelpCategory})}>
              <option value="Academic">ACADEMIC</option>
              <option value="Skill-based">SKILL-BASED</option>
            </select>
            <select className="w-full p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.sessionType} onChange={e => setFormData({...formData, sessionType: e.target.value as SessionType})}>
              <option value="Individual">INDIVIDUAL</option>
              <option value="Group">GROUP</option>
            </select>
          </div>
          <textarea placeholder="DESCRIBE HELP NEEDED..." className="w-full p-4 bg-slate-50 rounded-xl text-xs font-bold h-24 outline-none border-2 border-slate-100 focus:border-nfsu-navy uppercase" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="TIME PREFERENCE" className="p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100" value={formData.preferredTime} onChange={e => setFormData({...formData, preferredTime: e.target.value})} />
            <input type="text" placeholder="LOCATION" className="p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100" value={formData.preferredPlace} onChange={e => setFormData({...formData, preferredPlace: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest">Dismiss</button>
            <button type="submit" className="flex-2 py-4 bg-nfsu-maroon text-white font-black rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-xl">Post Registry</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SkillOfferModal: React.FC<{ user: User, onClose: () => void, onCreated: () => void }> = ({ user, onClose, onCreated }) => {
  const [formData, setFormData] = useState({ subject: '', category: 'Academic' as HelpCategory, description: '', proficiencyPdfUrl: '' });
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, proficiencyPdfUrl: reader.result as string }));
      reader.readAsDataURL(file);
    } else { setError('PDF only.'); }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proficiencyPdfUrl) { setError('Verification PDF required.'); return; }
    resourceService.createSkillOffer(user.email, formData);
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/95 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp border-4 border-nfsu-gold flex flex-col max-h-[90vh]">
        <div className="bg-nfsu-navy p-6 md:p-8 text-white shrink-0">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Become Expert</h2>
          <p className="text-nfsu-gold text-[10px] font-black uppercase tracking-[0.3em] mt-2">Community Mentorship Profile</p>
        </div>
        <form onSubmit={submit} className="p-6 md:p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <input required type="text" placeholder="EXPERT TOPIC / SUBJECT" className="w-full p-4 bg-slate-50 rounded-xl text-[11px] font-black uppercase border-2 border-slate-100 outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
          <select className="w-full p-4 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as HelpCategory})}>
            <option value="Academic">ACADEMIC EXPERT</option>
            <option value="Skill-based">SKILL-BASED EXPERT</option>
          </select>
          <textarea placeholder="DESCRIBE YOUR CREDENTIALS..." className="w-full p-4 bg-slate-50 rounded-xl text-xs font-bold h-24 outline-none border-2 border-slate-100 focus:border-nfsu-navy uppercase" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 relative group">
            <input required type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{formData.proficiencyPdfUrl ? 'VERIFICATION LOADED' : 'ATTACH PROFICIENCY PROOF (PDF)'}</div>
          </div>
          {error && <p className="text-red-500 text-[10px] font-black text-center uppercase">{error}</p>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-xl text-[10px] uppercase tracking-widest">Dismiss</button>
            <button type="submit" className="flex-2 py-4 bg-nfsu-navy text-white font-black rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-xl">Apply Expertise</button>
          </div>
        </form>
      </div>
    </div>
  );
};
