import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {

  constructor(
    private router: Router,
    private accountService: AccountService
) {
    // redirect to home if already logged in
    if (this.accountService.userValue) {
        this.router.navigate(['/']);
    }
}

}
