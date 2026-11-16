import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface CambioPassword {
  actual: string;
  nueva: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/perfil';

  cambiarPassword(datos: CambioPassword): Observable<void> {
    return this.http.put<void>(`${this.base}/password`, datos);
  }
}
