import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'laboratorio', pathMatch: 'full' },
  {
    path: 'laboratorio',
    canActivate: [authGuard],
    loadComponent: () => import('./laboratorio/laboratorio').then(m => m.Laboratorio),
  },
  { path: '**', redirectTo: 'laboratorio' },
];
