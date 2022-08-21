import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '../api/api.service';
import { CommunicationService } from '../communication/communication.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { customActionSentence } from '../globalVariables';
import { Subscription } from 'rxjs';
import { isDateValid } from 'ngx-bootstrap';
import { BoundText } from '@angular/compiler/src/render3/r3_ast';

@Component({
    selector: 'app-kpi',
    templateUrl: './kpi.component.html',
    styleUrls: ['./kpi.component.scss']
})
export class KpiComponent implements OnInit {
    @Input() public attributesObject;

    userRole = localStorage.getItem('userRole') || null;

    showFilters = false;
    filterIndex = 0;
    KPIResponse;
    permissions;
    actions;
    action;
    filterForm: FormGroup;
    subscription: Subscription;
    subscriptionData: any;
    dateValueFrom: any;
    dateValueTo: any;
    currentDate: any;
    currentDateFrom: any;
    removeDateMax = true;
    currentDateObject = null;
    @Output() customActionEmitter = new EventEmitter<any>();

    constructor(private _apiService: ApiService, private _communicationService: CommunicationService,
        private _formBuilder: FormBuilder) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
    }

    public ngOnInit() {
        this.actions = this.attributesObject.customActions;
        this.permissions = this.attributesObject.permissions;

        if (this.userRole === 'bookwindow') {
            this.attributesObject.small_boxes = this.attributesObject.small_boxes.filter(box => box.identifier === 'totalWindowSales' ||
                box.identifier === 'totalCash' ||
                box.identifier === 'totalKnet' ||
                box.identifier === 'totalMasterCard' ||
                box.identifier === 'totalAdditionalSeats' ||
                box.identifier === 'totalTickets'
            )

        }

        this._communicationService.showLoading(true);
        if (this.attributesObject.filters && this.attributesObject.filters.length) {
            for (const filter of this.attributesObject.filters) {
                if ((!filter.options || filter.options.length === 0) && filter.url) {
                    this.getFilterAPI(filter);

                } else {
                    this.incrementFilters();
                }
            }
        } else {
            this.getKPIsAPI();
        }
    }

    public incrementFilters() {
        this.filterIndex++;
        if (this.filterIndex === this.attributesObject.filters.length) {
            this.initializeFilters();
            this.showFilters = true;
            this.getKPIsAPI();
        }
    }

    public getFilterAPI(filter) {
        this._apiService.sendApi('get', filter.url, '', true, false)
            .subscribe(response => {
                let filterResponse;
                console.log(filterResponse);
                if (filter.CMSFormat) {
                    filterResponse = response.data.result;
                } else {
                    filterResponse = response;
                }
                const options = [];
                if (filter.all_label) {
                    options.push({ text: filter.all_label, value: filter.all_label_value });
                }
                for (const data of filterResponse) {
                    const option = {};
                    option[filter.text_to_display] = data[filter.text_label];
                    option[filter.value_label_to_display] = data[filter.value_label];
                    options.push(option);
                }
                filter.options = options;
            },
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    this.incrementFilters();
                });
    }

    public getKPIsAPI(addLoading = false, dateObj = null) {
        if (addLoading) {
            this._communicationService.showLoading(true);
        }
        let url = this.attributesObject.get_url;
        for (const filter of this.attributesObject.filters) {
            if (filter.value !== filter.all_label_value) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                url += filter.filterBy + '=' + filter.value;
            }
        }
        if (dateObj && dateObj.from) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'from=' + dateObj.from;
        }
        if (dateObj && dateObj.to) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'to=' + dateObj.to;
        }
        this._apiService.sendApi('get', url, '', true, false)
            .subscribe(response => {
                if (this.attributesObject.CMSFormat) {
                    this.KPIResponse = response.data.result;
                } else {
                    this.KPIResponse = response;
                }
            },
                (err) => {
                    this.getPageErrorCallback(err);
                    this._communicationService.showLoading(false);
                }, () => {
                    this._communicationService.showLoading(false);
                });
    }

    customAction(action): void {
        this.action = null;
        this.action = action;
        this.action.date = this.currentDateObject;
        const sentenceToShow = this.action.sentence && this.action.sentence !== '' ? this.action.sentence : customActionSentence;
        this._communicationService.showPopupWithCallback(sentenceToShow, 'exportCustomDashboard');
    }

    initializeFilters() {
        const controllers = {};
        for (const filter of this.attributesObject.filters) {
            controllers[filter.identifier] = filter.all_label_value;
            filter.value = filter.all_label_value;
        }
        this.filterForm = this._formBuilder.group(controllers);

        for (const filter of this.attributesObject.filters) {
            filter.group = this.filterForm;
            filter.required = false;
            filter.disableClear = true;
        }
    }

    selectSearchDate(event) {
        let dateObj = {};
        if (this.dateValueFrom) {
            const tzoffset = (this.dateValueFrom).getTimezoneOffset() * 60000;
            dateObj['from'] = (new Date(this.dateValueFrom - tzoffset)).toISOString().slice(0, -1);
        }
        if (this.dateValueTo) {
            const tzoffset = (this.dateValueTo).getTimezoneOffset() * 60000;
            dateObj['to'] = (new Date(this.dateValueTo - tzoffset)).toISOString().slice(0, -1);
            dateObj['to'] = dateObj['to'].replace('T00:00:00.000', 'T23:59:59.000');
            this.currentDateFrom = this.dateValueTo;
        }
        this.currentDateObject = dateObj;
        this.getKPIsAPI(true, dateObj);
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData['notifyComponent'] === 'app-dashboard' && this.subscriptionData['action'] === 'callback') {
                if (this.subscriptionData['type'] === 'exportCustomDashboard') {
                    this.customActionEmitter.emit(this.action);
                }
            }
        }
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }
}
