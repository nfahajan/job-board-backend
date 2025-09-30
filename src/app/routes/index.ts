import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { ProfileRoutes } from '../modules/profile/profile.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { JobRoutes } from '../modules/job/job.route';
import { CompanyRoutes } from '../modules/company/company.route';
import { ApplicationRoutes } from '../modules/application/application.route';
import { ResumeRoutes } from '../modules/resume/resume.routes';
import { StatsRoutes } from '../modules/stats/stats.route';
const router = express.Router();
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/job',
    route: JobRoutes,
  },
  {
    path: '/company',
    route: CompanyRoutes,
  },
  {
    path: '/application',
    route: ApplicationRoutes,
  },
  {
    path: '/resume',
    route: ResumeRoutes,
  },
  {
    path: '/stats',
    route: StatsRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
