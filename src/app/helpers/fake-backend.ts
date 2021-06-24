import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
const usersKey = 'omega-backend';


let users = JSON.parse(localStorage.getItem(usersKey) || '[]');

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return handleRoute();

        function handleRoute(): any {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users/register') && method === 'POST':
                    return register();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/users\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/users\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions

        function authenticate(): any {
            const { username, password } = body;
            const user = users.find((x: { username: any; password: any; }) => x.username === username && x.password === password);
            if (!user) { return error('Username or password is incorrect'); }
            return ok({
                ...basicDetails(user),
                token: 'fake-jwt-token'
            });
        }

        function register(): any {
            const user = body;

            if (users.find((x: { username: any; }) => x.username === user.username)) {
                return error('Username "' + user.username + '" is already taken');
            }

            user.id = users.length ? Math.max(...users.map((x: { id: any; }) => x.id)) + 1 : 1;
            users.push(user);
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        function getUsers(): any {
            if (!isLoggedIn()) { return unauthorized(); }
            return ok(users.map((x: any) => basicDetails(x)));
        }

        function getUserById(): any {
            if (!isLoggedIn()) { return unauthorized(); }

            const user = users.find((x: { id: number; }) => x.id === idFromUrl());
            return ok(basicDetails(user));
        }

        function updateUser(): any {
            if (!isLoggedIn()) { return unauthorized(); }

            const params = body;
            const user = users.find((x: { id: number; }) => x.id === idFromUrl());

            // only update password if entered
            if (!params.password) {
                delete params.password;
            }

            // update and save user
            Object.assign(user, params);
            localStorage.setItem(usersKey, JSON.stringify(users));

            return ok();
        }

        function deleteUser(): any {
            if (!isLoggedIn()) { return unauthorized(); }

            users = users.filter((x: { id: number; }) => x.id !== idFromUrl());
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        // helper functions

        function ok(Body?: { token?: string; id: any; username: any; firstName: any; lastName: any; } | undefined): any {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message: string): any {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize());
                // call materialize and dematerialize to ensure delay even
                // if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function unauthorized(): any {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(user: { id: any; username: any; firstName: any; lastName: any; }): any {
            const { id, username, firstName, lastName } = user;
            return { id, username, firstName, lastName };
        }

        function isLoggedIn(): any {
            return headers.get('Authorization') === 'Bearer fake-jwt-token';
        }

        function idFromUrl(): any {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1], 10);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
