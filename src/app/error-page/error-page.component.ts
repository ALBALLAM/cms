import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../communication/communication.service';
import { Validation } from '../Validations';

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.css']
})
export class ErrorPageComponent implements OnInit, OnChanges {
    @Input() error: number;
    @Input() alert: string;
    @Input() alertWithCallback: string;
    @Input() type: string;
    @Input() subtitle: string;
    @Input() showForm: string;
    @Input() form: any;
    @Input() formData: any;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    show: boolean = false;
    title: string;
    @Input() showCloseButton: boolean;
    popupButtons: any;
    extraInfo: any;
    fieldsOrder: any = [];
    dataLists: any = [];
    validation = Validation;
    formFields: any = [];

    constructor(private _router: Router, private _communicationService: CommunicationService) {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.extraInfo = undefined;
        if (this.error != null) {
            this._showPopup(this.error);
        }
        if (this.alert != null) {
            this._showAlert(this.alert);
        }
        if (this.alertWithCallback != null) {
            if (this.showForm) {
                this._showPopupWithCallbackWithForm(this.alertWithCallback, this.subtitle, this.form);
            } else {
                this._showPopupWithCallback(this.alertWithCallback, this.subtitle);
            }
        }
    }

    private _showPopup(statusCode): void {
        switch (statusCode) {
            case 0:
                this.title = 'Please check your internet connection';
                this.popupButtons = [
                    {
                        text: 'OK',
                        function: () => {
                            this.show = false;
                        },
                        link: '',
                        type: 'primary'
                    }
                ];
                break;
            case 401:
                this.title = 'Your session has expired';
                this.popupButtons = [
                    {
                        text: 'OK',
                        function: () => {
                            this.show = false;
                            this._router.navigate(['/sign-in']);
                        },
                        link: '',
                        type: 'primary'
                    }
                ];
                break;
            case 409:
                this.title = 'Already Exists';
                this.popupButtons = [
                    {
                        text: 'OK',
                        function: () => {
                            this.show = false;
                        },
                        link: '',
                        type: 'primary'
                    }
                ];
                break;
            case 404:
                this.title = 'Wrong Credentials';
                this.popupButtons = [
                    {
                        text: 'OK',
                        function: () => {
                            this.show = false;
                        },
                        link: '',
                        type: 'primary'
                    }
                ];
                break;
            default:
                this.title = 'Some errors occurred';
                this.popupButtons = [
                    {
                        text: 'OK',
                        function: () => {
                            this.show = false;
                        },
                        link: '',
                        type: 'primary'
                    }
                ];
                break;
        }
        this.error = null;
        this.eventEmitter.emit({ component: 'app-error-page', action: 'resetAppError' });
        this.show = true;
    }

    private _showAlert(title): void {
        this.title = title;
        this.popupButtons = [
            {
                text: 'OK',
                function: () => {
                    this.show = false;
                    this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
                    this.title = '';
                },
                link: '',
                type: 'primary'
            }
        ];
        this.show = true;
    }

    private _showPopupWithCallback(title, subtitle): void {
        this.title = title;
        this.subtitle = subtitle;
        this.popupButtons = [
            {
                text: 'Yes',
                function: () => {
                    this.show = false;
                    if (this.type === 'exportCustomDashboard') {
                        this._communicationService.showCallbackFunctionKPI(this.type);
                    } else if (this.type === 'bookTicketCustomAction') {
                        this._communicationService.showCallbackFunctionBookTickets(this.type);
                    } else if (this.type === 'acceptRefund') {
                        this._communicationService.showCallbackFunctionPageview(this.type);
                    } else {
                        this._communicationService.showCallbackFunction(this.type);
                    }
                    this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
                    this.title = '';
                },
                link: '',
                type: 'primary'
            },
            {
                text: 'No',
                function: () => {
                    this.show = false;
                    this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
                    this.title = '';
                },
                link: '',
                type: 'secondary'
            }
        ];
        this.show = true;
    }

    closePopup(event) {
        if (event.type == 'closePopUp') {
            this.show = false;
            this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
            this.title = '';
        } else if (event.type == 'setValueForm') {
            this.formData = event.values;

        }
    }

    private _showPopupWithCallbackWithForm(title, subtitle, form): void {
        this.title = title;
        this.subtitle = subtitle;
        console.log('error-page', this.formData)
        if (form.buttons) {
            this.popupButtons = form.buttons.map(button => ({
                text: button ? button.name : 'Submit',
                function: () => {
                    this.show = false;
                    if (this.type === 'bookTickets') {
                        this._communicationService.showCallbackFunctionBookTickets(this.type, this.formData);
                    } else if (this.type === 'bookTicketCustomAction') {
                        this._communicationService.showCallbackFunctionBookTickets(this.type, this.formData);
                    } else {
                        this._communicationService.showCallbackFunction(this.type, this.formData);
                    }
                    this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
                    this.title = '';
                },
                link: '',
                type: 'primary'
            }));
        } else {
            this.popupButtons = [
                {
                    text: form.button ? form.button.name : 'Submit',
                    function: () => {
                        this.show = false;
                        this.show = false;
                        if (this.type === 'bookTickets') {
                            this._communicationService.showCallbackFunctionBookTickets(this.type, this.formData);
                        } else if (this.type === 'bookTicketCustomAction') {
                            console.log(this.formData)
                            this._communicationService.showCallbackFunctionBookTickets(this.type, this.formData);
                        } else {
                            this._communicationService.showCallbackFunction(this.type, this.formData);
                        }
                        this.eventEmitter.emit({ component: 'app-error-page', action: 'emptyAlert' });
                        this.title = '';
                    },
                    link: '',
                    type: 'primary'
                }
            ];
        }
        this.formFields = form.formFields;
        for (let i = 0; i < this.formFields.length; i++) {
            let orderObj = {};
            orderObj[this.formFields[i].identifier] = this.formFields[i].order;
            this.fieldsOrder.push(orderObj);
        }
        if (form.showExtraData && form.showExtraData.extraInfo) {
            this.extraInfo = form.showExtraData.extraInfo;
        }
        this.show = true;
    }
}
