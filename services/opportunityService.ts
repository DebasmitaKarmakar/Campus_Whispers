
import { OpportunityPost, OpportunityStatus, OpportunityMode, User } from '../types';
import { dbService } from './dbService';

const TABLE_NAME = 'opportunities';

export const opportunityService = {
  getPosts: (): OpportunityPost[] => {
    let posts = dbService.getTable<OpportunityPost>(TABLE_NAME);
    
    // Auto-cleanup expired posts
    const now = new Date();
    let changed = false;
    posts = posts.map(post => {
      if (post.status === 'Active' && post.deadline) {
        if (new Date(post.deadline) < now) {
          changed = true;
          return { ...post, status: 'Expired' };
        }
      }
      return post;
    });

    if (changed) dbService.saveTable(TABLE_NAME, posts);
    return posts;
  },

  createPost: (user: User, data: { 
    title: string, 
    mode: OpportunityMode, 
    deadline: string, 
    description?: string, 
    documentUrl?: string, 
    externalUrl?: string 
  }) => {
    const newPost: OpportunityPost = {
      id: `OP-${Date.now()}`,
      ...data,
      status: user.role === 'admin' ? 'Active' : 'Pending',
      posterId: user.id,
      posterEmail: user.email,
      posterRole: user.role,
      createdAt: Date.now()
    };
    
    dbService.addRow(TABLE_NAME, newPost);
    return newPost;
  },

  verifyPost: (id: string, approve: boolean) => {
    dbService.updateRow<OpportunityPost>(TABLE_NAME, id, { 
      status: approve ? 'Active' : 'Rejected' 
    });
  },

  deletePost: (id: string) => dbService.deleteRow(TABLE_NAME, id)
};
