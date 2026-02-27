import React from 'react';
import { User } from '../../types';

interface DirectoryEntry {
  id: string;
  name: string;
  description: string;
  website: string;
  email: string;
}

const DIRECTORY_ENTRIES: DirectoryEntry[] = [
  {
    id: 'ecell',
    name: 'E-Cell NFSU',
    description: 'Entrepreneurship cell fostering startup culture, business ideation, and innovation among NFSU students.',
    website: 'https://e-cell-website-live.vercel.app/events-detail.html?id=2',
    email: 'ecell@nfsu.ac.in',
  },
  {
    id: 'library',
    name: 'Central Library',
    description: 'University central library providing access to academic journals, digital repositories, and reference services.',
    website: 'https://library.nfsu.ac.in',
    email: 'library@nfsu.ac.in',
  },
  {
    id: 'nss',
    name: 'NSS Unit',
    description: 'National Service Scheme unit coordinating community service, social outreach, and volunteer programmes at NFSU.',
    website: 'https://nss.nfsu.ac.in',
    email: 'nss@nfsu.ac.in',
  },
  {
    id: 'coding-club',
    name: 'Coding Club',
    description: 'Student-run club for competitive programming, hackathons, open-source contributions, and software development workshops.',
    website: 'https://codingclub-nfsu.vercel.app/',
    email: 'coding@nfsu.ac.in',
  },
  {
    id: 'literary-society',
    name: 'Literary Society',
    description: 'Campus literary body organising debates, creative writing workshops, poetry events, and publication of the student journal.',
    website: 'https://literary.nfsu.ac.in',
    email: 'literary@nfsu.ac.in',
  },
];

export const CampusDirectory: React.FC<{ user: User }> = () => {
  return (
    <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
      <div className="bg-nfsu-navy p-10 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-nfsu-maroon relative overflow-hidden">
        <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Campus Directory</h2>
          <p className="text-nfsu-gold/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">
            Official Campus Organisations and Cells
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {DIRECTORY_ENTRIES.map(entry => (
            <div key={entry.id} className="p-8 group hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-nfsu-maroon">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-black text-nfsu-navy text-base uppercase tracking-tight group-hover:text-nfsu-maroon transition-colors mb-2">
                    {entry.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed uppercase tracking-tight max-w-xl">
                    {entry.description}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-nfsu-maroon transition-colors"
                    >
                      {entry.email}
                    </a>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <a
                    href={entry.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-nfsu-navy text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-nfsu-maroon transition-all shadow-md border-b-4 border-black/20"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center pb-8">
        5 registered organisations — contact the administration to update directory information
      </p>
    </div>
  );
};

export default CampusDirectory;
