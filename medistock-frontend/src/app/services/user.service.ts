import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = 'http://localhost:8090/users';

  constructor(private http: HttpClient) {}

  syncUser() {
    return this.http.post(`${this.api}/sync`, {});
  }

  getMe() {
    return this.http.get(`${this.api}/me`);
  }
}
