import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'madistock-frontend';

  constructor(
    private keycloak: KeycloakService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    const loggedIn = await this.keycloak.isLoggedIn();

    if (loggedIn) {

      // 🔥 Step 1: sync user
      this.userService.syncUser().subscribe({
        next: () => {

          // 🔥 Step 2: get user info (role)
          this.userService.getMe().subscribe((user: any) => {
            console.log("USER:", user);

            localStorage.setItem("role", user.role);
          });

        },
        error: err => console.error(err)
      });

    }
  }
}
