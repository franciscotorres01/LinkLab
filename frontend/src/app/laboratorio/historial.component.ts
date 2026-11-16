import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Fila {
  id: number;
  escenario: string | null;
  algoritmo: string;
  perdida: number;
  intentos: number;
  tasaBps: number;
  semilla: number | null;
  fecha: string;
}

@Component({
  selector: 'app-historial',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="head">
        <p class="eyebrow">REGISTRO DE ACTIVIDAD</p>
        <h1>Historial de simulaciones</h1>
        <p class="sub">Consulta todas las pruebas ejecutadas y recupera sus parámetros.</p>
      </header>

      @if (error()) {
        <div class="aviso">
          No se pudo cargar el historial. ¿Está el backend encendido?
          <button type="button" (click)="cargar()">Reintentar</button>
        </div>
      } @else {
        <div class="resumen">
          <div>
            <b>{{ filas().length }} {{ filas().length === 1 ? 'simulación guardada' : 'simulaciones guardadas' }}</b>
            <small>Cada ejecución se guarda automáticamente en tu cuenta</small>
          </div>
          <button class="btn-outline" type="button" (click)="exportar()" [disabled]="!filas().length">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>
            Exportar historial
          </button>
        </div>

        <div class="tabla">
          <div class="fila cab">
            <span>ESCENARIO</span>
            <span>ALGORITMO</span>
            <span>PÉRDIDA</span>
            <span>INTENTOS</span>
            <span>TASA EFECTIVA</span>
            <span>FECHA</span>
            <span></span>
          </div>

          @for (f of filas(); track f.id) {
            <div class="fila">
              <div class="esc">
                <span class="ico">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/>
                       <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
                </span>
                <div>
                  <b>{{ f.escenario || 'Personalizado' }}</b>
                  <small>Semilla {{ f.semilla }}</small>
                </div>
              </div>
              <span><i class="tag">{{ nombreAlgoritmo(f.algoritmo) }}</i></span>
              <b>{{ pct(f.perdida) }}%</b>
              <b>{{ f.intentos.toLocaleString('es-CO') }}</b>
              <b>{{ kbps(f.tasaBps) }} Kbps</b>
              <span class="fecha">{{ fecha(f.fecha) }}</span>
              <div class="acc">
                <a class="icon-btn" title="Comparar" routerLink="/laboratorio/comparar" [queryParams]="{ sim: f.id }">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-4 4M3 7h18M7 21l-4-4 4-4M21 17H3"/></svg>
                </a>
                <button class="icon-btn" type="button" title="Borrar" (click)="borrar(f.id)">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>
                </button>
              </div>
            </div>
          } @empty {
            <div class="vacio">
              <p>Aún no hay simulaciones guardadas.</p>
              <a class="btn-outline" routerLink="/laboratorio/simulaciones">Ejecutar una simulación</a>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: 32px 48px 56px; color: #12122b; }
    .head { margin-bottom: 28px; }
    .eyebrow { display: inline-block; margin: 0 0 10px; padding-top: 6px; border-top: 2px solid #5b4bdb;
      font-size: 11px; letter-spacing: .18em; font-weight: 600; color: #5b4bdb; }
    h1 { margin: 0 0 8px; font-size: 44px; line-height: 1.1; letter-spacing: -0.02em; }
    .sub { margin: 0; color: #5d6075; font-size: 16px; }

    .aviso { display: flex; align-items: center; gap: 16px; background: #fff4e6; border: 1px solid #f3dcb8;
      color: #8a5a14; border-radius: 14px; padding: 16px 20px; }
    .aviso button { border: 1px solid #5b4bdb; color: #5b4bdb; background: #fff; border-radius: 10px;
      padding: 8px 16px; font-weight: 600; cursor: pointer; }

    .resumen { display: flex; justify-content: space-between; align-items: center; gap: 16px;
      background: #fff; border: 1px solid #e6e8f0; border-radius: 18px; padding: 22px 26px; margin-bottom: 20px; }
    .resumen b { display: block; font-size: 16px; }
    .resumen small { display: block; margin-top: 6px; color: #8c90a4; font-size: 11px; }

    .btn-outline { display: inline-flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e3e5ee;
      border-radius: 12px; padding: 13px 20px; font-weight: 600; font-size: 14px; cursor: pointer;
      color: #12122b; text-decoration: none; }
    .btn-outline:hover { border-color: #8b7cf0; color: #5b4bdb; }
    .btn-outline:disabled { opacity: .5; cursor: default; }

    .tabla { background: #fff; border: 1px solid #e6e8f0; border-radius: 20px; overflow-x: auto;
      box-shadow: 0 4px 24px rgba(18,18,43,.04); }
    .fila { display: grid; align-items: center; gap: 12px; min-width: 900px; padding: 18px 24px;
      grid-template-columns: 2.2fr 1.6fr .8fr 1fr 1.2fr 1.6fr 100px;
      border-top: 1px solid #eceef5; font-size: 12px; }
    .fila:hover:not(.cab) { background: #fafaff; }
    .fila.cab { border-top: 0; background: #f6f7fb; color: #9a9db0; font-size: 10px;
      font-weight: 700; letter-spacing: .08em; padding-top: 16px; padding-bottom: 16px; }
    .fila b { font-size: 12px; font-weight: 700; }

    .esc { display: flex; align-items: center; gap: 14px; }
    .esc b { display: block; font-size: 12px; }
    .esc small { display: block; margin-top: 3px; color: #9a9db0; font-size: 10px; }
    .ico { width: 34px; height: 34px; border-radius: 10px; background: #f1eefe; color: #5b4bdb;
      display: inline-flex; align-items: center; justify-content: center; flex: none; }

    .tag { font-style: normal; font-size: 10px; font-weight: 700; color: #1a9aa0; background: #e6f7f6;
      padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
    .fecha { color: #8c90a4; font-size: 10px; }

    .acc { display: flex; justify-content: flex-end; gap: 8px; }
    .icon-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e3e5ee; background: #fff;
      color: #5d6075; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
    .icon-btn:hover { border-color: #8b7cf0; color: #5b4bdb; }

    .vacio { padding: 56px 24px; text-align: center; color: #5d6075; }
    .vacio p { margin: 0 0 16px; }

    @media (max-width: 1100px) { .page { padding: 24px 16px; } }
  `],
})
export class HistorialComponent {
  private http = inject(HttpClient);
  private api = 'http://localhost:8081/api/historial';

  filas = signal<Fila[]>([]);
  error = signal(false);

  constructor() {
    this.cargar();
  }

  cargar() {
    this.error.set(false);
    this.http.get<Fila[]>(this.api).subscribe({
      next: (r) => this.filas.set(r),
      error: () => this.error.set(true),
    });
  }

  borrar(id: number) {
    if (!confirm('¿Borrar esta simulación del historial?')) return;
    this.http.delete(`${this.api}/${id}`).subscribe(() => this.cargar());
  }

  nombreAlgoritmo(a: string): string {
    return a === 'arq' ? 'ARQ / Las Vegas' : a === 'montecarlo' ? 'Monte Carlo' : a;
  }

  pct(p: number): number {
    return Math.round(p * 100);
  }

  kbps(bps: number): string {
    return (bps / 1000).toFixed(1);
  }

  fecha(iso: string): string {
    const d = new Date(iso);
    const mes = d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
    const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return `${d.getDate()} de ${mes}, ${hora}`;
  }

  exportar() {
    const cab = ['id', 'escenario', 'algoritmo', 'perdida', 'intentos', 'tasaBps', 'semilla', 'fecha'];
    const filas = this.filas().map(f =>
      [f.id, f.escenario ?? '', f.algoritmo, f.perdida, f.intentos, f.tasaBps, f.semilla ?? '', f.fecha]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = '\uFEFF' + [cab.join(','), ...filas].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial-simulaciones.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
