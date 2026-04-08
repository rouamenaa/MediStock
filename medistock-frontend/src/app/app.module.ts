

import { RouterModule, Routes } from '@angular/router';

import { NgModule, APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';  // ← supprimer provideClientHydration
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// ❌ supprimer : import { PharmacystockModule } from './features/pharmacystock/pharmacystock.module';
import { LayoutComponent } from "./core/layout/layout.component";


import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserComponent } from './components/user/user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './interceptors/auth.interceptor';


import { NavbarComponent } from './core/navbar/navbar.component';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';


function initializeKeycloak(keycloak: KeycloakService, platformId: Object) {
  return () => {
    if (!isPlatformBrowser(platformId)) return Promise.resolve();
    return keycloak.init({
      config: {
        url: 'http://localhost:8080',
        realm: 'medistock',
        clientId: 'medistock-client',
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
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
    UserComponent,
    LayoutComponent,
    NavbarComponent,
    SidebarComponent,
  ],
 imports: [
  BrowserModule,
  CommonModule,
  BrowserAnimationsModule,
  AppRoutingModule,
  ReactiveFormsModule,
  FormsModule,
  HttpClientModule,
  KeycloakAngularModule,  
],
  providers: [
    {
      provide: APP_INITIALIZER,
      
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, PLATFORM_ID]
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