import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'laboratorio', pathMatch: 'full' },
  {
    path: 'laboratorio',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    children: [
      { path: '', redirectTo: 'vista-general', pathMatch: 'full' },
      {
        path: 'vista-general',
        loadComponent: () => import('./laboratorio/laboratorio').then(m => m.Laboratorio),
      },
      {
        path: 'escenarios',
        data: { titulo: 'Escenarios' },
        loadComponent: () =>
          import('./laboratorio/escenarios.component').then(m => m.EscenariosComponent),
      },
      {
        path: 'simulaciones',
        data: { titulo: 'Simulaciones' },
        loadComponent: () =>
          import('./simulacion/simulacion.component').then(m => m.SimulacionComponent),
      },
      {
        path: 'comparar',
        data: { titulo: 'Comparar' },
        loadComponent: () =>
          import('./laboratorio/comparar.component').then(m => m.CompararComponent),
      },
      {
        path: 'historial',
        data: { titulo: 'Historial' },
        loadComponent: () =>
          import('./laboratorio/historial.component').then(m => m.HistorialComponent),
      },
      {
        path: 'configuracion',
        data: { titulo: 'Configuración' },
        loadComponent: () =>
          import('./laboratorio/configuracion.component').then(m => m.ConfiguracionComponent),
      },
    ],
  },
  {
    path: 'simulador',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./simulacion/simulacion.component').then(m => m.SimulacionComponent),
  },
  { path: '**', redirectTo: 'laboratorio' },
];
