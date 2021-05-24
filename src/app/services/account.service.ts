import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User| null>;

  constructor(private router: Router){
    this.userSubject = new BehaviorSubject<User| null>  (JSON.parse(localStorage.getItem('user') || '{}'));
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
}
