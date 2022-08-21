import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as GlobalVariables from '../globalVariables';

@Injectable()
export class CommunicationService {
    private subject = new Subject<any>();

    constructor() {
    }

    initializeApp(): void {
        this.subject.next({ notifyComponent: 'app', action: 'initialize' });
    }

    showLoading(showStatus: boolean): void {
        this.subject.next({ notifyComponent: 'app-loading', show: showStatus });
    }

    openSideBar(): void {
        this.subject.next({ notifyComponent: 'app', action: 'openSideBar' });
    }

    closeSideBar(): void {
        this.subject.next({ notifyComponent: 'app', action: 'closeSideBar' });
    }

    public notifyComponent(component, action, data = null): void {
        this.subject.next({ notifyComponent: 'app-table', action: action, data: data });
    }

    getData(): Observable<any> {
        return this.subject.asObservable();
    }

    showError(statusCode: number): void {
        this.subject.next({ notifyComponent: 'app-error-page', statusCode: statusCode });
    }

    closeForm(): void {
        this.subject.next({ notifyComponent: 'app-table', action: 'closeForm' });
    }

    refreshMovies(): void {
        this.subject.next({ notifyComponent: 'app-top-bar', action: 'refreshMoviesArray' });
    }

    showAlert(alert: string): void {
        this.subject.next({ notifyComponent: 'app-error-page', alert: alert });
    }

    showPopupWithCallback(title: string, type: string, showClose = false, subTitle: string = null, showForm = false, form: any = null): void {
        this.subject.next({
            notifyComponent: 'app-error-page', action: 'callback', title: title, type: type,
            subTitle: subTitle, showForm: showForm, form: form, showClose: showClose
        });
    }

    showCallbackFunction(type: string, formData: any = null): void {
        this.subject.next({ notifyComponent: 'app-table', action: 'callback', type: type, formData: formData });
    }

    showCallbackFunctionKPI(type: string, formData: any = null): void {
        this.subject.next({ notifyComponent: 'app-dashboard', action: 'callback', type: type, formData: formData });
    }

    showCallbackFunctionPageview(type: string, formData: any = null): void {
        this.subject.next({ notifyComponent: 'app-pageview', action: 'callback', type: type, formData: formData });
    }

    showCallbackFunctionBookTickets(type: string, formData: any = null): void {
        this.subject.next({ notifyComponent: 'app-book-ticket', action: 'callback', type: type, formData: formData });
    }

    showToast(message: string): void {
        this.subject.next({ notifyComponent: 'toast', message: message });
    }

    getThemeConstants(): any {
        return { 'theme': GlobalVariables.Theme };
    }
}
