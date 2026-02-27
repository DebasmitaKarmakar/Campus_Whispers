import React, { useState, useEffect, useRef } from 'react';
import { User, MicroHelpPost, MicroHelpOffer, MicroHelpCategory } from '../../types';
import { microHelpService } from '../../services/microHelpService';

// ─── Constants ─────────────────────────────────────────────────────────────

const CATEGORIES: MicroHelpCategory[] = [
  'Textbooks', 'Financial Aid', 'ATKT / Exam Fee', 'Stationery',
  'Medical', 'Transport', 'Food', 'Mental Health', 'Other',
];

const CATEGORY_ICONS: Record<MicroHelpCategory, string> = {
  'Textbooks':      '',
  'Financial Aid':  '',
  'ATKT / Exam Fee':'',
  'Stationery':     '',
  'Medical':        '',
  'Transport':      '',
  'Food':           '',
  'Mental Health':  '',
  'Other':          '',
};

const STATUS_COLORS: Record<string, string> = {
  PendingReview: 'bg-amber-100 text-amber-800 border-amber-300',
  Approved:      'bg-green-100 text-green-800 border-green-300',
  Rejected:      'bg-red-100 text-red-700 border-red-300',
  Deleted:       'bg-slate-100 text-slate-500 border-slate-300',
  Resolved:      'bg-blue-100 text-blue-700 border-blue-300',
};

