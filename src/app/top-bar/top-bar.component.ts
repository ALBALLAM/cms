import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {NavigationStart, Router} from '@angular/router';
import {MatDialog} from '@angular/material';
import {CommunicationService} from '../communication/communication.service';
import {ChangePasswordComponent} from '../change-password/change-password.component';
import {ApiService} from '../api/api.service';
import {Subscription} from "rxjs/index";

@Component({
    selector: 'app-top-bar',
    templateUrl: './top-bar.component.html',
    styleUrls: ['./top-bar.component.scss'],
})
export class TopBarComponent implements OnInit {
    @Input() showToggle: boolean;
    @Input() showIcon: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    response: any;
    moviesArray: any = [];
    apiLoading = {
        logout: false
    };
    subscription: Subscription;
    subscriptionData: any;
    fullname: string;
    email: string;

    constructor(private _communicationService: CommunicationService, private _apiService: ApiService, private _router: Router, private _dialog: MatDialog) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
    }

    ngOnInit() {
        this.fullname = localStorage.getItem('fullname');
        this.email = localStorage.getItem('email');
        this.refreshMoviesArray();
    }

    // @HostListener('window:beforeunload', ['$event'])
    // unloadNotification($event: any) {
    //     if (this.moviesArray.length > 0) {
    //         $event.returnValue = true;
    //     }
    // }

    refreshMoviesArray() {
        if (sessionStorage.getItem('moviesArray')) {
            this.moviesArray = JSON.parse(sessionStorage.getItem('moviesArray'));
        }
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData['notifyComponent'] == 'app-top-bar' && this.subscriptionData['action'] === 'refreshMoviesArray') {
                this.refreshMoviesArray();
            }
        }
    }

    logout(): void {
        // this._router.navigate(['/sign-in']);
        if (!this.apiLoading.logout) {
            this.apiLoading.logout = true;
            this._communicationService.showLoading(true);
            this._apiService.sendApi('put', '/authentication/logout', '', true, true)
                .subscribe(data => this.response = data,
                    (err) => {
                        this.logoutCallback();
                    }, () => {
                        this.logoutCallback();
                    });
        }
    }


    logoutCallback(): void {
        this.apiLoading.logout = false;
        this._communicationService.showLoading(false);
        localStorage.removeItem('token');
        sessionStorage.removeItem('moviesArray');
        this._router.navigate(['/sign-in']);
    }

    changePassword(): void {
        this._dialog.open(ChangePasswordComponent);
    }

    openSideBar(): void {
        this._communicationService.openSideBar();
    }
}
