import { User } from './user.model';
import { Promotion } from './promotion.model';

export type ProfileStatus = 'DRAFT' | 'VERIFIED';

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface Profile {
  id: number;
  bio: string;
  current_job_title: string;
  current_company: string;
  location: string;
  avatar_url: any;
  linkedin_url: string | null;
  graduation_year: number;
  degree: string;
  status: string;
  promotion: Promotion;
  is_visible: boolean;
  experiences: Experience[];
  created_at: string;
  updated_at: string;
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'email'>;
}
