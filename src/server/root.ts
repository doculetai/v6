import { accountRouter } from './routers/account';
import { adminRouter } from './routers/admin';
import { adminAuditRouter } from './routers/admin-audit.procedures';
import { adminImpersonationRouter } from './routers/admin-impersonation.procedures';
import { agentRouter } from './routers/agent';
import { certificateRouter } from './routers/certificate';
import { dashboardRouter } from './routers/dashboard';
import { documentsRouter } from './routers/documents';
import { notificationsRouter } from './routers/notifications';
import { partnerRouter } from './routers/partner';
import { partnerWebhooksRouter } from './routers/partner-webhooks.procedures';
import { sessionsRouter } from './routers/sessions';
import { sponsorRouter } from './routers/sponsor';
import { studentRouter } from './routers/student';
import { universityRouter } from './routers/university';
import { universityManagementRouter } from './routers/university-management';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  student: studentRouter,
  sponsor: sponsorRouter,
  university: universityRouter,
  admin: adminRouter,
  adminAudit: adminAuditRouter,
  adminImpersonation: adminImpersonationRouter,
  agent: agentRouter,
  partner: partnerRouter,
  partnerWebhooks: partnerWebhooksRouter,
  dashboard: dashboardRouter,
  certificate: certificateRouter,
  account: accountRouter,
  notifications: notificationsRouter,
  sessions: sessionsRouter,
  universityManagement: universityManagementRouter,
  documents: documentsRouter,
});

export type AppRouter = typeof appRouter;
