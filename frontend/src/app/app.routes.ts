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
        loadComponent: () => import('./laboratorio/pendiente').then(m => m.Pendiente),
      },
      {
        path: 'simulaciones',
        data: { titulo: 'Simulaciones' },
        loadComponent: () => import('./laboratorio/pendiente').then(m => m.Pendiente),
      },
      {
        path: 'comparar',
        data: { titulo: 'Comparar' },
        loadComponent: () => import('./laboratorio/pendiente').then(m => m.Pendiente),
      },
      {
        path: 'historial',
        data: { titulo: 'Historial' },
        loadComponent: () => import('./laboratorio/pendiente').then(m => m.Pendiente),
      },
      {
        path: 'configuracion',
        data: { titulo: 'Configuración' },
        loadComponent: () => import('./laboratorio/pendiente').then(m => m.Pendiente),
      },
    ],
  },
  { path: '**', redirectTo: 'laboratorio' },
  {
    path: 'simulador',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./simulacion/simulacion.component').then(m => m.SimulacionComponent),
  },
];
