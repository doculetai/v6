import { adminRouter } from './routers/admin';
import { agentRouter } from './routers/agent';
import { dashboardRouter } from './routers/dashboard';
import { partnerRouter } from './routers/partner';
import { sponsorRouter } from './routers/sponsor';
import { studentRouter } from './routers/student';
import { universityRouter } from './routers/university';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  student: studentRouter,
  sponsor: sponsorRouter,
  university: universityRouter,
  admin: adminRouter,
  agent: agentRouter,
  partner: partnerRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
