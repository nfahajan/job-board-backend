export type UserData = {
  id: string;
  email: string;
  password: string;
  role: 'jobSeeker' | 'employer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  profile?: any;
  resumes?: any[];
  applications?: any[];
  companies?: any[];
};
