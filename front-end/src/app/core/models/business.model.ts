export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'CDI' | 'CDD' | 'FREELANCE' | 'INTERNSHIP';
  description: string;
  posted_by_id: number;
  posted_at: string;
  applications_count: number;
  start_date?: string;
  end_date?: string;
  remote_status: 'HYBRID' | 'FULL REMOTE' | 'ON SITE';
  periodicity: 'FULL TIME' | 'PART TIME';
  source_url?: string;
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
