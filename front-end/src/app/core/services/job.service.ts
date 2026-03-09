import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JobOffer } from '../models/business.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/jobs/`;

  getJobs() {
    return this.http.get<JobOffer[]>(this.API_URL);
  }

  getJobById(id: number) {
    return this.http.get<JobOffer>(`${this.API_URL}${id}/`);
  }

  createJob(job: Partial<JobOffer>) {
    return this.http.post<JobOffer>(this.API_URL, job);
  }

  updateJob(id: number, job: Partial<JobOffer>) {
    return this.http.patch<JobOffer>(`${this.API_URL}${id}/`, job);
  }

  deleteJob(id: number) {
    return this.http.delete(`${this.API_URL}${id}/`);
  }
}
