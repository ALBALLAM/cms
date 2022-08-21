import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {IRefreshTokenParams} from './refresh-token.interface';
import {ApiService} from "../../api/api.service";

@Injectable({
    providedIn: 'root'
})
export class RefreshTokenService {

    constructor(private _apiService: ApiService) {
    }

    public refreshToken() {
        return new Observable(observable => {
            let apiResponse;
            const token = JSON.parse(localStorage.getItem('token'));
            const params: IRefreshTokenParams = {
                refresh_token: token.refresh_token
            };
            let url = '/authentication/refreshToken';
            this._apiService.sendApi('post', url,
                params, false, true,
                {Authorization: token.refresh_token_header})
                .subscribe(response => {
                        apiResponse = response.data.result;
                    },
                    error => {
                        observable.error(error);
                    },
                    () => {
                        const oldToken = JSON.parse(localStorage.getItem('token'));
                        const token = {
                            access_token: apiResponse.access_token,
                            expires_in: apiResponse.expires_in,
                            refresh_token: apiResponse.refresh_token,
                            refresh_token_header: oldToken.refresh_token_header
                        };
                        localStorage.removeItem('token');
                        localStorage.setItem('token', JSON.stringify(token));
                        observable.next(token.access_token);
                        observable.complete();
                    }
                );
        });
    }
}
