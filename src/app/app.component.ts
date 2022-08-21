import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommunicationService} from './communication/communication.service';
import {Subscription} from 'rxjs';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {PageViewComponent} from './pageview/pageview.component';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'app';
    hasTopbar: boolean = true;
    subscription: Subscription;
    subscriptionData: any;
    showLoading: boolean = false;
    openedSideBar: boolean = false;
    showSideBar: boolean = false;
    sectionsWithoutTopbar: any = ['/sign-in', '/reset'];
    menuItems: any;
    appError: number;
    appAlert: string;
    type: string;
    alertSubtitle: string;
    alertShowForm: boolean;
    alertShowClose: boolean;
    alertForm: string;
    alertWithCallback: string;
    side_menus_links: any;
    sectionWithAuthentication = false;
    screenWidth: number;

    constructor(private _communicationService: CommunicationService, private _router: Router, private _cdr: ChangeDetectorRef) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
        this.screenWidth = window.innerWidth;
        window.onresize = () => {
            // set screenWidth on screen size change
            this.screenWidth = window.innerWidth;
            if (this.showSideBar) {
                this.openedSideBar = this.screenWidth > 820 && this._router.url !== '/sign-in';
            }
        };
    }

    ngOnInit() {
        this.openedSideBar = false;
        this.initializeApp();
        this.screenWidth = window.innerWidth;
        if (this.showSideBar) {
            this.openedSideBar = this.screenWidth > 820 && this._router.url !== '/sign-in';
        }
    }

    initializeApp() {
        if (sessionStorage.getItem('side-menu-params-links')) {
            let side_menus = JSON.parse(sessionStorage.getItem('side-menu-params-links'));
            for (let section in side_menus) {
                const routing = this._router.config;
                let skip = false;
                for (const route of routing) {
                    if (route.path === section) {
                        skip = true;
                        break;
                    }
                }
                if (!skip) {
                    this._router.config.push({path: section, component: PageViewComponent});
                }
            }
        }

        this._router.events.subscribe((val) => {
            if (val instanceof NavigationStart) {
                let previousUrl = this._router.url;
                let nextUrl = val.url;
                let urlSplit = previousUrl.split('/');
                let urlNextSplit = nextUrl.split('/');
                if (urlSplit && urlSplit[1] && urlNextSplit && urlNextSplit[1]) {
                    if (JSON.parse(sessionStorage.getItem('side-menu-params'))) {
                        let menuItems = JSON.parse(sessionStorage.getItem('side-menu-params'));
                        let params = {};
                        for (let menuItem of menuItems) {
                            if (menuItem.state == urlNextSplit[1] && menuItem.type == 'link') {
                                params = {
                                    state: menuItem.state,
                                    url: menuItem.state,
                                    previousUrl: '/' + urlSplit[1]
                                };
                                break;
                            } else if (menuItem.type == 'sub') {
                                for (let subMenuItem of menuItem.children) {
                                    if ((menuItem.state == '' && subMenuItem.state == urlNextSplit[1]) || (menuItem.state == urlNextSplit[1] && urlNextSplit[2] && subMenuItem.state == urlNextSplit[2])) {
                                        params = {
                                            state: menuItem.state,
                                            chilstate: subMenuItem.state,
                                            url: menuItem.state != '' ? menuItem.state + '/' + subMenuItem.state : subMenuItem.state,
                                            previousUrl: '/' + urlSplit[1]
                                        };
                                        break;
                                    }
                                }
                            }
                        }
                        if (Object.keys(params).length > 0) {
                            let routingParams: any = sessionStorage.getItem('routing-params');
                            routingParams = JSON.parse(routingParams);
                            if (routingParams['id']) {
                                params['id'] = routingParams['id'];
                            }
                            sessionStorage.setItem('routing-params', JSON.stringify(params));
                        } else {
                            // this._router.navigate([this._router.url]);
                        }
                    } else {
                        this._router.navigate(['/sign-in']);
                    }
                }
            }
            if (val instanceof NavigationEnd) {
                let url = this._router.url;
                let urlSplit = url.split('/');
                if (urlSplit && urlSplit[1]) {
                    const section = '/' + urlSplit[1];
                    this.checkTokenValidation(section);
                    this.checkHasTopbar(section);
                    if (!sessionStorage.getItem('side-menu-params')) {
                        this._router.navigate(['/sign-in']);
                    }
                    // this._selectMenu(section);
                } else if (url == '/') {
                    this._router.navigate(['/sign-in']);
                }
            }
            if (this.screenWidth < 820) {
                this.openedSideBar = false;
            }
        });
    }

    checkHasTopbar(section): void {
        this.menuItems = JSON.parse(sessionStorage.getItem('side-menu-params'));
        const sections = JSON.parse(sessionStorage.getItem('side-menu-params-links'));
        if (sections && Object.keys(sections).length > 1) {
            if (this.sectionsWithoutTopbar.indexOf(section) > -1) {
                this.hasTopbar = false;
                this.openedSideBar = false;
                this.showSideBar = false;
            } else {
                this.hasTopbar = true;
                this.openedSideBar = true;
                this.showSideBar = true;
            }
        } else {
            this.openedSideBar = false;
            this.showSideBar = false;
            this.hasTopbar = this.sectionsWithoutTopbar.indexOf(section) === -1;
        }
        this._cdr.detectChanges();
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData && typeof (this.subscriptionData)) {
                if (this.subscriptionData['notifyComponent'] === 'app' && this.subscriptionData['action'] === 'initialize') {
                    this.initializeApp();
                }
            }
            if (this.subscriptionData['notifyComponent'] == 'app-loading') {
                this.showLoading = this.subscriptionData['show'];
            }
        }
        if (this.subscriptionData['notifyComponent'] === 'app-error-page') {
            if (this.subscriptionData['statusCode']) {
                this.appError = this.subscriptionData['statusCode'] ? this.subscriptionData['statusCode'] : 0;
            }
            if (this.subscriptionData['alert']) {
                this.appAlert = null;
                this.appAlert = this.subscriptionData['alert'];
            }
            if (this.subscriptionData['action'] && this.subscriptionData['action'] == 'callback') {
                this.alertWithCallback = null;
                this.alertWithCallback = this.subscriptionData['title'];
                this.type = this.subscriptionData['type'];
                this.alertSubtitle = this.subscriptionData['subTitle'];
                this.alertShowForm = this.subscriptionData['showForm'];
                this.alertForm = this.subscriptionData['form'];
                this.alertShowClose = this.subscriptionData['showClose'];
            }
        }
        if (this.subscriptionData['notifyComponent'] === 'app' && this.subscriptionData['action'] === 'openSideBar') {
            this._toggleSidebar();
        }
        if (this.subscriptionData['notifyComponent'] === 'app' && this.subscriptionData['action'] === 'closeSideBar') {
            this.openedSideBar = false;
        }
    }

    private _toggleSidebar() {
        this.openedSideBar = !this.openedSideBar;
    }

    onNotify(event): void {
        if (event && typeof (event) === 'object') {
            switch (event.component) {
                case 'top-bar':
                    if (event.action === 'openSideBar')
                        this._toggleSidebar();
                    break;
                case 'sidebar':
                    if (event.action === 'close')
                        this._toggleSidebar();
                    break;
                case 'app-error-page':
                    if (event.action === 'resetAppError') {
                        this.appError = null;
                        this._cdr.detectChanges();
                    }
                    if (event.action === 'emptyAlert') {
                        this.appAlert = null;
                        this.alertWithCallback = null;
                        this.alertShowForm = false;
                        this.alertForm = null;
                        this.alertShowClose = false;
                        this._cdr.detectChanges();
                    }
                    break;
            }
        } else if (event == 'closeSideBar') {
            this._toggleSidebar();
        }
    }

    private checkTokenValidation(section): void {
        if (section !== '/sign-in') {
            if (!localStorage.getItem('token') || localStorage.getItem('token') == null) {
                this.sectionWithAuthentication = false;
                this._router.navigate(['/sign-in']);
            } else {
                this.sectionWithAuthentication = true;
            }
        } else {
            this.sectionWithAuthentication = false;
        }
    }
}
