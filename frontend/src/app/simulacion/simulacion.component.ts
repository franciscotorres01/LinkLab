import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { SimulacionService, ParametrosSimulacion } from './simulacion.service';

@Component({
  selector: 'app-simulacion',
  imports: [FormsModule, JsonPipe],
  template: `
    <form (ngSubmit)="ejecutar()">
      <select name="algoritmo" [(ngModel)]="form.algoritmo">
        <option value="montecarlo">Montecarlo</option>
        <option value="arq">ARQ hasta acuse</option>
      </select>

      <label>Probabilidad de pérdida
        <input type="number" step="any" name="p" [(ngModel)]="form.probabilidadPerdida" />
      </label>
      <label>Tamaño de paquete (bytes)
        <input type="number" name="t" [(ngModel)]="form.tamanoPaqueteBytes" />
      </label>
      <label>RTT (ms)
        <input type="number" name="rtt" [(ngModel)]="form.rttMs" />
      </label>
      <label>Repeticiones
        <input type="number" name="rep" [(ngModel)]="form.repeticiones" />
      </label>
      <label>Tamaño de archivo (bytes)
        <input type="number" name="arch" [(ngModel)]="form.tamanoArchivoBytes" />
      </label>
      <label>Semilla
        <input type="number" name="sem" [(ngModel)]="form.semilla" />
      </label>

      <button type="submit" [disabled]="cargando()">
        {{ cargando() ? 'Simulando...' : 'Simular' }}
      </button>
    </form>

    @if (error()) {
      <p style="color: red">{{ error() }}</p>
    }
    @if (resultado()) {
      <pre>{{ resultado() | json }}</pre>
    }
  `,
})
export class SimulacionComponent {
  private servicio = inject(SimulacionService);

  form: ParametrosSimulacion = {
    algoritmo: 'montecarlo',
    probabilidadPerdida: 0.1,
    tamanoPaqueteBytes: 1400,
    rttMs: 45,
    repeticiones: 100,
    tamanoArchivoBytes: 1000000,
    semilla: 42,
  };

  resultado = signal<Record<string, unknown> | null>(null);
  error = signal<string | null>(null);
  cargando = signal(false);

  ejecutar() {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.simular(this.form).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.resultado.set(null);
        this.error.set(e.error?.error ?? `Error ${e.status}`);
        this.cargando.set(false);
      },
    });
  }
}
