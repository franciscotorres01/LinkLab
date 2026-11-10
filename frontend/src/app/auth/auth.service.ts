import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'enlace-realm',
    clientId: 'enlace-frontend',
  });

  readonly autenticado = signal(false);
  readonly nombre = signal('');
  readonly roles = signal<string[]>([]);
  readonly esAnalista = computed(() => this.roles().includes('analista'));
  readonly esObservador = computed(() => this.roles().includes('observador'));

  async init(): Promise<void> {
    const ok = await this.keycloak.init({
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
    this.autenticado.set(ok);
    if (ok) {
      const t = this.keycloak.tokenParsed as any;
      this.nombre.set(t?.preferred_username ?? '');
      this.roles.set(t?.realm_access?.roles ?? []);
    }
  }

  login(redirectUri?: string) {
    return this.keycloak.login({ redirectUri: redirectUri ?? window.location.href });
  }

  registrar() {
    return this.keycloak.register({ redirectUri: window.location.origin });
  }

  logout() {
    return this.keycloak.logout({ redirectUri: window.location.origin + '/laboratorio' });
  }

  async tokenVigente(): Promise<string | undefined> {
    if (!this.keycloak.authenticated) return undefined;
    try {
      await this.keycloak.updateToken(30);
    } catch {
      this.login();
      return undefined;
    }
    return this.keycloak.token;
  }
}
