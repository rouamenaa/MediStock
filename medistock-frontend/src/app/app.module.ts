import { NgModule, APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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


import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { OrderListComponent } from './features/order/order-list/order-list.component';
import { OrderFormComponent } from './features/order/order-form/order-form.component';
import { PrescriptionListComponent } from './features/prescription/prescription-list/prescription-list.component';
import { PrescriptionFormComponent } from './features/prescription/prescription-form/prescription-form.component';

// INIT KEYCLOAK
function initializeKeycloak(
  keycloak: KeycloakService,
  platformId: Object
) {
  return () => {
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

    // Orders
    OrderListComponent,
    OrderFormComponent,

    // Prescriptions
    PrescriptionListComponent,
    PrescriptionFormComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PharmacystockModule,
    LayoutComponent,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    KeycloakAngularModule
  ],
  providers: [
    provideClientHydration(),
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