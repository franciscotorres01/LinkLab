import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulacionService, ParametrosSimulacion } from './simulacion.service';
import { ESCENARIOS } from '../laboratorio/escenarios.data';

const COLORES: Record<string, { c: string; bg: string }> = {
  purple: { c: '#5b4bdb', bg: '#f1eefe' },
  orange: { c: '#d9822b', bg: '#fff4e6' },
  teal:   { c: '#1a9aa0', bg: '#e6f7f6' },
  green:  { c: '#1f9d63', bg: '#e9f8ef' },
  red:    { c: '#d94f5c', bg: '#fdeceb' },
  blue:   { c: '#3b82c4', bg: '#eaf2fc' },
};

// Geometría compartida de las gráficas
const L = 44, R = 412, T = 16, B = 210;

// Límite del microservicio: máximo de paquetes por simulación
const MAX_PAQUETES = 5_000_000;

@Component({
  selector: 'app-simulacion',
  imports: [FormsModule, DecimalPipe],
  template: `
    <section class="page">
      <header class="head">
        <div>
          <p class="eyebrow">SIMULADOR DE ENLACE</p>
          <h1>Ejecutar simulación</h1>
          <p class="sub">Modela la pérdida de paquetes y analiza el comportamiento estadístico del enlace.</p>
        </div>
        <button class="btn-outline" type="button" (click)="verEscenarios()">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <path d="M17 21v-8H7v8M7 3v5h8"/>
          </svg>
          Ver escenarios
        </button>
      </header>

      <div class="layout">
        <!-- ============ 01 CONFIGURACIÓN ============ -->
        <div class="card config">
          <div class="card-head">
            <span class="step">01</span>
            <h2>Configuración</h2>
            <small class="hint">Parámetros del enlace</small>
          </div>

          <p class="lbl">Escenario</p>
          <div class="select-wrap">
            <button class="select" type="button" (click)="alternarMenu($event)">
              <span class="ico" [style.background]="colorEsc().bg" [style.color]="colorEsc().c">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round"><path d="M4 9h16M4 15h16"/></svg>
              </span>
              <span class="sel-text">
                <b>{{ nombreEscenario() }}</b>
                <small>{{ escenarioId() ? 'Escenario guardado' : 'Parámetros manuales' }}</small>
              </span>
              <svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>

            @if (abierto()) {
              <ul class="menu">
                <li (click)="elegirEscenario('')" [class.on]="!escenarioId()">
                  <span class="dot" style="background:#9a9db0"></span> Personalizado
                </li>
                @for (e of escenarios; track e.id) {
                  <li (click)="elegirEscenario(e.id)" [class.on]="escenarioId() === e.id">
                    <span class="dot" [style.background]="colores[e.color].c"></span>
                    {{ e.nombre }}
                    <small>{{ e.perdida }}% · {{ e.rttMs }} ms</small>
                  </li>
                }
              </ul>
            }
          </div>

          <div class="loss-head">
            <p class="lbl">Probabilidad de pérdida</p>
            <span class="pill">{{ pct() }}%</span>
          </div>
          <input class="range" type="range" min="0" max="90" step="1"
                 [ngModel]="pct()" (ngModelChange)="setPerdida($event)"
                 [style.background]="rangoFondo()" />
          <div class="range-labels"><span>0%</span><span>90%</span></div>

          <div class="two">
            <div>
              <p class="lbl">Tamaño de paquete</p>
              <div class="field">
                <input type="number" [(ngModel)]="form.tamanoPaqueteBytes" (ngModelChange)="personalizar()" />
                <span>bytes</span>
              </div>
            </div>
            <div>
              <p class="lbl">Retardo RTT</p>
              <div class="field">
                <input type="number" [(ngModel)]="form.rttMs" (ngModelChange)="personalizar()" />
                <span>ms</span>
              </div>
            </div>
          </div>

          <hr />

          <p class="lbl">Algoritmo</p>
          <div class="two">
            <button type="button" class="algo" [class.on]="form.algoritmo === 'montecarlo'"
                    (click)="setAlgoritmo('montecarlo')">
              <b>Monte Carlo</b><small>Estimación por N corridas</small>
            </button>
            <button type="button" class="algo" [class.on]="form.algoritmo === 'arq'"
                    (click)="setAlgoritmo('arq')">
              <b>ARQ / Las Vegas</b><small>Reintento hasta éxito</small>
            </button>
          </div>

          <p class="lbl mt">Número de repeticiones</p>
          <div class="field big" [class.off]="form.algoritmo === 'arq'">
            <input type="number" [(ngModel)]="form.repeticiones" [disabled]="form.algoritmo === 'arq'" />
            <span>corridas</span>
          </div>
          @if (form.algoritmo === 'arq') {
            <small class="hint">ARQ / Las Vegas simula una sola transferencia. Cambia la semilla para ver otros casos.</small>
          }

          <div class="seed-row">
            <div>
              <p class="lbl">Semilla reproducible</p>
              <small class="hint">Permite repetir exactamente el resultado.</small>
            </div>
            <div class="seed">
              <input type="number" [(ngModel)]="form.semilla" />
              <button type="button" title="Nueva semilla" (click)="nuevaSemilla()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a9 9 0 0 0-15.5-6.2L3 8"/><path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 0 0 15.5 6.2L21 16"/><path d="M16 16h5v5"/>
                </svg>
              </button>
            </div>
          </div>

          <button class="run" type="button" [disabled]="cargando()" (click)="ejecutar()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>
            {{ cargando() ? 'Simulando...' : 'Ejecutar simulación' }}
          </button>
          <p class="foot">La ejecución se guardará en el historial</p>
        </div>

        <!-- ============ 02 RESULTADOS ============ -->
        <div class="card results">
          <div class="card-head">
            <span class="step">02</span>
            <div>
              <h2>Resultados</h2>
              <small class="hint">
                @if (res()) { Última ejecución · {{ esArq() ? 'ARQ / Las Vegas' : 'Monte Carlo' }} · Semilla {{ semillaUsada() }} } @else { Aún no hay ejecuciones }
              </small>
            </div>
            @if (res()) {
              <span class="spacer"></span>
              <span class="ok">● Completada en {{ duracionSeg() | number:'1.2-2' }} s</span>
              <button class="dl" type="button" title="Descargar JSON" (click)="descargar()">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>
              </button>
            }
          </div>

          @if (error()) { <p class="error">{{ error() }}</p> }

          @if (res(); as r) {
            <div class="kpis">
              <div class="kpi">
                <span class="ico" style="background:#f1eefe;color:#5b4bdb">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
                </span>
                <div>
                  <small>{{ esArq() ? 'Intentos hasta el acuse' : 'Intentos promedio' }}</small>
                  <p>
                    <b>{{ (esArq() ? r.totalIntentos : r.promedioIntentos) | number:(esArq() ? '1.0-0' : '1.3-3') }}</b>
                    <i>{{ esArq() ? 'en esta transferencia' : 'por paquete' }}</i>
                  </p>
                </div>
              </div>
              <div class="kpi">
                <span class="ico" style="background:#e6f7f6;color:#1a9aa0">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
                </span>
                <div><small>Valor teórico</small>
                  <p><b>{{ r.valorTeorico | number:'1.3-3' }}</b><i>1 / (1 - p)</i></p></div>
              </div>
              <div class="kpi">
                <span class="ico" style="background:#e9f8ef;color:#1f9d63">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/>
                       <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>
                </span>
                <div><small>Tasa efectiva</small>
                  <p><b>{{ tasaKbps() | number:'1.1-1' }}</b><i>Kbps</i></p></div>
              </div>
              @if (esArq()) {
                <div class="kpi">
                  <span class="ico" style="background:#fff4e6;color:#d9822b">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  </span>
                  <div><small>Tiempo total</small>
                    <p><b>{{ r.tiempoTotalMs | number:'1.0-0' }}</b><i>ms</i></p></div>
                </div>
              } @else {
                <div class="kpi">
                  <span class="ico" style="background:#fff4e6;color:#d9822b">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h13l-4-4M17 17H4l4 4"/></svg>
                  </span>
                  <div><small>Diferencia</small>
                    <p><b>{{ diferenciaPct() | number:'1.2-2' }}%</b></p>
                    <em [class.warn]="!dentroMargen()">{{ dentroMargen() ? 'Dentro del margen' : 'Fuera del margen' }}</em></div>
                </div>
              }
            </div>

            @if (esArq()) {
              <div class="charts">
                <!-- Línea de tiempo de intentos (ARQ) -->
                <div class="chart-card">
                  <div class="chart-head">
                    <h3>Línea de tiempo de intentos</h3>
                  </div>
                  <small class="hint">Cada intento tarda un RTT ({{ rttPorIntento() | number:'1.0-0' }} ms) hasta recibir el acuse</small>
                  @if (arq(); as a) {
                    <div class="tl">
                      @for (it of a.items; track $index) {
                        <div class="blk" [class.ok]="it.ok" [class.fail]="!it.ok">
                          <b>{{ it.n }}</b>
                          <small>{{ it.ok ? 'Acuse' : 'Perdido' }}</small>
                        </div>
                      }
                    </div>
                    @if (a.extra > 0) {
                      <p class="axis">… y {{ a.extra }} intentos más hasta el acuse</p>
                    }
                    <div class="conv-foot">
                      <span><i class="d" style="background:#d94f5c"></i> Intento perdido</span>
                      <span><i class="d" style="background:#1f9d63"></i> Acuse recibido</span>
                    </div>
                  }
                </div>

                <!-- Observado vs teórico (ARQ) -->
                <div class="chart-card">
                  <div class="chart-head"><h3>Observado vs teórico</h3></div>
                  <small class="hint">Intentos de esta transferencia frente al valor esperado</small>
                  @if (arq(); as a) {
                    <div class="cmp">
                      <div class="cmp-row">
                        <span>Observado</span>
                        <div class="track"><div class="bar obs" [style.width.%]="a.pctObs"></div></div>
                        <b>{{ r.totalIntentos | number:'1.0-0' }}</b>
                      </div>
                      <div class="cmp-row">
                        <span>Teórico</span>
                        <div class="track"><div class="bar teo" [style.width.%]="a.pctTeo"></div></div>
                        <b>{{ r.valorTeorico | number:'1.3-3' }}</b>
                      </div>
                    </div>
                    <p class="axis">Una sola transferencia puede alejarse del promedio esperado.</p>
                  }
                </div>
              </div>
            } @else {
              <div class="charts">
                <!-- Distribución de intentos -->
                <div class="chart-card">
                  <div class="chart-head">
                    <h3>Distribución de intentos</h3>
                    <span class="legend"><i class="sq"></i> Observado</span>
                  </div>
                  <small class="hint">Transferencias agrupadas por cantidad de intentos</small>
                  @if (barras(); as b) {
                    <svg viewBox="0 0 420 240" class="chart">
                      <defs>
                        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stop-color="#8b7cf0"/>
                          <stop offset="1" stop-color="#5b4bdb"/>
                        </linearGradient>
                      </defs>
                      @for (t of b.ticks; track $index) {
                        <line x1="44" x2="412" [attr.y1]="t.y" [attr.y2]="t.y" class="gl"/>
                        <text x="36" [attr.y]="t.y + 3" text-anchor="end" class="tick">{{ t.label }}</text>
                      }
                      @for (bar of b.bars; track $index) {
                        <rect [attr.x]="bar.x" [attr.y]="bar.y" [attr.width]="bar.w" [attr.height]="bar.h"
                              rx="4" fill="url(#gb)"/>
                        <text [attr.x]="bar.x + bar.w / 2" y="226" text-anchor="middle" class="tick">{{ bar.label }}</text>
                      }
                    </svg>
                    <p class="axis">Número de intentos</p>
                  } @else {
                    <p class="empty">Este algoritmo no devolvió histograma.</p>
                  }
                </div>

                <!-- Convergencia -->
                <div class="chart-card">
                  <div class="chart-head"><h3>Convergencia del promedio</h3></div>
                  <small class="hint">Promedio acumulado por repetición</small>
                  @if (linea(); as l) {
                    <svg viewBox="0 0 420 240" class="chart">
                      <line x1="44" x2="412" y1="210" y2="210" class="gl"/>
                      <path [attr.d]="l.path" fill="none" stroke="#1a9aa0" stroke-opacity="0.15" stroke-width="14"
                            stroke-linejoin="round" stroke-linecap="round"/>
                      <line x1="44" x2="412" [attr.y1]="l.yTeo" [attr.y2]="l.yTeo" stroke="#d9822b"
                            stroke-dasharray="4 4" stroke-width="1"/>
                      <path [attr.d]="l.path" fill="none" stroke="#1a9aa0" stroke-width="2.5"
                            stroke-linejoin="round" stroke-linecap="round"/>
                      <text x="412" [attr.y]="l.yTeo - 6" text-anchor="end" class="tag">Teórico: {{ l.teo | number:'1.3-3' }}</text>
                      @for (x of l.xs; track $index) {
                        <text [attr.x]="x.x" y="228" text-anchor="middle" class="tick">{{ x.label }}</text>
                      }
                    </svg>
                    <div class="conv-foot">
                      <span><i class="d" style="background:#1a9aa0"></i> Estimado<br/><b>{{ r.promedioIntentos | number:'1.3-3' }}</b></span>
                      <span><i class="d" style="background:#d9822b"></i> Teórico<br/><b>{{ r.valorTeorico | number:'1.3-3' }}</b></span>
                      @if (dentroMargen()) { <span class="verif">✓ Convergencia verificada</span> }
                    </div>
                  } @else {
                    <p class="empty">Este algoritmo no devolvió datos de convergencia.</p>
                  }
                </div>
              </div>
            }

            <div class="lectura">
              <span class="ico" style="background:#ece9fd;color:#5b4bdb">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l4 4-4 4M12 17h7"/></svg>
              </span>
              <div>
                <b>Lectura del resultado</b>
                <p>{{ lectura() }}</p>
              </div>
            </div>
          } @else if (!error()) {
            <div class="placeholder">
              <p>Configura el enlace y presiona <b>Ejecutar simulación</b> para ver las métricas y las gráficas.</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: 32px 48px 56px; color: #12122b; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 28px; }
    .eyebrow { display: inline-block; margin: 0 0 10px; padding-top: 6px; border-top: 2px solid #5b4bdb;
      font-size: 11px; letter-spacing: .18em; font-weight: 600; color: #5b4bdb; }
    h1 { margin: 0 0 8px; font-size: 44px; line-height: 1.1; letter-spacing: -0.02em; }
    .sub { margin: 0; color: #5d6075; font-size: 16px; }
    .btn-outline { display: inline-flex; align-items: center; gap: 10px; background: #fff; border: 1px solid #e3e5ee;
      border-radius: 12px; padding: 14px 22px; font-weight: 600; font-size: 14px; cursor: pointer; color: #12122b; }
    .btn-outline:hover { border-color: #8b7cf0; color: #5b4bdb; }

    .layout { display: grid; grid-template-columns: 420px minmax(0, 1fr); gap: 24px; align-items: start; }
    @media (max-width: 1100px) { .layout { grid-template-columns: 1fr; } .page { padding: 24px 16px; } }

    .card { background: #fff; border: 1px solid #e6e8f0; border-radius: 24px; padding: 28px;
      box-shadow: 0 4px 24px rgba(18,18,43,.04); box-sizing: border-box; }
    .card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
    .card-head h2 { margin: 0; font-size: 22px; }
    .step { background: #ece9fd; color: #5b4bdb; font-weight: 700; font-size: 12px; padding: 9px 10px; border-radius: 10px; }
    .hint { color: #8c90a4; font-size: 11px; }
    .card-head > .hint { margin-left: auto; }
    .spacer { flex: 1; }
    .lbl { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #3a3d55; }
    .lbl.mt { margin-top: 20px; }
    hr { border: 0; border-top: 1px solid #eceef5; margin: 22px 0; }

    .select-wrap { position: relative; margin-bottom: 22px; }
    .select { width: 100%; display: flex; align-items: center; gap: 14px; background: #fff; border: 1px solid #e3e5ee;
      border-radius: 14px; padding: 14px 16px; cursor: pointer; text-align: left; box-sizing: border-box; }
    .select:hover { border-color: #8b7cf0; }
    .ico { width: 38px; height: 38px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
    .sel-text { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .sel-text b { font-size: 14px; }
    .sel-text small { color: #8c90a4; font-size: 11px; }
    .chev { color: #8c90a4; }
    .menu { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px); margin: 0; padding: 6px;
      list-style: none; background: #fff; border: 1px solid #e3e5ee; border-radius: 14px;
      box-shadow: 0 16px 40px rgba(18,18,43,.14); max-height: 300px; overflow: auto; }
    .menu li { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; font-size: 14px; cursor: pointer; }
    .menu li small { margin-left: auto; color: #8c90a4; font-size: 11px; }
    .menu li:hover, .menu li.on { background: #f4f2fe; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }

    .loss-head { display: flex; justify-content: space-between; align-items: center; }
    .pill { background: #ece9fd; color: #5b4bdb; font-weight: 700; font-size: 12px; padding: 7px 14px; border-radius: 10px; }
    .range { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; border-radius: 999px; outline: none; margin: 10px 0 6px; }
    .range::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
      background: #fff; border: 6px solid #5b4bdb; cursor: pointer; box-shadow: 0 2px 8px rgba(91,75,219,.4); box-sizing: border-box; }
    .range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 6px solid #5b4bdb; cursor: pointer; }
    .range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #8c90a4; margin-bottom: 22px; }

    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { display: flex; align-items: center; gap: 8px; border: 1px solid #e3e5ee; border-radius: 14px; padding: 0 16px;
      height: 52px; background: #fff; box-sizing: border-box; }
    .field:focus-within { border-color: #8b7cf0; box-shadow: 0 0 0 2px #e4defc; }
    .field input { border: 0; outline: 0; width: 100%; min-width: 0; font-size: 16px; font-weight: 600; background: transparent; color: #12122b; }
    .field span { color: #8c90a4; font-size: 12px; font-weight: 600; }
    .field.big { height: 56px; }
    .field.off { background: #f4f5f9; opacity: .65; }

    .algo { text-align: left; background: #fff; border: 1px solid #e3e5ee; border-radius: 14px; padding: 14px 16px;
      cursor: pointer; display: flex; flex-direction: column; gap: 4px; box-sizing: border-box; }
    .algo b { font-size: 14px; }
    .algo small { color: #8c90a4; font-size: 11px; }
    .algo:hover { border-color: #b9b0f6; }
    .algo.on { border: 2px solid #5b4bdb; background: #f4f2fe; padding: 13px 15px; }
    .algo.on b { color: #4d3ec7; }

    .seed-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 22px; }
    .seed { display: flex; border: 1px solid #e3e5ee; border-radius: 14px; overflow: hidden; height: 48px; }
    .seed input { border: 0; outline: 0; width: 100px; padding: 0 14px; font-size: 14px; }
    .seed button { border: 0; border-left: 1px solid #e3e5ee; background: #ece9fd; color: #5b4bdb; width: 50px; cursor: pointer; }
    .seed button:hover { background: #ddd7fb; }

    .run { width: 100%; margin-top: 26px; display: flex; align-items: center; justify-content: center; gap: 10px;
      border: 0; cursor: pointer; background: #5b4bdb; color: #fff; font-weight: 700; font-size: 15px;
      padding: 18px; border-radius: 14px; box-shadow: 0 12px 28px rgba(91,75,219,.35); }
    .run:hover { background: #4d3ec7; }
    .run:disabled { opacity: .6; cursor: default; }
    .foot { margin: 12px 0 0; text-align: center; font-size: 12px; color: #8c90a4; }

    .ok { background: #e9f8ef; color: #1f9d63; font-weight: 600; font-size: 12px; padding: 8px 14px; border-radius: 10px; }
    .dl { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #e3e5ee; background: #fff; cursor: pointer; color: #3a3d55; }
    .dl:hover { border-color: #8b7cf0; color: #5b4bdb; }
    .error { color: #d94f5c; font-weight: 600; background: #fdeceb; padding: 12px 16px; border-radius: 12px; }
    .placeholder { border: 1px dashed #d9dbe8; border-radius: 16px; padding: 60px 24px; text-align: center; color: #5d6075; }

    .kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 20px; }
    @media (max-width: 1400px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    .kpi { display: flex; gap: 12px; align-items: flex-start; border: 1px solid #e6e8f0; border-radius: 18px; padding: 16px; }
    .kpi small { font-size: 11px; color: #7b7f95; }
    .kpi p { margin: 6px 0 0; display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap; }
    .kpi b { font-size: 28px; letter-spacing: -0.02em; }
    .kpi i { font-style: normal; font-size: 10px; color: #8c90a4; }
    .kpi em { font-style: normal; font-size: 10px; color: #1f9d63; font-weight: 600; }
    .kpi em.warn { color: #d94f5c; }

    .charts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
    @media (max-width: 1400px) { .charts { grid-template-columns: 1fr; } }
    .chart-card { border: 1px solid #e6e8f0; border-radius: 18px; padding: 20px; }
    .chart-head { display: flex; justify-content: space-between; align-items: center; }
    .chart-head h3 { margin: 0; font-size: 16px; }
    .legend { font-size: 11px; color: #5d6075; display: inline-flex; align-items: center; gap: 6px; }
    .sq { width: 10px; height: 10px; border-radius: 3px; background: #5b4bdb; display: inline-block; }
    .chart { width: 100%; height: auto; margin-top: 8px; }
    .gl { stroke: #e6e8f0; stroke-dasharray: 3 3; }
    .tick { font-size: 10px; fill: #8c90a4; }
    .tag { font-size: 10px; fill: #d9822b; }
    .axis { text-align: center; font-size: 11px; color: #8c90a4; margin: 10px 0 0; }
    .empty { color: #8c90a4; font-size: 13px; padding: 40px 0; text-align: center; }
    .conv-foot { display: flex; gap: 28px; align-items: flex-end; font-size: 10px; color: #8c90a4; line-height: 1.5; margin-top: 12px; }
    .conv-foot b { color: #12122b; font-size: 12px; }
    .d { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
    .verif { margin-left: auto; color: #1a9aa0; font-weight: 600; font-size: 11px; }

    .tl { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .blk { min-width: 62px; padding: 12px 10px; border-radius: 12px; text-align: center; display: flex; flex-direction: column; gap: 2px; }
    .blk b { font-size: 18px; }
    .blk small { font-size: 10px; font-weight: 600; }
    .blk.fail { background: #fdeceb; color: #d94f5c; }
    .blk.ok { background: #e9f8ef; color: #1f9d63; padding: 12px 10px; border-radius: 12px; font-size: inherit; }

    .cmp { margin-top: 22px; display: flex; flex-direction: column; gap: 18px; }
    .cmp-row { display: grid; grid-template-columns: 74px 1fr 52px; align-items: center; gap: 12px; font-size: 12px; color: #5d6075; }
    .cmp-row b { color: #12122b; text-align: right; }
    .track { height: 14px; background: #f1f2f7; border-radius: 999px; overflow: hidden; }
    .bar { height: 100%; border-radius: 999px; }
    .bar.obs { background: linear-gradient(90deg, #8b7cf0, #5b4bdb); }
    .bar.teo { background: #d9822b; }

    .lectura { display: flex; gap: 14px; align-items: center; background: #f8f7ff; border: 1px solid #e6e2fb;
      border-radius: 18px; padding: 18px 20px; }
    .lectura b { font-size: 14px; }
    .lectura p { margin: 4px 0 0; font-size: 12px; color: #5d6075; line-height: 1.5; }
  `],
})
export class SimulacionComponent {
  private servicio = inject(SimulacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private host = inject(ElementRef);

  escenarios = ESCENARIOS;
  colores = COLORES;

  escenarioId = signal<string>('');
  abierto = signal(false);

  form: ParametrosSimulacion = {
    algoritmo: 'montecarlo',
    probabilidadPerdida: 0.12,
    tamanoPaqueteBytes: 1400,
    rttMs: 78,
    repeticiones: 10000,
    tamanoArchivoBytes: 1000000,
    semilla: 184729,
  };

  resultado = signal<any>(null);
  error = signal<string | null>(null);
  cargando = signal(false);
  duracionMs = signal(0);
  semillaUsada = signal<number>(0);

  res = computed<any>(() => this.resultado()?.resultado ?? null);
  esArq = computed(() => this.res()?.algoritmo === 'arq');
  duracionSeg = computed(() => this.duracionMs() / 1000);
  tasaKbps = computed(() => (this.res()?.tasaBps ?? 0) / 1000);
  diferenciaPct = computed(() => (this.res()?.diferenciaRelativa ?? 0) * 100);
  dentroMargen = computed(() => this.diferenciaPct() < 1);
  rttPorIntento = computed(() => {
    const r = this.res();
    if (!r) return 0;
    return (r.tiempoTotalMs ?? 0) / Math.max(1, r.totalIntentos ?? 1);
  });

  constructor() {
    const id = this.route.snapshot.queryParamMap.get('escenario');
    this.elegirEscenario(id ?? 'wifi');
  }

  @HostListener('document:click', ['$event'])
  cerrarMenu(ev: Event) {
    if (!this.host.nativeElement.contains(ev.target)) this.abierto.set(false);
  }

  // ---------- escenario y parámetros ----------
  alternarMenu(ev: Event) {
    ev.stopPropagation();
    this.abierto.set(!this.abierto());
  }

  nombreEscenario(): string {
    return this.escenarios.find(e => e.id === this.escenarioId())?.nombre ?? 'Personalizado';
  }

  colorEsc(): { c: string; bg: string } {
    const e = this.escenarios.find(x => x.id === this.escenarioId());
    return e ? COLORES[e.color] : { c: '#7b7f95', bg: '#f1f2f7' };
  }

  elegirEscenario(id: string) {
    this.abierto.set(false);
    this.escenarioId.set(id);
    const e = this.escenarios.find(x => x.id === id);
    if (!e) return;
    this.form = {
      ...this.form,
      probabilidadPerdida: e.perdida / 100,
      tamanoPaqueteBytes: e.paqueteBytes,
      rttMs: e.rttMs,
    };
  }

  setAlgoritmo(a: string) {
    this.form.algoritmo = a;
  }

  pct(): number {
    return Math.round(this.form.probabilidadPerdida * 100);
  }

  setPerdida(v: number | string) {
    this.form.probabilidadPerdida = Number(v) / 100;
    this.personalizar();
  }

  rangoFondo(): string {
    const p = (this.pct() / 90) * 100;
    return `linear-gradient(to right, #5b4bdb ${p}%, #e6e8f0 ${p}%)`;
  }

  personalizar() {
    const e = this.escenarios.find(x => x.id === this.escenarioId());
    if (!e) return;
    const igual =
      Math.abs(this.form.probabilidadPerdida - e.perdida / 100) < 1e-9 &&
      this.form.tamanoPaqueteBytes === e.paqueteBytes &&
      this.form.rttMs === e.rttMs;
    if (!igual) this.escenarioId.set('');
  }

  nuevaSemilla() {
    this.form.semilla = Math.floor(Math.random() * 999999) + 1;
  }

  verEscenarios() {
    this.router.navigate(['/laboratorio/escenarios']);
  }

  // ---------- ejecutar ----------
  ejecutar() {
    this.cargando.set(true);
    this.error.set(null);

    // El microservicio rechaza simulaciones de más de MAX_PAQUETES paquetes:
    // se reduce el tamaño del archivo para quedar siempre dentro del límite.
    const reps = Math.max(1, this.form.repeticiones);
    const maxArchivo = Math.floor(MAX_PAQUETES / reps) * this.form.tamanoPaqueteBytes;
    const peticion: ParametrosSimulacion = {
      ...this.form,
      tamanoArchivoBytes: Math.min(this.form.tamanoArchivoBytes, maxArchivo),
      escenarioId: this.escenarioId(),
      escenarioNombre: this.nombreEscenario(),
    };

    const t0 = performance.now();
    this.servicio.simular(peticion).subscribe({
      next: (r: any) => {
        this.duracionMs.set(performance.now() - t0);
        this.semillaUsada.set(r?.semilla ?? this.form.semilla);
        this.resultado.set(r);
        this.cargando.set(false);
      },
      error: (e: any) => {
        this.resultado.set(null);
        const detalle = e?.error?.detalle;
        this.error.set(
          detalle
            ? `${e.error.error}: ${detalle}`
            : (e?.error?.error ?? `Error ${e?.status ?? ''}`)
        );
        this.cargando.set(false);
      },
    });
  }

  descargar() {
    const blob = new Blob([JSON.stringify(this.resultado(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacion-${this.semillaUsada()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- lectura ----------
  lectura = computed(() => {
    const r = this.res();
    if (!r) return '';
    const p = this.pct();

    if (r.algoritmo === 'arq') {
      const n = r.totalIntentos ?? 1;
      const teo = (r.valorTeorico ?? 0).toFixed(3);
      return n === 1
        ? `Con una pérdida del ${p}%, el paquete llegó en el primer intento y recibió el acuse sin reintentos. En promedio se esperan ${teo} intentos por paquete; prueba otra semilla para ver casos con reintentos.`
        : `Con una pérdida del ${p}%, el paquete necesitó ${n} intentos hasta recibir el acuse (se esperan ${teo} en promedio). Cada reintento suma un RTT al tiempo total.`;
    }

    const primero = r.histograma?.['1'];
    const total = r.totalPaquetes;
    const parte = primero && total ? Math.round((primero / total) * 100) : null;
    const base = parte !== null
      ? `Con una pérdida del ${p}%, el ${parte}% de los paquetes se entrega en el primer intento. `
      : `Con una pérdida del ${p}%, el enlace necesita reintentos para entregar los paquetes. `;
    return base + (this.dentroMargen()
      ? 'La cola decrece de forma geométrica y el promedio converge al valor teórico esperado.'
      : 'El promedio todavía se aleja del valor teórico: prueba con más repeticiones.');
  });

  // ---------- ARQ ----------
  arq = computed(() => {
    const r = this.res();
    if (!r || r.algoritmo !== 'arq') return null;
    const n = Math.max(1, r.totalIntentos ?? 1);
    const MAX_VISIBLES = 12;
    const mostrar = Math.min(n, MAX_VISIBLES);
    const items = Array.from({ length: mostrar }, (_, i) => ({
      n: i + 1,
      ok: n <= MAX_VISIBLES && i === n - 1,
    }));
    const teo: number = r.valorTeorico ?? 1;
    const max = Math.max(n, teo, 1);
    return {
      items,
      extra: Math.max(0, n - MAX_VISIBLES),
      pctObs: (n / max) * 100,
      pctTeo: (teo / max) * 100,
    };
  });

  // ---------- gráficas (Montecarlo) ----------
  private fmt(v: number): string {
    if (v >= 1000) return (v / 1000).toLocaleString('es', { maximumFractionDigits: 1 }) + 'k';
    return String(Math.round(v));
  }

  barras = computed(() => {
    const h = this.res()?.histograma as Record<string, number> | undefined;
    if (!h) return null;
    const vals: number[] = [1, 2, 3, 4, 5].map(k => h[String(k)] ?? 0);
    let resto = 0;
    for (const k of Object.keys(h)) if (Number(k) >= 6) resto += h[k];
    vals.push(resto);
    const max = Math.max(...vals, 1);
    const pow = Math.pow(10, Math.floor(Math.log10(max)));
    const top = Math.ceil(max / pow) * pow;
    const plotH = B - T;
    const slot = (R - L) / 6;
    const w = slot * 0.6;
    const labels = ['1', '2', '3', '4', '5', '6+'];
    const bars = vals.map((v, i) => {
      const hh = (v / top) * plotH;
      return { label: labels[i], x: L + slot * i + (slot - w) / 2, y: B - hh, w, h: hh };
    });
    const ticks = [0, top / 2, top].map(v => ({ y: B - (v / top) * plotH, label: this.fmt(v) }));
    return { bars, ticks };
  });

  linea = computed(() => {
    const r = this.res();
    const c: number[] | undefined = r?.convergencia;
    if (!c || !c.length) return null;
    const teo: number = r.valorTeorico ?? c[c.length - 1];
    let lo = teo, hi = teo;
    for (const v of c) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const pad = (hi - lo) * 0.1 || 0.01;
    lo -= pad;
    hi += pad;
    const y = (v: number) => B - ((v - lo) / (hi - lo)) * (B - T);
    const n = c.length;
    const x = (i: number) => L + (n > 1 ? (i / (n - 1)) * (R - L) : 0);
    const step = Math.max(1, Math.floor(n / 220));
    let path = '';
    for (let i = 0; i < n; i += step) {
      path += (path ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(c[i]).toFixed(1) + ' ';
    }
    path += 'L' + x(n - 1).toFixed(1) + ',' + y(c[n - 1]).toFixed(1);
    const xs = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const idx = Math.round(f * (n - 1));
      return { x: x(idx), label: (idx + 1).toLocaleString('es') };
    });
    return { path, yTeo: y(teo), teo, xs };
  });
}
