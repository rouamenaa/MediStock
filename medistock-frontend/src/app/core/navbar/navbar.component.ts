import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  isDark = true;
  showMenu = false;
  userProfile: any;

  constructor(
    @Inject(KeycloakService) private keycloak: KeycloakService,  // ← @Inject
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const loggedIn = await this.keycloak.isLoggedIn();
    if (loggedIn) {
      this.userProfile = await this.keycloak.loadUserProfile();
    }
  }

  toggleMenu() { this.showMenu = !this.showMenu; }

  async logout() {
    await this.keycloak.logout(window.location.origin);
  }

  toggleSidebar() {}

  toggleTheme() {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode', this.isDark);
    document.body.classList.toggle('light-mode', !this.isDark);
  }
}