import {Injectable} from '@angular/core';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';
import {Routes} from "./pageview.config";

@Injectable()
export class AuthGuard implements CanActivate {
    routes = Routes;

    constructor(private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;
        let urlSplit = url.split('/');
        if (urlSplit && urlSplit[1]) {
            const section = urlSplit[1];
            if (this.routes[section] || this.routes[section] == '') {
                if (typeof(this.routes[section]) == 'object') {
                    if (urlSplit[2]) {
                        const subsection = urlSplit[2];
                        if (this.routes[section].indexOf(subsection) > -1) {
                            return true;
                        } else {
                            this._router.navigate(['/sign-in']);
                            return false;
                        }
                    }

                } else if (typeof(this.routes[section]) == 'string') {
                    return true;
                }
            } else {
                this._router.navigate(['/sign-in']);
            }
        } else if (url == '/') {
            this._router.navigate(['/sign-in']);
        }
    }
}
