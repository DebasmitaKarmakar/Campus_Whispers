
import { QuestionPaper, HelpRequest, ExamType, HelpCategory, SessionType, HelpRequestStatus, SkillOffer, ResourceCategory } from '../types';
import { dbService } from './dbService';

const T_PAPERS = 'resources_papers';
const T_HELP = 'resources_help';
const T_SKILL_OFFERS = 'resources_skill_offers';

export const resourceService = {
  getPapers: (): QuestionPaper[] => dbService.getTable<QuestionPaper>(T_PAPERS),

  uploadResource: (
    user: { id: string, email: string, fullName: string }, 
    data: { 
      year: string, 
      semester: string, 
      examType?: ExamType, 
      subject: string, 
      branch: string, 
      pdfUrl: string,
      resourceType: ResourceCategory
    }
  ): { success: boolean, message: string } => {
    const papers = resourceService.getPapers();
    
    // Check duplication for papers
    if (data.resourceType === 'Paper') {
      const isDuplicate = papers.some(p => 
        !p.isArchived &&
        p.resourceType === 'Paper' &&
        p.year === data.year && 
        p.semester === data.semester && 
        p.examType === data.examType && 
        p.branch === data.branch &&
        p.subject.toLowerCase() === data.subject.toLowerCase()
      );

      if (isDuplicate) {
        return { success: false, message: 'Registry Error: A verified paper already exists for this subject/session.' };
      }
    }

    const newPaper: QuestionPaper = {
      id: `QP-${Date.now()}`,
      ...data,
      fileHash: data.pdfUrl.substring(0, 32),
      uploaderId: user.id,
      uploaderEmail: user.email,
      uploaderName: user.fullName,
      createdAt: Date.now(),
      isArchived: false
    };

    dbService.addRow(T_PAPERS, newPaper);
    return { success: true, message: `${data.resourceType} successfully added to institutional repository.` };
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

  getSkillOffers: (): SkillOffer[] => dbService.getTable<SkillOffer>(T_SKILL_OFFERS),

  createSkillOffer: (userEmail: string, data: { subject: string, category: HelpCategory, description: string, proficiencyPdfUrl: string }) => {
    const newOffer: SkillOffer = {
      id: `EXPERT-${Date.now()}`,
      expertEmail: userEmail,
      ...data,
      createdAt: Date.now()
    };
    dbService.addRow(T_SKILL_OFFERS, newOffer);
    return newOffer;
  },

  offerHelp: (requestId: string, userEmail: string, sessionType: SessionType) => {
    const requests = dbService.getTable<HelpRequest>(T_HELP);
    const req = requests.find(r => r.id === requestId);
    dbService.updateRow<HelpRequest>(T_HELP, requestId, { 
      status: 'Matched', 
      helperEmail: userEmail, 
      helperSessionType: sessionType 
    });
    // Notify the person who requested help
    if (req) {
      dbService.pushNotification(
        req.requesterEmail,
        'skill_help_request',
        'Someone offered to help you',
        `A peer has offered to assist you with "${req.topic}". Check the Skill Share section for details.`,
        requestId
      );
    }
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
