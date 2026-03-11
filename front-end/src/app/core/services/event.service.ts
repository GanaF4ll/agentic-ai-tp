import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AlumniEvent } from '../models/business.model';
import { PaginatedResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface EventFilters {
  title?: string;
  date_from?: string;
  date_to?: string;
  is_online?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/events`;

  getEvents(filters: EventFilters = {}): Observable<PaginatedResponse<AlumniEvent>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PaginatedResponse<AlumniEvent>>(`${this.API_URL}/`, { params });
  }

  getEvent(id: number): Observable<AlumniEvent> {
    return this.http.get<AlumniEvent>(`${this.API_URL}/${id}/`);
  }

  createEvent(event: Partial<AlumniEvent>): Observable<AlumniEvent> {
    return this.http.post<AlumniEvent>(`${this.API_URL}/`, event);
  }

  updateEvent(id: number, event: Partial<AlumniEvent>): Observable<AlumniEvent> {
    return this.http.patch<AlumniEvent>(`${this.API_URL}/${id}/`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/`);
  }

  getMyEvents(): Observable<{ upcoming: AlumniEvent[], past: AlumniEvent[] }> {
    return this.http.get<{ upcoming: AlumniEvent[], past: AlumniEvent[] }>(`${this.API_URL}/my_events/`);
  }

  registerForEvent(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/register/`, {});
  }

  unregisterFromEvent(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/unregister/`, {});
  }
}
