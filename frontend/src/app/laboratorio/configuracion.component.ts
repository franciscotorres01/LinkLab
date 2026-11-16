import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  template: `
    <h1 class="titulo">Configuración</h1>
    <p class="sub">Resumen de tus datos personales.</p>

    <section class="card">
      <h2>Datos personales</h2>
      <div class="row">
        <label>Nombre<input [value]="auth.nombreCompleto()" readonly /></label>
        <label>Rol<input [value]="rol()" readonly /></label>
      </div>
      <div class="row">
        <label>Usuario<input [value]="auth.nombre()" readonly /></label>
        <label>Correo<input [value]="auth.correo() || '—'" readonly /></label>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .titulo { font-size: 44px; letter-spacing: -0.5px; margin: 0; color: #0f1226; }
    .sub { color: #6b7090; margin: 14px 0 34px; font-size: 18px; }
    .card {
      max-width: 640px; background: #fff; border: 1px solid #e4e6ef;
      border-radius: 16px; padding: 28px;
    }
    h2 { font-size: 20px; margin: 0 0 18px; color: #0f1226; }
    label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 18px; }
    label:last-child, .row:last-child label { margin-bottom: 0; }
    input {
      display: block; width: 100%; box-sizing: border-box; margin-top: 7px;
      padding: 13px 14px; border: 1px solid #e4e6ef; border-radius: 10px;
      font: inherit; font-weight: 400; background: #f6f7fb; color: #4a4f6e;
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
    @media (max-width: 640px) { .row { grid-template-columns: 1fr; } }
  `,
})
export class ConfiguracionComponent {
  readonly auth = inject(AuthService);

  readonly rol = computed(() =>
    this.auth.esAnalista() ? 'Analista' : this.auth.esObservador() ? 'Observador' : 'Usuario',
  );
}
