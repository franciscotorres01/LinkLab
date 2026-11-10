import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-laboratorio',
  templateUrl: './laboratorio.html',
  styleUrl: './laboratorio.css',
})
export class Laboratorio {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  respuestaPing = signal('');

  ping() {
    this.http.get('http://localhost:8082/api/ping', { responseType: 'text' }).subscribe({
      next: (r) => this.respuestaPing.set('OK: ' + r),
      error: (e) => this.respuestaPing.set('Error ' + e.status),
    });
  }
}
