import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Weather } from '@shared/models/weather.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  getWeather(city: string): Observable<Weather> {
    return this.http.get<Weather>(`${environment.apiUrl}/weather`, { params: new HttpParams().set('city', city) });
  }
}
