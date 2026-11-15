import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Escenario, ESCENARIOS } from './escenarios.data';

@Component({
  selector: 'app-escenarios',
  template: `
    <section class="page">
      <p class="eyebrow">BIBLIOTECA DE PRUEBAS</p>
      <h1>Escenarios de enlace</h1>
      <p class="sub">Selecciona una configuración base para comenzar una nueva simulación.</p>

      <div class="toolbar">
        <div>
          <strong>{{ escenarios.length }} escenarios disponibles</strong>
          <span>Configuraciones base validadas por el laboratorio</span>
        </div>
        <button class="btn-primary" type="button">
          <span class="plus">+</span> Nuevo escenario
        </button>
      </div>

      <div class="grid">
        @for (e of escenarios; track e.id) {
          <article class="card" [class.activo]="activo() === e.id" [attr.data-color]="e.color">
            <div class="banner">
              <svg class="icon" viewBox="0 0 24 24" width="26" height="26" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/>
                <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>
              </svg>
              <span class="pill">{{ e.perdida }}% pérdida</span>
            </div>

            <div class="body">
              <div class="title-row">
                <h3>{{ e.nombre }}</h3>
                @if (activo() === e.id) { <span class="badge">Activo</span> }
              </div>
              <p class="desc">{{ e.descripcion }}</p>

              <div class="stats">
                <div><small>Paquete</small><b>{{ e.paqueteBytes }} B</b></div>
                <div><small>RTT</small><b>{{ e.rttMs }} ms</b></div>
                <div><small>Ejecuciones</small><b>{{ e.ejecuciones }}</b></div>
              </div>

              <button class="btn-outline" type="button" (click)="usar(e)">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>
                Usar escenario
              </button>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: 40px 56px 56px; }
    .eyebrow { display: inline-block; margin: 0 0 12px; padding-top: 6px; border-top: 2px solid #5b4bdb;
      font-size: 11px; letter-spacing: .18em; font-weight: 600; color: #5b4bdb; }
    h1 { margin: 0 0 8px; font-size: 44px; line-height: 1.1; letter-spacing: -0.02em; color: #12122b; }
    .sub { margin: 0 0 28px; color: #5d6075; font-size: 16px; }

    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px;
      background: #fff; border: 1px solid #e6e8f0; border-radius: 18px; padding: 20px 24px; margin-bottom: 24px; }
    .toolbar strong { display: block; font-size: 15px; color: #12122b; }
    .toolbar span { font-size: 12px; color: #7b7f95; }
    .btn-primary { display: inline-flex; align-items: center; gap: 8px; border: 0; cursor: pointer;
      background: #5b4bdb; color: #fff; font-weight: 600; font-size: 14px; padding: 14px 24px;
      border-radius: 12px; box-shadow: 0 8px 20px rgba(91,75,219,.3); }
    .btn-primary:hover { background: #4d3ec7; }
    .plus { font-size: 18px; line-height: 1; }

    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 720px)  { .grid { grid-template-columns: 1fr; } .page { padding: 24px 16px; } }

    .card { --c: #5b4bdb; --bg: #f1eefe; background: #fff; border: 1px solid #e6e8f0;
      border-radius: 20px; overflow: hidden; transition: box-shadow .15s, transform .15s; }
    .card:hover { box-shadow: 0 12px 28px rgba(18,18,43,.08); transform: translateY(-2px); }
    .card.activo { border-color: #8b7cf0; box-shadow: 0 0 0 1px #8b7cf0; }
    .card[data-color="orange"] { --c: #d9822b; --bg: #fff4e6; }
    .card[data-color="teal"]   { --c: #1a9aa0; --bg: #e6f7f6; }
    .card[data-color="green"]  { --c: #1f9d63; --bg: #e9f8ef; }
    .card[data-color="red"]    { --c: #d94f5c; --bg: #fdeceb; }
    .card[data-color="blue"]   { --c: #3b82c4; --bg: #eaf2fc; }

    .banner { position: relative; height: 116px; background: var(--bg); padding: 20px 24px; color: var(--c); }
    .pill { position: absolute; right: 16px; bottom: 12px; background: #fff; color: var(--c);
      font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 999px; }

    .body { padding: 22px 22px 22px; }
    .title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    h3 { margin: 0; font-size: 18px; color: #12122b; }
    .badge { background: #ece9fd; color: #5b4bdb; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
    .desc { margin: 6px 0 0; min-height: 44px; font-size: 12px; color: #7b7f95; }

    .stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #eceef5;
      border-bottom: 1px solid #eceef5; margin: 14px 0 18px; }
    .stats div { padding: 14px 0; }
    .stats div + div { padding-left: 16px; border-left: 1px solid #eceef5; }
    .stats small { display: block; font-size: 10px; color: #8c90a4; margin-bottom: 4px; }
    .stats b { font-size: 14px; color: #12122b; }

    .btn-outline { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      background: #fff; border: 1px solid #e3e5ee; border-radius: 12px; padding: 14px; cursor: pointer;
      font-weight: 600; font-size: 12px; color: #12122b; }
    .btn-outline:hover { border-color: #8b7cf0; color: #5b4bdb; }
  `],
})
export class EscenariosComponent {
  activo = signal<string>('wifi');

  escenarios = ESCENARIOS;

  constructor(private router: Router) {}

  usar(e: Escenario) {
    this.activo.set(e.id);
    this.router.navigate(['/laboratorio/simulaciones'], {
      queryParams: { escenario: e.id },
    });
  }
}
