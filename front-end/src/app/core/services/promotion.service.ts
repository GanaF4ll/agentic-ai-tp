import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Promotion } from '../models/promotion.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/alumni/promotions`;

  getPromotions() {
    return this.http.get<Promotion[]>(`${this.API_URL}/`);
  }

  getPromotion(id: number) {
    return this.http.get<Promotion>(`${this.API_URL}/${id}/`);
  }

  createPromotion(data: Partial<Promotion>) {
    return this.http.post<Promotion>(`${this.API_URL}/`, data);
  }

  updatePromotion(id: number, data: Partial<Promotion>) {
    return this.http.patch<Promotion>(`${this.API_URL}/${id}/`, data);
  }

  deletePromotion(id: number) {
    return this.http.delete<void>(`${this.API_URL}/${id}/`);
  }
}
