import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  auth = inject(AuthService);
  private router = inject(Router);

  menu: ItemMenu[] = [
    { ruta: 'vista-general', etiqueta: 'Vista general', icono: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z' },
    { ruta: 'escenarios', etiqueta: 'Escenarios', icono: 'M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5 M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5' },
    { ruta: 'simulaciones', etiqueta: 'Simulaciones', icono: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { ruta: 'comparar', etiqueta: 'Comparar', icono: 'M17 3l4 4-4 4 M3 7h18 M7 21l-4-4 4-4 M21 17H3' },
    { ruta: 'historial', etiqueta: 'Historial', icono: 'M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5 M12 7v5l4 2' },
  ];
  iconoConfig = 'M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6';

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  seccion = computed(() => {
    const u = this.url();
    if (u.includes('configuracion')) return 'Configuración';
    return this.menu.find(m => u.includes(m.ruta))?.etiqueta ?? 'Vista general';
  });

  rol = computed(() =>
    this.auth.esAnalista() ? 'Analista' : this.auth.esObservador() ? 'Observador' : 'Usuario',
  );

  iniciales = computed(
    () =>
      this.auth
        .nombreCompleto()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0].toUpperCase())
        .join('') || '?',
  );
}
