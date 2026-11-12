import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pendiente',
  template: `
    <h1>{{ titulo }}</h1>
    <p>Esta pantalla estará disponible próximamente.</p>
  `,
  styles: `
    h1 { font-size: 40px; color: #14172b; margin: 0 0 8px; }
    p { color: #6b7190; font-size: 17px; }
  `,
})
export class Pendiente {
  titulo = inject(ActivatedRoute).snapshot.data['titulo'];
}
