export type ProfileStatus = 'DRAFT' | 'VERIFIED';

export interface Profile {
  id: number;
  user_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url?: string;
  graduation_year?: number;
  degree?: string;
  status: ProfileStatus;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}
