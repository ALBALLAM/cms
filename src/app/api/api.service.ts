import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import * as GlobalVariables from '../globalVariables';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

import { httpRequestTypes } from './api.config';

@Injectable()
export class ApiService {

    constructor(private _http: HttpClient) {
    }

    sendApi(type: string, query: string, params, withAuthorisation: boolean, urlEncoded: boolean, additionalHeaders = null, isExportExcel = false, multipartData = false): Observable<any> {
        if (httpRequestTypes.indexOf(type) > -1 && query !== '') {

            const headers = this._prepareHeaders(withAuthorisation, urlEncoded, additionalHeaders, isExportExcel, multipartData);

            switch (type) {
                case 'get':
                    if (isExportExcel) {
                        console.log('GloablVariables.url', GlobalVariables.URL, 'and', query)
                        return this._http.get(GlobalVariables.URL + query, { headers: headers, observe: 'response', responseType: 'blob' })
                            .map((response: any) => <any>response)
                            .catch(this.handleError);
                    } else {
                        return this._http.get(GlobalVariables.URL + query, { headers: headers })
                            .map((response: any) => <any>response)
                            .catch(this.handleError);
                    }
                case 'put':
                    let reqParams2;
                    if (urlEncoded) {
                        let httpParams = new HttpParams();
                        Object.keys(params).forEach(function (key) {
                            if (typeof (params[key]) === 'object') {
                                if (params[key] instanceof Array) {
                                    for (let item of params[key]) {
                                        httpParams = httpParams.append(key + '[]', item);
                                    }
                                }
                            } else {
                                httpParams = httpParams.append(key, params[key]);
                            }

                        });
                        reqParams2 = httpParams.toString();
                    } else {
                        reqParams2 = params;
                    }
                    return this._http.put(GlobalVariables.URL + query, reqParams2, { headers: headers })
                        .map((response: any) => <any>response)
                        .catch(this.handleError);
                case 'post':
                    let reqParams;
                    if (urlEncoded) {
                        let httpParams = new HttpParams();
                        Object.keys(params).forEach(function (key) {
                            if (typeof (params[key]) === 'object') {
                                for (let item of params[key]) {
                                    httpParams = httpParams.append(key + '[]', item);
                                }
                            } else {
                                httpParams = httpParams.append(key, params[key]);
                            }

                        });
                        reqParams = httpParams.toString();
                    } else {
                        reqParams = params;
                    }
                    return this._http.post(GlobalVariables.URL + query, reqParams, { headers: headers })
                        .map((response: any) => <any>response)
                        .catch(this.handleError);
                case 'delete':
                    return this._http.delete(GlobalVariables.URL + query, { headers: headers })
                        .map((response: any) => <any>response)
                        .catch(this.handleError);
            }
        }
    }

    // authenticate(params): Observable<any> {
    //     const body = 'username=' + params.email + '&password=' + params.password + '&grant_type=' + params.grant_type;
    //     const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    //     return this._http.post(GlobalVariables.URL + '/user/login', body, {headers: headers})
    //         .map((response: any) => <any> response)
    //         .catch(this.handleError);
    // }

    authenticate(params): Observable<any> {
        const body = 'email=' + params.username + '&passcode=' + params.password + '&loginType=cms';
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        return this._http.post(GlobalVariables.URL + '/authentication/authenticate', body, { headers: headers })
            .map((response: any) => <any>response.data.result)
            .catch(this.handleError);
    }

    private _prepareHeaders(withAuthorisation, urlEncoded, additionalHeaders, isExportExcel = false, multipartData = false): HttpHeaders {
        let headersParams = {
            'accept-language': 'en'
        };

        if (urlEncoded) {
            headersParams['Content-Type'] = 'application/x-www-form-urlencoded';
        }
        else if (isExportExcel) {
            headersParams['Content-Type'] = 'application/octet-stream';
            headersParams['responseType'] = 'blob';
        }
        else {
            headersParams['Content-Type'] = 'application/json';
        }
        if (multipartData) {
            delete headersParams['Content-Type'];
            // headersParams['Cache-Control'] = 'no-cache';
            // headersParams['Connection'] = 'keep-alive';
        }
        if (withAuthorisation) {
            const tokenInfo = JSON.parse(localStorage.getItem('token'));
            headersParams['Authorization'] = tokenInfo && 'access_token' in tokenInfo ? tokenInfo.access_token : '';
        }

        for (const item in additionalHeaders) {
            headersParams[item] = additionalHeaders[item];
        }
        return new HttpHeaders(headersParams);
    }

    private handleError(error) {
        const objectError = {
            status: error.status,
            data: error
        };

        return Observable.throw(objectError);
    }
}
