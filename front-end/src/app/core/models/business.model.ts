export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP';
  description: string;
  posted_by_id: number;
  posted_at: string;
}

export interface AlumniEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  is_online: boolean;
  organizer: string;
}
