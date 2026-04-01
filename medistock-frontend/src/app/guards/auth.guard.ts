import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private keycloak: KeycloakService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async canActivate(): Promise<boolean> {

    // ✅ SSR → skip auth
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    // ✅ Browser
    const isLoggedIn = await this.keycloak.isLoggedIn();

    if (!isLoggedIn) {
      await this.keycloak.login({
        redirectUri: window.location.origin
      });
      return false;
    }

    return true;
  }
}