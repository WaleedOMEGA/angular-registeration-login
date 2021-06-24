import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
  users: any;

    constructor(private accountService: AccountService) {}

    ngOnInit(): void {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }

    deleteUser(id: string): void {
        const user = this.users.find((x: { id: string; }) => x.id === id);
        user.isDeleting = true;
        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => this.users = this.users.filter((x: { id: string; }) => x.id !== id));
    }
}
