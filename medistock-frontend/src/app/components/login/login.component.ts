import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  template: '<p>Redirecting to login...</p>'
})
export class LoginComponent implements OnInit {

  constructor(private keycloak: KeycloakService) {}

  async ngOnInit() {
    await this.keycloak.login();
  }

}