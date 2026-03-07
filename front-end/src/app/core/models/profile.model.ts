import { User } from './user.model';
import { Promotion } from './promotion.model';

export type ProfileStatus = 'DRAFT' | 'VERIFIED';

export interface Profile {
  id: number;
  bio: string;
  current_job_title: string;
  current_company: string;
  location: string;
  avatar_url: any;
  linkedin_url: string;
  graduation_year: number;
  degree: string;
  status: string;
  promotion: Promotion;
  created_at: string;
  updated_at: string;
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
}
