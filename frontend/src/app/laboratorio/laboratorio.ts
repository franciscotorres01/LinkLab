import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Actividad {
  id: number;
  escenario: string;
  fecha: string;
  intentos: number;
}
interface Resumen {
  simulacionesTotales: number;
  escenariosProbados: number;
  escenariosDisponibles: number;
  perdidaPromedio: number;
  actividad: Actividad[];
}

@Component({
  selector: 'app-laboratorio',
  imports: [RouterLink, DatePipe],
  templateUrl: './laboratorio.html',
  styleUrl: './laboratorio.css',
})
export class Laboratorio {
  private http = inject(HttpClient);
  private api = 'http://localhost:8081/api/resumen';

  resumen = signal<Resumen | null>(null);
  cargando = signal(true);
  error = signal(false);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.http.get<Resumen>(this.api).subscribe({
      next: (r) => {
        this.resumen.set(r);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  // TEMPORAL: borrar cuando exista "Nueva simulación"
  cargarDemo() {
    this.http.post(this.api + '/demo', null).subscribe(() => this.cargar());
  }

  fmt(n: number) {
    return n.toLocaleString('es-CO');
  }
}
