
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { isPlatformBrowser } from '@angular/common';

import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-navbar',
  standalone: true,

  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {

  isDark = true;
  showMenu = false;
  userProfile: any;


  constructor(private keycloak: KeycloakService, @Inject(PLATFORM_ID) private platformId: Object) { }

  async ngOnInit() {

    // ❌ SSR → skip
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // ✅ attendre que keycloak soit prêt
    const loggedIn = await this.keycloak.isLoggedIn();

    if (loggedIn) {
      this.userProfile = await this.keycloak.loadUserProfile();
    }
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  async logout() {
    await this.keycloak.logout(window.location.origin);
  }

  toggleSidebar() { }

  toggleTheme() {
    this.isDark = !this.isDark;

    if (this.isDark) {

      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

}