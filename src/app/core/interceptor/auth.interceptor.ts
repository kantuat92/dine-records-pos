import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { UserManagementAPIService } from '../service/api-services/user-management-api.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private userManagementService: UserManagementAPIService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isRefreshRequest = req.url.includes('/auth/refresh');
        let cloned;
        const token = this.userManagementService.getAccessToken();
        if (token && !isRefreshRequest) {
            cloned = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('JWT has been set in Auth interceptor for URL: ', req.url);
        }

        return next.handle(cloned ? cloned : req).pipe(
            catchError(err => {
                if (err.status === 401 && !isRefreshRequest) {
                    console.log('Received 401 for URL: ', req.url);
                    console.log('Refreshing the access token');
                    return this.userManagementService.refreshToken().pipe(
                        switchMap(() => {
                            const newToken = this.userManagementService.getAccessToken();
                            const newReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${newToken}` }
                            });
                            return next.handle(newReq);
                        })
                    );
                }
                return throwError(() => err);
            })
        );
    }
}
