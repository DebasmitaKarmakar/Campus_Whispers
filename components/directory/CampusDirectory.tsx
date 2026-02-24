import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CampusOrg, OrgType, OrgStatus, SocialLinks, User } from '../../types';
import { dbService } from '../../services/dbService';

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<OrgType, string> = {
  club:      'Club',
  library:   'Library',
  committee: 'Committee',
  cell:      'Cell',
  service:   'Service',
};

const TYPE_COLORS: Record<OrgType, string> = {
  club:      'bg-blue-100 text-blue-800 border-blue-200',
  library:   'bg-amber-100 text-amber-800 border-amber-200',
  committee: 'bg-purple-100 text-purple-800 border-purple-200',
  cell:      'bg-green-100 text-green-800 border-green-200',
  service:   'bg-slate-100 text-slate-700 border-slate-200',
};

const TYPE_BG: Record<OrgType, string> = {
  club:      'bg-blue-600',
  library:   'bg-amber-600',
  committee: 'bg-purple-600',
  cell:      'bg-green-600',
  service:   'bg-slate-600',
};

const ALL_TYPES: Array<OrgType | 'all'> = ['all', 'club', 'cell', 'committee', 'library', 'service'];

// ─── Empty form state ─────────────────────────────────────────────────────────

interface OrgFormState {
  name:          string;
  type:          OrgType;
  description:   string;
  website:       string;
  email:         string;
  logo:          string;
  facultyAdvisor:string;
  status:        OrgStatus;
  instagram:     string;
  linkedin:      string;
  twitter:       string;
  github:        string;
}

const EMPTY_FORM: OrgFormState = {
  name:          '',
  type:          'club',
  description:   '',
  website:       '',
  email:         '',
  logo:          '',
  facultyAdvisor:'',
  status:        'active',
  instagram:     '',
  linkedin:      '',
  twitter:       '',
  github:        '',
};

const orgToForm = (org: CampusOrg): OrgFormState => ({
  name:           org.name,
  type:           org.type ?? 'club',
  description:    org.description ?? '',
  website:        org.website ?? '',
  email:          org.email ?? '',
  logo:           org.logo ?? '',
  facultyAdvisor: org.facultyAdvisor ?? '',
  status:         org.status ?? 'active',
  instagram:      org.socialLinks?.instagram ?? '',
  linkedin:       org.socialLinks?.linkedin ?? '',
  twitter:        org.socialLinks?.twitter ?? '',
  github:         org.socialLinks?.github ?? '',
});

