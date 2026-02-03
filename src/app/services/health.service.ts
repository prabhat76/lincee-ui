import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private baseUrl = API_CONFIG.BASE_URL + '/health';

  constructor(private http: HttpClient) {}

  getHealth(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}
