import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Profile } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class AlumniService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/alumni/profiles';

  getProfiles(filters?: { search?: string; graduation_year?: number; degree?: string }) {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.graduation_year) params = params.set('graduation_year', filters.graduation_year.toString());
    if (filters?.degree) params = params.set('degree', filters.degree);

    return this.http.get<Profile[]>(`${this.API_URL}/`, { params });
  }

  validateProfile(id: number) {
    return this.http.post<Profile>(`${this.API_URL}/${id}/validate/`, {});
  }
}
