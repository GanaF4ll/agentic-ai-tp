import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { JobOffer } from '../models/business.model';
import { PaginatedResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';

export interface JobFilters {
  type?: string;
  remote_status?: string;
  periodicity?: string;
  start_date?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/jobs/offers/`;

  getJobs(filters: JobFilters = {}) {
    let params = new HttpParams();
    
    if (filters.type) params = params.set('type', filters.type);
    if (filters.remote_status) params = params.set('remote_status', filters.remote_status);
    if (filters.periodicity) params = params.set('periodicity', filters.periodicity);
    if (filters.start_date) params = params.set('start_date', filters.start_date);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaginatedResponse<JobOffer>>(this.API_URL, { params });
  }

  getJobById(id: number) {
    return this.http.get<JobOffer>(`${this.API_URL}${id}/`);
  }

  getMyApplications() {
    return this.http.get<JobOffer[]>(`${this.API_URL}my_applications/`);
  }

  createJob(job: Partial<JobOffer>) {
    return this.http.post<JobOffer>(this.API_URL, job);
  }

  updateJob(id: number, job: Partial<JobOffer>) {
    return this.http.patch<JobOffer>(`${this.API_URL}${id}/`, job);
  }

  applyToJob(jobId: number) {
    return this.http.post<{ detail: string }>(`${this.API_URL}${jobId}/apply/`, {});
  }

  deleteJob(id: number) {
    return this.http.delete(`${this.API_URL}${id}/`);
  }
}
