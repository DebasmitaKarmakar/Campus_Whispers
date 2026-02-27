import { MicroHelpPost, MicroHelpOffer, MicroHelpCategory } from '../types';
import { dbService } from './dbService';

const TABLE = 'microhelp_posts';
const OFFERS_TABLE = 'microhelp_offers';

// ─── Pre-loaded seed posts ─────────────────────────────────────────────────

const SEED_POSTS: MicroHelpPost[] = [
  {
    id: 'MH-SEED-001',
    posterEmail: 'student.seed@nfsu.ac.in',
    posterName: 'A Fellow Student',
    isAnonymous: true,
    title: 'Need old BCA/B.Tech textbooks — sem 1 to 4',
    description:
      'Hi, I am looking for old textbooks for Semester 1 to 4 (BCA/B.Tech programs). Subjects like Data Structures, OS, DBMS, Maths, C Programming etc. Would be very helpful if someone can lend or donate them. Happy to pay a small amount too.',
    category: 'Textbooks',
    contactInfo: 'Please connect via the offer button or ask the admin to relay.',
    paymentQrUrl: '',
    status: 'Approved',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    reviewedBy: 'admin@nfsu.ac.in',
    reviewNote: 'Pre-approved seed post.',
    reviewedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'MH-SEED-002',
    posterEmail: 'student.seed2@nfsu.ac.in',
    posterName: 'Anonymous Student',
    isAnonymous: true,
    title: 'Need ₹1200 for ATKT Form Fillup — urgent',
    description:
      'I have an ATKT in one subject and the form fillup deadline is approaching. I am unable to arrange ₹1200 right now due to family financial issues. Any kind help — loan, donation, or guidance on fee waiver — would mean a lot. I can repay once I receive my scholarship amount next month.',
    category: 'ATKT / Exam Fee',
    contactInfo: 'I will share contact privately via admin for privacy.',
    paymentQrUrl: '',
    status: 'Approved',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    reviewedBy: 'admin@nfsu.ac.in',
    reviewNote: 'Pre-approved seed post.',
    reviewedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
];

export const microHelpService = {
  init: () => {
    const existing = dbService.getTable<MicroHelpPost>(TABLE);
    if (existing.length === 0) {
      dbService.saveTable(TABLE, SEED_POSTS);
    }
  },

  // ── Student / Poster ──────────────────────────────────────────────────────

  createPost: (post: Omit<MicroHelpPost, 'id' | 'status' | 'createdAt'>): MicroHelpPost => {
    const newPost: MicroHelpPost = {
      ...post,
      id: `MH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      status: 'PendingReview',
      createdAt: Date.now(),
    };
    dbService.addRow<MicroHelpPost>(TABLE, newPost);

    // Notify all admin + faculty
    const reviewers = microHelpService._getReviewerEmails();
    dbService.broadcastNotification(
      reviewers,
      'grievance_reported', // reuse category for notifications
      '🆘 New MicroHelp Request',
      `"${newPost.title}" — needs your review before publishing.`,
      newPost.id
    );

    return newPost;
  },

  getPublicPosts: (): MicroHelpPost[] => {
    return dbService
      .getTable<MicroHelpPost>(TABLE)
      .filter(p => p.status === 'Approved')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getMyPosts: (email: string): MicroHelpPost[] => {
    return dbService
      .getTable<MicroHelpPost>(TABLE)
      .filter(p => p.posterEmail === email)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  markResolved: (postId: string, posterEmail: string) => {
    dbService.updateRow<MicroHelpPost>(TABLE, postId, { status: 'Resolved' });
  },

  // ── Admin / Faculty Moderation ────────────────────────────────────────────

  getPendingPosts: (): MicroHelpPost[] => {
    return dbService
      .getTable<MicroHelpPost>(TABLE)
      .filter(p => p.status === 'PendingReview')
      .sort((a, b) => a.createdAt - b.createdAt); // oldest first for review
  },

  getAllPostsForReview: (): MicroHelpPost[] => {
    return dbService
      .getTable<MicroHelpPost>(TABLE)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  approvePost: (postId: string, reviewerEmail: string, note?: string) => {
    const post = dbService.getTable<MicroHelpPost>(TABLE).find(p => p.id === postId);
    if (!post) return;
    dbService.updateRow<MicroHelpPost>(TABLE, postId, {
      status: 'Approved',
      reviewedBy: reviewerEmail,
      reviewNote: note || 'Approved.',
      reviewedAt: Date.now(),
    });
    // Notify poster
    dbService.pushNotification(
      post.posterEmail,
      'grievance_reported',
      '✅ MicroHelp Post Approved',
      `Your post "${post.title}" has been approved and is now visible to the campus community.`,
      postId
    );
  },

  rejectPost: (postId: string, reviewerEmail: string, reason: string) => {
    const post = dbService.getTable<MicroHelpPost>(TABLE).find(p => p.id === postId);
    if (!post) return;
    dbService.updateRow<MicroHelpPost>(TABLE, postId, {
      status: 'Rejected',
      reviewedBy: reviewerEmail,
      reviewNote: reason,
      reviewedAt: Date.now(),
    });
    dbService.pushNotification(
      post.posterEmail,
      'grievance_reported',
      '❌ MicroHelp Post Rejected',
      `Your post "${post.title}" was rejected. Reason: ${reason}`,
      postId
    );
  },

  deletePost: (postId: string, reviewerEmail: string, reason: string) => {
    const post = dbService.getTable<MicroHelpPost>(TABLE).find(p => p.id === postId);
    if (!post) return;
    dbService.updateRow<MicroHelpPost>(TABLE, postId, {
      status: 'Deleted',
      reviewedBy: reviewerEmail,
      reviewNote: reason,
      reviewedAt: Date.now(),
    });
    dbService.pushNotification(
      post.posterEmail,
      'grievance_reported',
      '🗑 MicroHelp Post Removed',
      `Your post "${post.title}" was removed by administration. Reason: ${reason}`,
      postId
    );
  },

  // ── Offers (I Can Help) ───────────────────────────────────────────────────

  submitOffer: (offer: Omit<MicroHelpOffer, 'id' | 'createdAt'>) => {
    const newOffer: MicroHelpOffer = {
      ...offer,
      id: `OFFER-${Date.now()}`,
      createdAt: Date.now(),
    };
    dbService.addRow<MicroHelpOffer>(OFFERS_TABLE, newOffer);

    // Notify post owner
    const post = dbService.getTable<MicroHelpPost>(TABLE).find(p => p.id === offer.postId);
    if (post) {
      dbService.pushNotification(
        post.posterEmail,
        'skill_help_request',
        '🤝 Someone wants to help!',
        `${offer.offererName} responded to your post "${post.title}": "${offer.message}"`,
        post.id
      );
    }

    return newOffer;
  },

  getOffersForPost: (postId: string): MicroHelpOffer[] => {
    return dbService
      .getTable<MicroHelpOffer>(OFFERS_TABLE)
      .filter(o => o.postId === postId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  // ── Internal ──────────────────────────────────────────────────────────────

  _getReviewerEmails: (): string[] => {
    // In real app would query users; for localStorage mock, use known admin emails
    const whitelist: { email: string; role: string }[] = JSON.parse(
      localStorage.getItem('cw_whitelist') || '[]'
    );
    return whitelist
      .filter(w => w.role === 'admin' || w.role === 'faculty')
      .map(w => w.email);
  },
};
