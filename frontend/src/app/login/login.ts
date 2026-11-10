import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (this.auth.autenticado()) {
      this.router.navigate(['/laboratorio']);
    }
  }

  entrar() {
    this.auth.login(window.location.origin + '/laboratorio');
  }

  registrarse() {
    this.auth.registrar();
  }
}
