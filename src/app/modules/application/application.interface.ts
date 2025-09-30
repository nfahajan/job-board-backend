import { Job, User } from "@prisma/client";

export type ApplicationData = {
  id: string;
  coverLetter?: string | null;
  jobId: string;
  job: Job;
  userId: string;
  user: User;
  resumeId: string;
  appliedAt: Date;
  status: string;
}; 