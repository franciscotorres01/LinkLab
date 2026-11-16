import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

interface Fila {
  id: number;
  escenario: string | null;
  algoritmo: string;
  perdida: number;
  intentos: number;
  tasaBps: number;
  semilla: number | null;
  fecha: string;
  promedioIntentos: number;
  valorTeorico: number;
  diferenciaRelativa: number;
  maxIntentos: number;
  rttMs: number;
  tamanoPaqueteBytes: number;
  repeticiones: number;
  totalPaquetes: number;
}

const MAX = 3;
const COLORES = ['#5b4bdb', '#1a9aa0', '#d9822b'];

// Guarda la selección en memoria para que no se pierda al navegar
@Injectable({ providedIn: 'root' })
export class ComparacionService {
  ids = signal<number[]>([]);

  agregar(id: number) {
    if (!this.ids().includes(id)) {
      this.ids.update(l => [...l, id].slice(-MAX));
    }
  }
  quitar(id: number) {
    this.ids.update(l => l.filter(x => x !== id));
  }
  limpiar() {
    this.ids.set([]);
  }
}

@Component({
  selector: 'app-comparar',
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="head">
        <p class="eyebrow">ANÁLISIS COMPARATIVO</p>
        <h1>Comparar simulaciones</h1>
        <p class="sub">Contrasta hasta tres ejecuciones guardadas y encuentra el enlace más eficiente.</p>
      </header>

      @if (error()) {
        <div class="aviso">No se pudo cargar el historial. ¿Está el backend encendido?</div>
      } @else {
        <div class="layout">
          <!-- ============ 01 SELECCIONAR ============ -->
          <div class="card">
            <div class="card-head">
              <span class="step">01</span>
              <div>
                <h2>Seleccionar ejecuciones</h2>
                <small class="hint">Máximo {{ max }} simulaciones</small>
              </div>
              <span class="count">{{ seleccionadas().length }}/{{ max }}</span>
            </div>

            <div class="lista">
              @for (f of todas(); track f.id) {
                <div class="item" [class.on]="estaSel(f.id)" [class.off]="!estaSel(f.id) && llena()"
                     (click)="alternar(f.id)">
                  <span class="chk" [class.on]="estaSel(f.id)">
                    @if (estaSel(f.id)) {
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="3"
                           stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                    }
                  </span>
                  <div>
                    <b>{{ f.escenario || 'Personalizado' }}</b>
                    <small>{{ fecha(f.fecha) }} · {{ nombreAlgoritmo(f.algoritmo) }}</small>
                  </div>
                </div>
              } @empty {
                <p class="vacio-lista">
                  Aún no hay simulaciones guardadas.
                  <a routerLink="/laboratorio/simulaciones">Ejecutar una simulación</a>
                </p>
              }
            </div>

            @if (seleccionadas().length) {
              <button class="limpiar" type="button" (click)="limpiar()">Limpiar selección</button>
            }
          </div>

          <!-- ============ 02 RESULTADOS ============ -->
          <div class="card">
            <div class="card-head">
              <span class="step">02</span>
              <div>
                <h2>Resultados comparados</h2>
                <small class="hint">Mismas métricas, lado a lado</small>
              </div>
            </div>
            <hr />

            @if (!seleccionadas().length) {
              <div class="placeholder">
                <p>Selecciona al menos una ejecución de la lista para ver sus métricas.</p>
              </div>
            } @else {
              <div class="tarjetas" [style.grid-template-columns]="'repeat(' + seleccionadas().length + ', minmax(0, 1fr))'">
                @for (s of seleccionadas(); track s.id; let i = $index) {
                  <div class="mini">
                    <div class="mini-head">
                      <div>
                        <p class="nom"><i class="dot" [style.background]="color(i)"></i> {{ s.escenario || 'Personalizado' }}</p>
                        <small>{{ nombreAlgoritmo(s.algoritmo) }}</small>
                      </div>
                      @if (esMasEficiente(s)) { <span class="badge">Más eficiente</span> }
                    </div>
                    <p class="grande">{{ s.promedioIntentos.toFixed(3) }}</p>
                    <small class="hint">intentos promedio</small>
                    <div class="barra"><div [style.width.%]="pctTasa(s)" [style.background]="color(i)"></div></div>
                    <div class="barra-pie">
                      <span>Tasa efectiva</span>
                      <b>{{ kbps(s.tasaBps) }} Kbps</b>
                    </div>
                  </div>
                }
              </div>

              <div class="tabla">
                <div class="fila cab" [style.grid-template-columns]="cols()">
                  <span>Métrica</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ s.escenario || 'Personalizado' }}</span> }
                </div>

                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Algoritmo</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ nombreAlgoritmo(s.algoritmo) }}</span> }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Pérdida</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ pct(s.perdida) }}%</span> }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Retardo RTT</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ s.rttMs }} ms</span> }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Intentos totales</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ s.intentos.toLocaleString('es-CO') }}</span> }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Valor teórico</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ s.valorTeorico.toFixed(3) }}</span> }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Diferencia</span>
                  @for (s of seleccionadas(); track s.id) {
                    <span class="der dif" [class.mal]="s.diferenciaRelativa * 100 >= 1">{{ (s.diferenciaRelativa * 100).toFixed(2) }}%</span>
                  }
                </div>
                <div class="fila" [style.grid-template-columns]="cols()">
                  <span>Semilla</span>
                  @for (s of seleccionadas(); track s.id) { <span class="der">{{ s.semilla }}</span> }
                </div>
              </div>
            }
          </div>
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
    .aviso { background: #fff4e6; border: 1px solid #f3dcb8; color: #8a5a14; border-radius: 14px; padding: 16px 20px; }

    .layout { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 24px; align-items: start; }
    @media (max-width: 1100px) { .layout { grid-template-columns: 1fr; } .page { padding: 24px 16px; } }

    .card { background: #fff; border: 1px solid #e6e8f0; border-radius: 24px; padding: 24px;
      box-shadow: 0 4px 24px rgba(18,18,43,.04); box-sizing: border-box; }
    .card-head { display: flex; align-items: center; gap: 14px; }
    .card-head h2 { margin: 0; font-size: 16px; }
    .step { background: #ece9fd; color: #5b4bdb; font-weight: 700; font-size: 11px; padding: 9px 10px; border-radius: 10px; }
    .hint { color: #8c90a4; font-size: 10px; display: block; margin-top: 3px; }
    .count { margin-left: auto; color: #5b4bdb; font-weight: 700; font-size: 12px; }
    hr { border: 0; border-top: 1px solid #eceef5; margin: 20px 0; }

    .lista { margin-top: 20px; border-top: 1px solid #eceef5; padding-top: 14px; max-height: 520px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 8px; }
    .item { display: flex; align-items: center; gap: 14px; padding: 14px 14px; border-radius: 14px;
      border: 1px solid transparent; cursor: pointer; }
    .item:hover { background: #fafaff; }
    .item.on { background: #f4f2fe; border-color: #d9d3fa; }
    .item.off { opacity: .45; cursor: not-allowed; }
    .item b { display: block; font-size: 11px; }
    .item small { display: block; margin-top: 4px; color: #9a9db0; font-size: 9px; }
    .chk { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid #d3d6e3; background: #fff;
      display: inline-flex; align-items: center; justify-content: center; flex: none; }
    .chk.on { background: #5b4bdb; border-color: #5b4bdb; }
    .vacio-lista { color: #8c90a4; font-size: 12px; text-align: center; padding: 24px 8px; line-height: 1.6; }
    .vacio-lista a { color: #5b4bdb; font-weight: 600; }
    .limpiar { margin-top: 14px; width: 100%; background: #fff; border: 1px solid #e3e5ee; border-radius: 12px;
      padding: 11px; font-weight: 600; font-size: 12px; color: #5d6075; cursor: pointer; }
    .limpiar:hover { border-color: #8b7cf0; color: #5b4bdb; }

    .placeholder { border: 1px dashed #d9dbe8; border-radius: 16px; padding: 60px 24px; text-align: center; color: #5d6075; }

    .tarjetas { display: grid; gap: 16px; margin-bottom: 20px; }
    .mini { border: 1px solid #e6e8f0; border-radius: 18px; padding: 18px 20px; }
    .mini-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .nom { margin: 0; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    .mini-head small { display: block; margin: 4px 0 0 16px; color: #9a9db0; font-size: 9px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .badge { background: #e9f8ef; color: #1f9d63; font-size: 9px; font-weight: 700; padding: 5px 10px; border-radius: 999px; white-space: nowrap; }
    .grande { margin: 18px 0 2px; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; }
    .barra { height: 5px; background: #eceef5; border-radius: 999px; margin: 18px 0 8px; overflow: hidden; }
    .barra div { height: 100%; border-radius: 999px; }
    .barra-pie { display: flex; justify-content: space-between; font-size: 9px; color: #9a9db0; }
    .barra-pie b { color: #12122b; }

    .tabla { border: 1px solid #e6e8f0; border-radius: 18px; overflow-x: auto; }
    .fila { display: grid; align-items: center; gap: 12px; min-width: 460px; padding: 16px 20px;
      border-top: 1px solid #eceef5; font-size: 10px; color: #7b7f95; }
    .fila.cab { border-top: 0; background: #f6f7fb; color: #12122b; font-weight: 700; }
    .der { text-align: right; }
    .dif { color: #1f9d63; font-weight: 700; }
    .dif.mal { color: #d94f5c; }
  `],
})
export class CompararComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cmp = inject(ComparacionService);

  max = MAX;
  todas = signal<Fila[]>([]);
  error = signal(false);

  seleccionadas = computed(() =>
    this.cmp.ids()
      .map(id => this.todas().find(f => f.id === id))
      .filter((f): f is Fila => !!f)
  );
  llena = computed(() => this.seleccionadas().length >= MAX);
  cols = computed(() => `1.4fr repeat(${this.seleccionadas().length}, minmax(0, 1fr))`);
  maxTasa = computed(() => Math.max(1, ...this.seleccionadas().map(s => s.tasaBps)));

  constructor() {
    const sim = Number(this.route.snapshot.queryParamMap.get('sim'));
    if (sim) this.cmp.agregar(sim);

    this.http.get<Fila[]>('http://localhost:8081/api/historial').subscribe({
      next: (r) => this.todas.set(r),
      error: () => this.error.set(true),
    });
  }

  estaSel(id: number): boolean {
    return this.cmp.ids().includes(id);
  }

  alternar(id: number) {
    if (this.estaSel(id)) this.cmp.quitar(id);
    else if (!this.llena()) this.cmp.agregar(id);
  }

  limpiar() {
    this.cmp.limpiar();
  }

  color(i: number): string {
    return COLORES[i % COLORES.length];
  }

  // "Más eficiente" = la mayor tasa efectiva; solo se muestra al comparar 2 o más
  esMasEficiente(s: Fila): boolean {
    return this.seleccionadas().length > 1 && s.tasaBps >= this.maxTasa();
  }

  pctTasa(s: Fila): number {
    return (s.tasaBps / this.maxTasa()) * 100;
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
}