const STATUS_LABELS: Record<string, string> = {
  PendingReview: ' Pending Review',
  Approved:      ' Live',
  Rejected:      ' Rejected',
  Deleted:       ' Removed',
  Resolved:      ' Resolved',
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

// ─── Props ────────────────────────────────────────────────────────────────

interface Props {
  user: User;
}

// ─── Post Card Component ──────────────────────────────────────────────────

const PostCard: React.FC<{
  post: MicroHelpPost;
  user: User;
  isAdmin: boolean;
  onAction: () => void;
}> = ({ post, user, isAdmin, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [offerMsg, setOfferMsg] = useState('');
  const [offers, setOffers] = useState<MicroHelpOffer[]>([]);
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [showQr, setShowQr] = useState(false);

  const displayName = post.isAnonymous && !isAdmin ? 'Anonymous Student' : post.posterName;
  const canReview = isAdmin && post.status === 'PendingReview';
  const canViewAllAdmin = isAdmin;

  useEffect(() => {
    if (expanded && isAdmin) {
      setOffers(microHelpService.getOffersForPost(post.id));
    }
  }, [expanded, isAdmin, post.id]);

  const handleOffer = () => {
    if (!offerMsg.trim()) return;
    microHelpService.submitOffer({
      postId: post.id,
      offererEmail: user.email,
      offererName: user.preferredName || user.fullName,
      message: offerMsg.trim(),
    });
    setOfferMsg('');
    setShowOffer(false);
    alert('Your offer to help has been sent to the poster!');
  };

  const handleApprove = () => {
    microHelpService.approvePost(post.id, user.email, reviewNote || 'Approved.');
    setShowReviewPanel(false);
    onAction();
  };

  const handleReject = () => {
    if (!reviewNote.trim()) { alert('Please provide a reason for rejection.'); return; }
    microHelpService.rejectPost(post.id, user.email, reviewNote);
    setShowReviewPanel(false);
    onAction();
  };

  const handleDelete = () => {
    if (!reviewNote.trim()) { alert('Please provide a reason for deletion.'); return; }
    if (!confirm('Delete this post? Poster will be notified.')) return;
    microHelpService.deletePost(post.id, user.email, reviewNote);
    setShowReviewPanel(false);
    onAction();
  };

  const handleResolve = () => {
    if (!confirm('Mark your post as resolved?')) return;
    microHelpService.markResolved(post.id, user.email);
    onAction();
  };

  return (
    <div className="bg-white rounded-[1.5rem] border-2 border-slate-100 hover:border-nfsu-gold/40 transition-all shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-lg">{CATEGORY_ICONS[post.category]}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-nfsu-navy bg-nfsu-paper px-2 py-0.5 rounded-lg border border-nfsu-navy/10">
                {post.category}
              </span>
              {isAdmin && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${STATUS_COLORS[post.status]}`}>
                  {STATUS_LABELS[post.status]}
                </span>
              )}
            </div>
            <h3 className="font-black text-nfsu-navy text-base leading-snug">{post.title}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] font-bold text-slate-400">{timeAgo(post.createdAt)}</div>
            {post.isAnonymous && isAdmin && (
              <div className="text-[10px] font-black text-nfsu-maroon uppercase tracking-widest mt-0.5">
                👤 {post.posterName}
              </div>
            )}
            {!isAdmin && post.isAnonymous && (
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">Anonymous</div>
            )}
            {!post.isAnonymous && (
              <div className="text-[10px] font-bold text-slate-500 mt-0.5">{post.posterName}</div>
            )}
          </div>
        </div>

        <p className={`text-sm text-slate-600 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {post.description}
        </p>

        {/* Action bar */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[10px] font-black uppercase tracking-widest text-nfsu-navy bg-nfsu-paper px-3 py-1.5 rounded-xl hover:bg-nfsu-gold/20 transition-all"
          >
            {expanded ? 'Collapse ↑' : 'Read More ↓'}
          </button>

          {post.paymentQrUrl && (
            <button
              onClick={() => setShowQr(q => !q)}
              className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-all"
            >
               Payment QR
            </button>
          )}

          {post.documentUrl && (
            <a
              href={post.documentUrl}
              download={post.documentName || 'document'}
              className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all"
            >
               View Document
            </a>
          )}

          {/* Offer help — anyone except the poster */}
          {post.status === 'Approved' && post.posterEmail !== user.email && (
            <button
              onClick={() => setShowOffer(s => !s)}
              className="text-[10px] font-black uppercase tracking-widest text-white bg-nfsu-navy px-3 py-1.5 rounded-xl hover:bg-nfsu-maroon transition-all"
            >
               I Can Help
            </button>
          )}

          {/* Mark resolved — only poster */}
          {post.status === 'Approved' && post.posterEmail === user.email && (
            <button
              onClick={handleResolve}
              className="text-[10px] font-black uppercase tracking-widest text-white bg-green-600 px-3 py-1.5 rounded-xl hover:bg-green-700 transition-all"
            >
               Mark Resolved
            </button>
          )}

          {/* Admin review */}
          {canReview && (
            <button
              onClick={() => setShowReviewPanel(r => !r)}
              className="text-[10px] font-black uppercase tracking-widest text-white bg-nfsu-maroon px-3 py-1.5 rounded-xl hover:bg-red-700 transition-all"
            >
             Review
            </button>
          )}

          {/* Admin can also delete approved/live posts */}
          {canViewAllAdmin && post.status === 'Approved' && (
            <button
              onClick={() => setShowReviewPanel(r => !r)}
              className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-100 transition-all"
            >
               Remove
            </button>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4 space-y-3">
          {post.contactInfo && (
            <div className="bg-nfsu-paper rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contact / How to Help</div>
              <p className="text-sm text-slate-700 font-medium">{post.contactInfo}</p>
            </div>
          )}
          {isAdmin && post.reviewNote && (
            <div className={`rounded-xl p-3 border ${STATUS_COLORS[post.status]}`}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-1">Review Note</div>
              <p className="text-xs font-medium">{post.reviewNote}</p>
              {post.reviewedBy && (
                <p className="text-[10px] text-slate-400 mt-1">by {post.reviewedBy} · {post.reviewedAt ? timeAgo(post.reviewedAt) : ''}</p>
              )}
            </div>
          )}
          {isAdmin && offers.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Help Offers ({offers.length})</div>
              <div className="space-y-2">
                {offers.map(o => (
                  <div key={o.id} className="bg-white rounded-xl p-2 border border-slate-100">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 mb-0.5">
                      <span>{o.offererName} ({o.offererEmail})</span>
                      <span>{timeAgo(o.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-700">{o.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Panel */}
      {showQr && post.paymentQrUrl && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Payment QR Code</div>
          <img src={post.paymentQrUrl} alt="Payment QR" className="max-w-[200px] rounded-xl border-2 border-nfsu-gold/40" />
          <p className="text-[10px] text-slate-400 mt-2">Scan with any UPI app to send money.</p>
        </div>
      )}

      {/* Offer form */}
      {showOffer && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Your Message to the Student</div>
          <textarea
            value={offerMsg}
            onChange={e => setOfferMsg(e.target.value)}
            placeholder="How can you help? (e.g. I have the textbook, contact me at...)"
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium resize-none focus:outline-none focus:border-nfsu-navy"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleOffer}
              className="px-4 py-2 bg-nfsu-navy text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-nfsu-maroon transition-all"
            >
              Send Offer
            </button>
            <button
              onClick={() => setShowOffer(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Review / Moderation panel */}
      {showReviewPanel && (
        <div className="px-5 pb-5 border-t border-nfsu-maroon/20 bg-red-50/30 pt-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-nfsu-maroon mb-3 flex items-center gap-2">
            <span>🛡</span> Moderation Panel
            {isAdmin && !post.isAnonymous && (
              <span className="text-slate-400 font-bold normal-case text-[10px]">
                | Poster: {post.posterName} ({post.posterEmail})
              </span>
            )}
            {isAdmin && post.isAnonymous && (
              <span className="text-nfsu-maroon font-bold normal-case text-[10px]">
                | Real Identity: {post.posterName} ({post.posterEmail})
              </span>
            )}
          </div>

          {post.documentUrl && (
            <a
              href={post.documentUrl}
              download={post.documentName || 'document'}
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all mb-3"
            >
               Review Supporting Document
            </a>
          )}

          <textarea
            value={reviewNote}
            onChange={e => setReviewNote(e.target.value)}
            placeholder={post.status === 'Approved' ? 'Reason for removal...' : 'Note for approval / rejection reason...'}
            className="w-full p-3 rounded-xl border-2 border-slate-200 text-sm font-medium resize-none focus:outline-none focus:border-nfsu-navy mb-3"
            rows={2}
          />

          <div className="flex flex-wrap gap-2">
            {post.status === 'PendingReview' && (
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-green-700 transition-all"
              >
                 Approve
              </button>
            )}
            {post.status === 'PendingReview' && (
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
              >
                 Reject
              </button>
            )}
            {(post.status === 'Approved' || post.status === 'PendingReview') && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-nfsu-maroon text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-800 transition-all"
              >
                 Delete
              </button>
            )}
            <button
              onClick={() => setShowReviewPanel(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── New Post Modal ───────────────────────────────────────────────────────

const NewPostModal: React.FC<{
  user: User;
  onClose: () => void;
  onCreated: () => void;
}> = ({ user, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MicroHelpCategory>('Other');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const docRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Title and description are required.');
      return;
    }
    setSubmitting(true);

    let documentUrl: string | undefined;
    let documentName: string | undefined;
    let paymentQrUrl: string | undefined;

    if (docFile) {
      documentUrl = await toBase64(docFile);
      documentName = docFile.name;
    }
    if (qrFile) {
      paymentQrUrl = await toBase64(qrFile);
    }

    microHelpService.createPost({
      posterEmail: user.email,
      posterName: user.preferredName || user.fullName,
      isAnonymous,
      title: title.trim(),
      description: description.trim(),
      category,
      contactInfo: contactInfo.trim() || undefined,
      documentUrl,
      documentName,
      paymentQrUrl,
    });

    setSubmitting(false);
    onCreated();
    onClose();
    alert('Your request has been submitted and is pending admin/faculty review. You will be notified once it goes live.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl rounded-t-[2rem] md:rounded-[2rem] max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-nfsu-navy uppercase italic tracking-tight">Post a Help Request</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Will be reviewed by faculty/admin before publishing
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 font-bold text-lg transition-all"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Category *
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${
                    category === c
                      ? 'bg-nfsu-navy text-white border-nfsu-navy'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-nfsu-navy'
                  }`}
                >
                  {CATEGORY_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Title *
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief, clear title of your request..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-nfsu-navy"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain your situation clearly. The more detail you provide, the better people can help you..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium resize-none focus:outline-none focus:border-nfsu-navy"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Contact / How to Reach You (optional)
            </label>
            <input
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              placeholder="Phone, WhatsApp, email, or 'Contact via admin'..."
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-nfsu-navy"
            />
          </div>

          {/* Supporting Document */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Supporting Document (optional — helps admin verify)
            </label>
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-nfsu-navy/40 transition-all"
              onClick={() => docRef.current?.click()}
            >
              {docFile ? (
                <p className="text-sm font-bold text-nfsu-navy"> {docFile.name}</p>
              ) : (
                <p className="text-sm text-slate-400 font-medium">Click to upload (PDF, image, etc.)</p>
              )}
            </div>
            <input ref={docRef} type="file" className="hidden" onChange={e => setDocFile(e.target.files?.[0] || null)} />
          </div>

          {/* Payment QR */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Payment QR Code (optional — for financial help)
            </label>
            <div
              className="border-2 border-dashed border-green-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 transition-all"
              onClick={() => qrRef.current?.click()}
            >
              {qrFile ? (
                <p className="text-sm font-bold text-green-700"> {qrFile.name}</p>
              ) : (
                <p className="text-sm text-slate-400 font-medium">Upload UPI / Google Pay QR image</p>
              )}
            </div>
            <input ref={qrRef} type="file" accept="image/*" className="hidden" onChange={e => setQrFile(e.target.files?.[0] || null)} />
          </div>

          {/* Anonymous */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
                className="mt-0.5 accent-nfsu-navy w-4 h-4"
              />
              <div>
                <div className="text-sm font-black text-amber-800">Post Anonymously</div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Your post will show as <strong>"Anonymous Student"</strong> to the public. However, your real name and email
                  will be visible to <strong>admin and faculty only</strong> for accountability.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-3.5 bg-nfsu-navy text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-nfsu-maroon transition-all disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : ' Submit Help Request'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────

export const MicroHelpDashboard: React.FC<Props> = ({ user }) => {
  const isAdmin = user.role === 'admin' || user.role === 'faculty';
  const isCanteen = user.role === 'canteen';

  const [tab, setTab] = useState<'public' | 'mine' | 'review'>(() => {
    if (isAdmin) return 'review';
    return 'public';
  });
  const [posts, setPosts] = useState<MicroHelpPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [filterCategory, setFilterCategory] = useState<MicroHelpCategory | 'All'>('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // init seed data
  useEffect(() => { microHelpService.init(); }, []);

  useEffect(() => {
    if (tab === 'public') {
      const p = microHelpService.getPublicPosts();
      setPosts(filterCategory === 'All' ? p : p.filter(x => x.category === filterCategory));
    } else if (tab === 'mine') {
      setPosts(microHelpService.getMyPosts(user.email));
    } else if (tab === 'review') {
      setPosts(microHelpService.getAllPostsForReview());
    }
  }, [tab, user.email, filterCategory, refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const pendingCount = isAdmin
    ? microHelpService.getPendingPosts().length
    : 0;

  const tabs: { id: typeof tab; label: string; roles: string[] }[] = [
    { id: 'public', label: ' Public Board', roles: ['student', 'admin', 'faculty', 'canteen'] },
    { id: 'mine', label: ' My Requests', roles: ['student'] },
    { id: 'review', label: `🛡 Review${pendingCount > 0 ? ` (${pendingCount})` : ''}`, roles: ['admin', 'faculty'] },
  ];

  const visibleTabs = tabs.filter(t => t.roles.includes(user.role));

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border-2 border-nfsu-gold/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-nfsu-navy uppercase italic tracking-tight">
              MicroHelp Across Campus
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed max-w-xl">
              A safe space for students to ask for help — textbooks, financial aid, exam fees, and more.
              Posts are reviewed before publishing to ensure authenticity.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-lg">
                Verified Before Publishing
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg">
                 Anonymous Option Available
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-lg">
                 UPI/QR Payments Supported
              </span>
            </div>
          </div>
          {(user.role === 'student') && (
            <button
              onClick={() => setShowNewPost(true)}
              className="px-6 py-4 bg-nfsu-navy text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-nfsu-maroon transition-all shadow-lg flex-shrink-0"
            >
               Ask for Help
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {visibleTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
              tab === t.id
                ? 'bg-nfsu-navy text-white border-nfsu-navy shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-nfsu-navy/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category filter — public tab only */}
      {tab === 'public' && (
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                filterCategory === c
                  ? 'bg-nfsu-gold text-nfsu-navy border-nfsu-gold'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-nfsu-gold/60'
              }`}
            >
              {c === 'All' ? ' All' : `${CATEGORY_ICONS[c]} ${c}`}
            </button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">
            {tab === 'review' ? '' : tab === 'mine' ? '' : ''}
          </div>
          <h3 className="font-black text-nfsu-navy text-lg uppercase italic">
            {tab === 'review' ? 'No posts pending review' : tab === 'mine' ? 'You have no requests yet' : 'No help requests right now'}
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            {tab === 'public' ? 'Be the first to ask for help — the community is here for you.' : ''}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(post => (
            <PostCard
              key={`${post.id}-${post.status}`}
              post={post}
              user={user}
              isAdmin={isAdmin}
              onAction={refresh}
            />
          ))}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <NewPostModal
          user={user}
          onClose={() => setShowNewPost(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
};
