import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:8080/auth';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  register(user: any) {
    return this.http.post(`${this.api}/register`, user);
  }

  login(user: any) {
    return this.http.post<string>(`${this.api}/login`, user);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}