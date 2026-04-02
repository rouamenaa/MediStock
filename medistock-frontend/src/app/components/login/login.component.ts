
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  template: '<p>Redirecting to login...</p>'
})
export class LoginComponent implements OnInit {


  constructor(
    @Inject(KeycloakService) private keycloak: KeycloakService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return; 
    await this.keycloak.login({
      redirectUri: window.location.origin
    });
  }
}