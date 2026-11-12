import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParametrosSimulacion {
  algoritmo: string;
  probabilidadPerdida: number;
  tamanoPaqueteBytes: number;
  rttMs: number;
  repeticiones: number;
  tamanoArchivoBytes: number;
  semilla: number;
}

@Injectable({ providedIn: 'root' })
export class SimulacionService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8081/api/simulacion';

  simular(params: ParametrosSimulacion): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(this.apiUrl, params);
  }
}
