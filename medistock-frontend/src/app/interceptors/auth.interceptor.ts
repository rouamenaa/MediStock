

import { Inject, Injectable } from '@angular/core';


import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(@Inject(KeycloakService) private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return from(this.keycloak.getToken()).pipe(
      switchMap(token => {

        const cloned = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

        return next.handle(cloned);
      })
    );
  }
}