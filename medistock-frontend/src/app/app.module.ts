import { NgModule, APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PharmacystockModule } from './features/pharmacystock/pharmacystock.module';
import { LayoutComponent } from "./core/layout/layout.component";
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserComponent } from './components/user/user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// ✅ Keycloak
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

// ✅ FIX SSR
function initializeKeycloak(
  keycloak: KeycloakService,
  platformId: Object
) {
  return () => {
    // 🔥 IMPORTANT : empêcher execution côté serveur
    if (!isPlatformBrowser(platformId)) {
      return Promise.resolve();
    }

    return keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'medistock',
        clientId: 'medistock-client',
      },
      initOptions: {
        onLoad: 'check-sso', checkLoginIframe: false,
        pkceMethod: 'S256'
      }
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PharmacystockModule,
    LayoutComponent,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    KeycloakAngularModule
  ],
  providers: [
    provideClientHydration(), // tu peux garder ou supprimer

    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, PLATFORM_ID] // 🔥 IMPORTANT
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }