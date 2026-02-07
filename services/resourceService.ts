
import { QuestionPaper, HelpRequest, ExamType, HelpCategory, SessionType, HelpRequestStatus } from '../types';
import { dbService } from './dbService';

const T_PAPERS = 'resources_papers';
const T_HELP = 'resources_help';

export const resourceService = {
  getPapers: (): QuestionPaper[] => dbService.getTable<QuestionPaper>(T_PAPERS),

  uploadPaper: (user: { id: string, email: string }, data: { year: string, semester: string, examType: ExamType, branch: string, pdfUrl: string }): { success: boolean, message: string } => {
    const papers = resourceService.getPapers();
    
    const isDuplicate = papers.some(p => 
      !p.isArchived &&
      p.year === data.year && 
      p.semester === data.semester && 
      p.examType === data.examType && 
      p.branch === data.branch
    );

    if (isDuplicate) {
      return { success: false, message: 'Institutional Registry Error: A verified PDF already exists for this session.' };
    }

    const newPaper: QuestionPaper = {
      id: `QP-${Date.now()}`,
      ...data,
      fileHash: data.pdfUrl.substring(0, 32),
      uploaderId: user.id,
      uploaderEmail: user.email,
      createdAt: Date.now(),
      isArchived: false
    };

    dbService.addRow(T_PAPERS, newPaper);
    return { success: true, message: 'Document added to institutional repository.' };
  },

  archivePaper: (id: string) => dbService.updateRow<QuestionPaper>(T_PAPERS, id, { isArchived: true }),

  getHelpRequests: (): HelpRequest[] => dbService.getTable<HelpRequest>(T_HELP),

  createHelpRequest: (userEmail: string, data: { topic: string, category: HelpCategory, sessionType: SessionType, description?: string, preferredTime?: string, preferredPlace?: string }) => {
    const newRequest: HelpRequest = {
      id: `HELP-${Date.now()}`,
      requesterEmail: userEmail,
      ...data,
      status: 'Open',
      createdAt: Date.now()
    };
    dbService.addRow(T_HELP, newRequest);
    return newRequest;
  },

  offerHelp: (requestId: string, userEmail: string, sessionType: SessionType) => {
    dbService.updateRow<HelpRequest>(T_HELP, requestId, { 
      status: 'Matched', 
      helperEmail: userEmail, 
      helperSessionType: sessionType 
    });
  },

  withdrawHelp: (requestId: string) => {
    dbService.updateRow<HelpRequest>(T_HELP, requestId, { 
      status: 'Open', 
      helperEmail: undefined, 
      helperSessionType: undefined 
    });
  },

  updateHelpStatus: (requestId: string, status: HelpRequestStatus) => {
    dbService.updateRow<HelpRequest>(T_HELP, requestId, { status });
  }
};
