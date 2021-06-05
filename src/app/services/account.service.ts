import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User| null>;
  public user: Observable<User| null>;
  constructor(private router: Router, private http: HttpClient){
    this.userSubject = new BehaviorSubject<User| null>  (JSON.parse(localStorage.getItem('user') || '{}'));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User | null{
    return this.userSubject.value;
}

  logout(): void {
    // remove user from local storage and set current user to null
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
}


  login(username: string, password: string): Observable<User>{
  return this.http.post<User>(`${environment.apiUrl}/users/authenticate`, { username, password })
      .pipe(map(user => {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('user', JSON.stringify(user));
          this.userSubject.next(user);
          return user;
      }));
}


register(user: User): Observable<object> {
  return this.http.post(`${environment.apiUrl}/users/register`, user);
}

getAll(): Observable<object> {
  return this.http.get<User[]>(`${environment.apiUrl}/users`);
}

getById(id: string): Observable<object> {
  return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
}

update(id: string, params: object): Observable<object> {
  return this.http.put(`${environment.apiUrl}/users/${id}`, params)
      .pipe(map(x => {
          // update stored user if the logged in user updated their own record
          if (id === this.userValue?.id) {
              // update local storage
              const user = { ...this.userValue, ...params };
              localStorage.setItem('user', JSON.stringify(user));

              // publish updated user to subscribers
              this.userSubject.next(user);
          }
          return x;
      }));
}

delete(id: string): Observable<object> {
  return this.http.delete(`${environment.apiUrl}/users/${id}`)
      .pipe(map(x => {
          // auto logout if the logged in user deleted their own record
          if (id === this.userValue?.id) {
              this.logout();
          }
          return x;
      }));
}
}