const formToOrg = (form: OrgFormState, existingId?: string): CampusOrg => {
  const socialLinks: SocialLinks = {};
  if (form.instagram.trim()) socialLinks.instagram = form.instagram.trim();
  if (form.linkedin.trim())  socialLinks.linkedin  = form.linkedin.trim();
  if (form.twitter.trim())   socialLinks.twitter   = form.twitter.trim();
  if (form.github.trim())    socialLinks.github    = form.github.trim();

  return {
    id:             existingId ?? `ORG-${Date.now()}`,
    name:           form.name.trim(),
    type:           form.type,
    description:    form.description.trim() || undefined,
    website:        form.website.trim() || undefined,
    email:          form.email.trim() || undefined,
    logo:           form.logo.trim() || undefined,
    facultyAdvisor: form.facultyAdvisor.trim() || undefined,
    status:         form.status,
    socialLinks:    Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const OrgAvatar: React.FC<{ name: string; logo?: string; type?: OrgType; size?: 'sm' | 'md' }> = ({
  name, logo, type, size = 'md'
}) => {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  const bg = type ? TYPE_BG[type] : 'bg-nfsu-navy';
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-14 h-14';
  return (
    <div className={`${dim} rounded-2xl overflow-hidden flex-shrink-0 border-2 border-slate-100 shadow-sm`}>
      {logo ? (
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full ${bg} flex items-center justify-center`}>
          <span className={`text-white font-black ${size === 'sm' ? 'text-sm' : 'text-lg'} tracking-tight`}>{initials}</span>
        </div>
      )}
    </div>
  );
};

// ─── Read-only card (all roles) ───────────────────────────────────────────────

interface OrgCardProps {
  org: CampusOrg;
  isFaculty: boolean;
  onEdit: (org: CampusOrg) => void;
  onToggleStatus: (org: CampusOrg) => void;
  onDelete: (org: CampusOrg) => void;
}

const OrgCard: React.FC<OrgCardProps> = ({ org, isFaculty, onEdit, onToggleStatus, onDelete }) => {
  const typeKey = (org.type ?? 'service') as OrgType;
  const inactive = org.status === 'inactive';

  return (
    <div className={`bg-white rounded-[1.5rem] border-2 transition-all shadow-sm hover:shadow-lg group flex flex-col h-full ${
      inactive ? 'border-slate-100 opacity-70' : 'border-slate-100 hover:border-nfsu-navy/30'
    }`}>

      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <OrgAvatar name={org.name} logo={org.logo} type={org.type} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-black text-nfsu-navy text-sm uppercase tracking-tight leading-tight group-hover:text-nfsu-maroon transition-colors line-clamp-2">
              {org.name}
            </h3>
            {inactive && (
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg flex-shrink-0">
                Inactive
              </span>
            )}
          </div>
          {org.type && (
            <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${TYPE_COLORS[typeKey]}`}>
              {TYPE_LABELS[typeKey]}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 flex-1 space-y-3">
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-3 uppercase tracking-tight">
          {org.description ?? 'No description available.'}
        </p>

        {org.facultyAdvisor && (
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-nfsu-gold flex-shrink-0"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Advisor: {org.facultyAdvisor}
            </span>
          </div>
        )}

        {org.socialLinks && Object.values(org.socialLinks).some(Boolean) && (
          <div className="flex gap-1.5 flex-wrap">
            {org.socialLinks.instagram && (
              <a href={org.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-black text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-lg uppercase tracking-wider hover:bg-pink-100 transition-all">
                Instagram
              </a>
            )}
            {org.socialLinks.linkedin && (
              <a href={org.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg uppercase tracking-wider hover:bg-blue-100 transition-all">
                LinkedIn
              </a>
            )}
            {org.socialLinks.github && (
              <a href={org.socialLinks.github} target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-black text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-wider hover:bg-slate-100 transition-all">
                GitHub
              </a>
            )}
            {org.socialLinks.twitter && (
              <a href={org.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-black text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-lg uppercase tracking-wider hover:bg-sky-100 transition-all">
                Twitter
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer — action buttons */}
      <div className={`px-5 pb-5 pt-3 border-t-2 border-slate-50 mt-auto ${
        isFaculty ? 'flex flex-col gap-2' : 'flex gap-2'
      }`}>
        {/* Public actions */}
        {!isFaculty && (
          <>
            {org.website && (
              <a href={org.website} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-nfsu-navy text-white text-[9px] font-black uppercase tracking-widest rounded-xl text-center hover:bg-nfsu-maroon transition-all shadow-sm border-b-4 border-black/15">
                Website
              </a>
            )}
            {org.email && (
              <a href={`mailto:${org.email}`}
                className="flex-1 py-2.5 bg-white text-nfsu-navy text-[9px] font-black uppercase tracking-widest rounded-xl text-center border-2 border-nfsu-navy/20 hover:border-nfsu-gold hover:text-nfsu-gold transition-all">
                Contact
              </a>
            )}
          </>
        )}

        {/* Faculty controls */}
        {isFaculty && (
          <>
            <div className="flex gap-2">
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 bg-slate-50 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-xl text-center border-2 border-slate-200 hover:border-nfsu-navy transition-all">
                  Website
                </a>
              )}
              {org.email && (
                <a href={`mailto:${org.email}`}
                  className="flex-1 py-2 bg-slate-50 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-xl text-center border-2 border-slate-200 hover:border-nfsu-navy transition-all">
                  Contact
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(org)}
                className="flex-[2] py-2.5 bg-nfsu-navy text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-nfsu-maroon transition-all border-b-4 border-black/15 flex items-center justify-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => onToggleStatus(org)}
                className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl border-2 transition-all ${
                  inactive
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                {inactive ? 'Enable' : 'Disable'}
              </button>
              <button
                onClick={() => onDelete(org)}
                className="w-9 py-2.5 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Add / Edit Modal (faculty only) ─────────────────────────────────────────

interface OrgFormModalProps {
  initial: OrgFormState;
  isEdit: boolean;
  facultyName: string;
  onSave: (form: OrgFormState) => void;
  onClose: () => void;
}

const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
      {label}{required && <span className="text-nfsu-maroon ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wider mt-1">{hint}</p>}
  </div>
);

const inputCls = "w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-nfsu-navy focus:bg-white outline-none font-bold text-sm text-slate-700 placeholder-slate-300 transition-all";

const OrgFormModal: React.FC<OrgFormModalProps> = ({ initial, isEdit, facultyName, onSave, onClose }) => {
  const [form, setForm] = useState<OrgFormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof OrgFormState, string>>>({});

  const set = (key: keyof OrgFormState, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Enter a valid email address';
    }
    if (form.website.trim() && !/^https?:\/\/.+/.test(form.website.trim())) {
      e.website = 'URL must start with http:// or https://';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-sm flex items-start justify-center z-[200] p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl my-8 shadow-2xl border-4 border-nfsu-gold overflow-hidden animate-slideUp">

        {/* Modal header */}
        <div className="bg-nfsu-navy px-8 py-6 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-black text-nfsu-gold/60 uppercase tracking-[0.3em] mb-1">
              Faculty Authority
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
              {isEdit ? 'Edit Organisation' : 'Add New Organisation'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-[8px] font-black text-nfsu-gold/50 uppercase tracking-widest">Verified by</div>
              <div className="text-[9px] font-black text-nfsu-gold uppercase tracking-widest">{facultyName}</div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6 overflow-y-auto max-h-[70vh]">

          {/* Section: Basic Info */}
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pb-2 border-b-2 border-slate-100">
              Basic Information
            </div>
            <div className="space-y-4">
              <Field label="Organisation Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Coding Club"
                  className={inputCls}
                />
                {errors.name && <p className="text-[8px] text-nfsu-maroon font-black uppercase tracking-widest mt-1">{errors.name}</p>}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Type" required>
                  <select
                    value={form.type}
                    onChange={e => set('type', e.target.value)}
                    className={inputCls}
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={e => set('status', e.target.value as OrgStatus)}
                    className={inputCls}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>

              <Field label="Description" hint="Briefly describe the organisation's purpose and activities.">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Brief description of the organisation's purpose..."
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Faculty Advisor">
                <input
                  type="text"
                  value={form.facultyAdvisor}
                  onChange={e => set('facultyAdvisor', e.target.value)}
                  placeholder="e.g. Dr. A. Kumar"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Section: Contact */}
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pb-2 border-b-2 border-slate-100">
              Contact & Web
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="club@nfsu.ac.in"
                    className={inputCls}
                  />
                  {errors.email && <p className="text-[8px] text-nfsu-maroon font-black uppercase tracking-widest mt-1">{errors.email}</p>}
                </Field>
                <Field label="Website URL" hint="Must start with https://">
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                  />
                  {errors.website && <p className="text-[8px] text-nfsu-maroon font-black uppercase tracking-widest mt-1">{errors.website}</p>}
                </Field>
              </div>
              <Field label="Logo URL" hint="Direct link to image (JPG, PNG, SVG). Leave blank to use initials placeholder.">
                <input
                  type="url"
                  value={form.logo}
                  onChange={e => set('logo', e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Section: Social Links */}
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pb-2 border-b-2 border-slate-100">
              Social Links <span className="text-slate-300 font-bold normal-case tracking-normal text-[8px]">(all optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { key: 'linkedin'  as const, label: 'LinkedIn',  placeholder: 'https://linkedin.com/...' },
                { key: 'twitter'   as const, label: 'Twitter',   placeholder: 'https://twitter.com/...'  },
                { key: 'github'    as const, label: 'GitHub',    placeholder: 'https://github.com/...'   },
              ].map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <input
                    type="url"
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </Field>
              ))}
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-8 py-5 border-t-2 border-slate-100 flex gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-white border-2 border-slate-200 text-slate-500 font-black rounded-2xl uppercase text-[9px] tracking-widest hover:border-slate-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] py-4 bg-nfsu-navy text-white font-black rounded-2xl uppercase text-[9px] tracking-widest shadow-xl hover:bg-nfsu-maroon transition-all border-b-4 border-black/20"
          >
            {isEdit ? 'Save Changes' : 'Add Organisation'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirmation ──────────────────────────────────────────────────────

const DeleteConfirmModal: React.FC<{ org: CampusOrg; onConfirm: () => void; onClose: () => void }> = ({
  org, onConfirm, onClose,
}) => (
  <div className="fixed inset-0 bg-nfsu-navy/90 backdrop-blur-sm flex items-center justify-center z-[300] p-4">
    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border-4 border-nfsu-maroon overflow-hidden animate-slideUp">
      <div className="bg-nfsu-maroon px-8 py-6">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Confirm Deletion</h3>
      </div>
      <div className="px-8 py-7 space-y-4">
        <div className="flex items-center gap-4">
          <OrgAvatar name={org.name} logo={org.logo} type={org.type} size="sm" />
          <div>
            <p className="font-black text-nfsu-navy uppercase tracking-tight text-sm">{org.name}</p>
            {org.type && (
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${TYPE_COLORS[org.type]}`}>
                {TYPE_LABELS[org.type]}
              </span>
            )}
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed">
          This organisation will be permanently removed from the campus directory. This action cannot be undone.
        </p>
      </div>
      <div className="px-8 pb-7 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[9px] tracking-widest hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-[2] py-4 bg-nfsu-maroon text-white font-black rounded-2xl uppercase text-[9px] tracking-widest hover:bg-red-800 transition-all border-b-4 border-black/20 shadow-xl"
        >
          Delete Permanently
        </button>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface CampusDirectoryProps {
  user?: User;
  userRole?: string;
}

export const CampusDirectory: React.FC<CampusDirectoryProps> = ({ user, userRole }) => {
  const isFaculty = (user?.role ?? userRole) === 'faculty';

  const [orgs, setOrgs]               = useState<CampusOrg[]>([]);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState<OrgType | 'all'>('all');
  const [showModal, setShowModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<CampusOrg | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampusOrg | null>(null);
  const [toast, setToast]             = useState<string | null>(null);

  const loadOrgs = useCallback(() => {
    setOrgs(dbService.getTable<CampusOrg>('campus_orgs'));
  }, []);

  useEffect(() => {
    loadOrgs();
    const handler = () => loadOrgs();
    window.addEventListener('cw_db_update', handler);
    return () => window.removeEventListener('cw_db_update', handler);
  }, [loadOrgs]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orgs.filter(org => {
      const matchSearch = !q
        || org.name.toLowerCase().includes(q)
        || (org.description ?? '').toLowerCase().includes(q)
        || (org.facultyAdvisor ?? '').toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || org.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [orgs, search, typeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orgs.length };
    for (const org of orgs) if (org.type) c[org.type] = (c[org.type] ?? 0) + 1;
    return c;
  }, [orgs]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleAdd = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const handleEdit = (org: CampusOrg) => {
    setEditTarget(org);
    setShowModal(true);
  };

  const handleSaveForm = (form: OrgFormState) => {
    if (editTarget) {
      const updated = formToOrg(form, editTarget.id);
      const all = orgs.map(o => o.id === editTarget.id ? updated : o);
      dbService.saveTable('campus_orgs', all);
      showToast(`"${updated.name}" updated successfully.`);
    } else {
      const newOrg = formToOrg(form);
      dbService.saveTable('campus_orgs', [newOrg, ...orgs]);
      showToast(`"${newOrg.name}" added to the directory.`);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleToggleStatus = (org: CampusOrg) => {
    const updated = { ...org, status: org.status === 'inactive' ? 'active' : 'inactive' } as CampusOrg;
    const all = orgs.map(o => o.id === org.id ? updated : o);
    dbService.saveTable('campus_orgs', all);
    showToast(`"${org.name}" marked as ${updated.status}.`);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const all = orgs.filter(o => o.id !== deleteTarget.id);
    dbService.saveTable('campus_orgs', all);
    showToast(`"${deleteTarget.name}" removed from directory.`);
    setDeleteTarget(null);
  };

  const facultyDisplayName = user?.fullName ?? 'Faculty';

  return (
    <>
      <div className="w-full max-w-6xl space-y-6 md:space-y-10 animate-fadeIn">

        {/* ── Main card ── */}
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border-2 border-nfsu-gold/20 overflow-hidden">

          {/* Header */}
          <div className="p-6 md:p-10 lg:p-12 border-b-2 border-nfsu-paper bg-gradient-to-br from-nfsu-paper to-white">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
                  Centralized Institutional Registry
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-nfsu-navy tracking-tighter italic uppercase">
                  Campus <span className="text-nfsu-gold">Directory</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                  {isFaculty
                    ? 'Add, edit, and manage all campus organisations.'
                    : 'All clubs, committees, cells, libraries and services — in one place.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-nfsu-navy text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg">
                  {filtered.length} Entities
                </div>
                {isFaculty && (
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-5 py-2.5 bg-nfsu-gold text-nfsu-navy text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-nfsu-goldAccent transition-all border-b-4 border-black/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Organisation
                  </button>
                )}
              </div>
            </div>

            {/* Search */}
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
                placeholder="Search by name, description, or advisor..."
                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-nfsu-navy outline-none font-bold text-sm text-slate-700 placeholder-slate-300 transition-all"
              />
            </div>
          </div>

          {/* Type filter tabs */}
          <div className="px-6 md:px-10 lg:px-12 py-4 border-b-2 border-nfsu-paper flex gap-2 flex-wrap">
            {ALL_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                  typeFilter === t
                    ? 'bg-nfsu-navy text-white border-nfsu-navy shadow-lg'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-nfsu-navy/40 hover:text-nfsu-navy'
                }`}
              >
                {t === 'all' ? 'All' : TYPE_LABELS[t as OrgType]}
                {counts[t] !== undefined && (
                  <span className={`ml-1.5 ${typeFilter === t ? 'text-nfsu-gold' : 'text-slate-400'}`}>
                    {counts[t]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="p-6 md:p-10 lg:p-12">
            {filtered.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  No organisations match your search criteria.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setSearch(''); setTypeFilter('all'); }}
                    className="text-[9px] font-black text-nfsu-navy uppercase tracking-widest underline decoration-nfsu-gold"
                  >
                    Clear Filters
                  </button>
                  {isFaculty && (
                    <button
                      onClick={handleAdd}
                      className="text-[9px] font-black text-nfsu-gold uppercase tracking-widest underline"
                    >
                      Add Organisation
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(org => (
                  <OrgCard
                    key={org.id}
                    org={org}
                    isFaculty={isFaculty}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer banner */}
        <div className="bg-nfsu-navy rounded-[2rem] p-6 md:p-10 text-white border-b-8 border-nfsu-gold relative overflow-hidden">
          <div className="absolute inset-0 bg-institutional-pattern opacity-5"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-[9px] font-black text-nfsu-gold/60 uppercase tracking-[0.4em] mb-2">Directory Policy</div>
              <p className="text-[10px] font-bold text-nfsu-gold/70 uppercase tracking-wider leading-relaxed max-w-xl">
                All listed entities are permanent institutional bodies. Membership changes internally; the entity remains constant.
                {isFaculty
                  ? ' As faculty, you are the verification authority for this directory.'
                  : ' All content is managed and verified by faculty.'}
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-[9px] font-black text-nfsu-gold/50 uppercase tracking-widest">
                Faculty Verified<br />
                <span className="text-nfsu-gold text-lg font-black">Registry</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <OrgFormModal
          initial={editTarget ? orgToForm(editTarget) : { ...EMPTY_FORM, facultyAdvisor: facultyDisplayName }}
          isEdit={!!editTarget}
          facultyName={facultyDisplayName}
          onSave={handleSaveForm}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          org={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] animate-slideUp">
          <div className="bg-nfsu-navy text-white px-6 py-3.5 rounded-2xl shadow-2xl border-2 border-nfsu-gold flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-nfsu-gold flex-shrink-0"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
          </div>
        </div>
      )}
    </>
  );
};
