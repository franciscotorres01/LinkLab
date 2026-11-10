import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

const URLS_API = ['http://localhost:8082'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!URLS_API.some(u => req.url.startsWith(u))) return next(req);

  const auth = inject(AuthService);
  return from(auth.tokenVigente()).pipe(
    switchMap(token =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)
    )
  );
};
