import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../api/api.service';

@Injectable({
    providedIn: 'root'
})
export class SignInService {

    constructor(private _apiService: ApiService) {
    }

    public getSideMenu() {
        return new Observable(observable => {
            let apiResponse;
            this._apiService.sendApi('get', '/profile/sideMenu',
                {}, true, false)
                .subscribe(response => (apiResponse = response),
                    error => {
                        observable.error(error);
                    },
                    () => {
                        observable.next(apiResponse);
                        observable.complete();
                    }
                );
        });
    }
}