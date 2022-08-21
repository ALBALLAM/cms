import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ApiService } from '../api/api.service';
import { CommunicationService } from '../communication/communication.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { customActionSentence } from '../globalVariables';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Validation } from '../Validations';
import { FormUtilsService } from '../form-utils/form-utils.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-book-ticket',
    templateUrl: './bookTicketsDashboard.component.html',
    styleUrls: ['./bookTicketsDashboard.component.scss']
})
export class BookTicketsDashboardComponent implements OnInit {
    @Input() public attributesObject;

    userRole = localStorage.getItem("userRole") || null;
    public orderObj = {};
    public clickedRow = {};
    Validation: any = Validation;
    showFilters = false;
    filterIndex = 0;
    KPIResponse;
    filtersGetResponse;
    statisticsResponse;
    headers;
    manageFields = [];
    fields = [];
    dependencies = [];
    showChosen;
    showHeaders;
    playChosen;
    permissions;
    actions;
    action;
    filterForm: FormGroup;
    subscription: Subscription;
    subscriptionData: any;
    @Output() customActionEmitter = new EventEmitter<any>();
    @ViewChild('myappfrm') child;

    constructor(private _apiService: ApiService, private _communicationService: CommunicationService,
        private _formBuilder: FormBuilder, private _router: Router, private formUtils: FormUtilsService, private datePipe: DatePipe) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                console.log('here is the response', response)
                this._subscriptionCallback();
            });
    }

    public ngOnInit() {
        if (JSON.parse(sessionStorage.getItem('bookTickets'))) {
            const params = JSON.parse(sessionStorage.getItem('bookTickets'));
            if (params && params.selectedRowData) {
                this.playChosen = params.selectedRowData.playChosen;
                this.showChosen = params.selectedRowData.showChosen;
            }
        }
        this.actions = this.attributesObject.customActions;
        this.permissions = this.attributesObject.permissions;
        if (this.attributesObject && this.attributesObject.tableHeaders && this.attributesObject.tableHeaders
            && this.attributesObject.tableHeaders.data.length > 0) {
            if (this.userRole === 'bookwindow') {
                this.headers = this.attributesObject.tableHeaders;
                this.headers.data = this.headers.data.filter(header => header.identifier !== 'priceSum' && header.identifier !== 'totalPriceInvited' && header.identifier !== 'remainingSeatsPrice');
            } else {
                this.headers = this.attributesObject.tableHeaders;
            }

        }
        if (this.attributesObject && this.attributesObject.manageFields && this.attributesObject.manageFields.length > 0) {
            this.manageFields = this.attributesObject.manageFields;
        }
        if (this.attributesObject && this.attributesObject.fields && this.attributesObject.fields.length > 0) {
            this.fields = this.attributesObject.fields;
        }
        if (this.attributesObject && this.attributesObject.dependencies && this.attributesObject.dependencies.length > 0) {
            this.dependencies = this.attributesObject.dependencies;
        }
        for (let i = 0; i < this.fields.length; i++) {
            this.orderObj[this.fields[i].identifier] = this.fields[i].order;
        }
        this._communicationService.showLoading(true);
        if (this.attributesObject.filters && this.attributesObject.filters.length) {
            for (const filter of this.attributesObject.filters) {
                if (!filter.options || filter.options.length === 0) {
                    this.getFilterAPI(filter);
                } else {
                    this.incrementFilters();
                }
            }
        }
    }

    public incrementFilters() {
        this.filterIndex++;
        if (this.filterIndex === this.attributesObject.filters.length) {
            this.initializeFilters();
            this.showFilters = true;
        }
    }

    public getFilterAPI(filter) {
        console.log('Filter Api')
        this._apiService.sendApi('get', filter.url, '', true, false)
            .subscribe(response => {
                let filterResponse;
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

    public getPlaysAPI(addLoading = false) {
        for (const filter of this.attributesObject.filters) {
            if (filter.identifier === 'play') {
                filter.hidden = true;
                break;
            }
        }
        let found = false;
        if (addLoading) {
            this._communicationService.showLoading(true);
        }
        let url = this.attributesObject.get_plays_url;
        for (const filter of this.attributesObject.filters) {
            if (filter.value !== filter.all_label_value && !filter.hidden) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                found = true;
                if (filter.identifier === 'show') {
                    this.showChosen = filter.value;
                }
                url += filter.filterBy + '=' + filter.value;
            }
        }
        if (found) {
            this._apiService.sendApi('get', url, '', true, false)
                .subscribe(response => {
                    if (this.attributesObject.CMSFormat) {
                        this.filtersGetResponse = response.data.result;
                    } else {
                        this.filtersGetResponse = response;
                    }
                },
                    (err) => {
                        this.getPageErrorCallback(err);
                        this._communicationService.showLoading(false);
                    }, () => {
                        for (const filter of this.attributesObject.filters) {
                            if (filter.identifier === 'play') {
                                const options = [];
                                for (const data of this.filtersGetResponse) {
                                    const option = {};
                                    if (data['timezone']) {
                                        const dateDisplay = moment.tz(data[filter.text_label_3], data.timezone).locale('en')
                                            .format('DD MMM YYYY hh:mm A');
                                        option[filter.text_to_display] = data[filter.text_label] + ' (' + dateDisplay + ')';
                                    } else {
                                        option[filter.text_to_display] = data[filter.text_label] + ' (' +
                                            this.datePipe.transform(data[filter.text_label_3], 'dd MMM yyyy hh:mm a', 'UTC') + ')';
                                    }
                                    option[filter.value_label_to_display] = data[filter.value_label];
                                    options.push(option);
                                }
                                filter.options = options;
                                filter.hidden = false;
                                break;
                            }
                        }
                        this._communicationService.showLoading(false);
                    });
        } else {
            this._communicationService.showLoading(false);
        }
    }

    public getStatisticsAPI(addLoading = false) {
        if (this.showHeaders) {
            this.child.emptyFields();
            this.showHeaders = false;
        }
        let found = false;
        if (addLoading) {
            this._communicationService.showLoading(true);
        }
        let url = this.attributesObject.get_statistics;
        for (const filter of this.attributesObject.filters) {
            if (filter.value !== filter.all_label_value && !filter.hidden) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                if (filter.identifier === 'play') {
                    this.playChosen = filter.value;
                    found = true;
                }
                url += filter.filterBy + '=' + filter.value;
            }
        }
        if (found) {
            this._apiService.sendApi('get', url, '', true, false)
                .subscribe(response => {
                    if (this.attributesObject.CMSFormat) {
                        this.statisticsResponse = response.data.result;
                    } else {
                        this.statisticsResponse = response;
                    }
                },
                    (err) => {
                        this.getPageErrorCallback(err);
                        this._communicationService.showLoading(false);
                    }, () => {
                        if (this.statisticsResponse && this.statisticsResponse.statistics) {
                            this.statisticsResponse = this.statisticsResponse.statistics;
                            for (const header of this.headers.data) {
                                header.value = this.statisticsResponse[header.identifier];
                                if (header.fieldToConcat) {
                                    header.fieldToConcat = this.statisticsResponse[header.fieldToConcat];
                                }
                            }
                            for (const field of this.fields) {
                                if (field.resetFields) {
                                    field.hidden = true;
                                }
                                if (!field.initialValue) {
                                    if (field.type !== 'number') {
                                        field.value = '';
                                    }
                                } else {
                                    field.value = field.initialValue;
                                }
                                if (field.type === 'seat-selector') {
                                    field.selectedId = this.playChosen;
                                    field.oldAmount = 0;
                                }
                            }
                            this.showHeaders = true;
                        }
                        this._communicationService.showLoading(false);
                    });
        } else {
            this._communicationService.showLoading(false);
        }
    }

    customAction(action): void {
        this.action = null;
        this.action = action;
        if (action.action_type && action.action_type == 'popup') {
            let sentenceToShow = action.sentence && action.sentence != '' ? action.sentence : customActionSentence;
            console.log(action);
            this._communicationService.showPopupWithCallback(sentenceToShow, 'bookTicketCustomAction', true, null, true, action.form);
        } else {
            const sentenceToShow = this.action.sentence && this.action.sentence !== '' ? this.action.sentence : customActionSentence;
            this._communicationService.showPopupWithCallback(sentenceToShow, 'exportCustomDashboard');
        }
    }

    initializeFilters() {
        const controllers = {};
        for (const filter of this.attributesObject.filters) {
            controllers[filter.identifier] = filter.all_label_value;
            filter.value = filter.all_label_value;
            if (this.showChosen && filter.identifier === 'show') {
                filter.value = this.showChosen;
            } else if (this.playChosen && filter.identifier === 'play') {
                filter.value = this.playChosen;
            }
        }
        this.filterForm = this._formBuilder.group(controllers);

        for (const filter of this.attributesObject.filters) {
            filter.group = this.filterForm;
            filter.required = false;
            filter.disableClear = true;
        }
    }

    routeToManageFields(link, id, selectedRowData, routeTableDirect = false) {
        const params = {
            url: '/' + link,
            previousUrl: this._router.url,
            id: id,
            selectedRowData: selectedRowData,
            routeTableDirect: routeTableDirect
        };
        sessionStorage.setItem('routing-params', JSON.stringify(params));
        this._router.navigate(['/' + link]);
    }

    handleManage(record) {
        const dataToSave = {
            playChosen: this.playChosen,
            showChosen: this.showChosen
        };
        const params = {
            url: '/' + record.link,
            previousUrl: this._router.url,
            id: this.playChosen,
            selectedRowData: dataToSave
        };
        this._setPagingSession(dataToSave);
        sessionStorage.setItem('routing-params', JSON.stringify(params));
        this._router.navigate(['/' + record.link]);
    }

    saveTicket() {
        if (this.child.validateGroup(true, false)) {
            if (this.attributesObject && this.attributesObject.bookPopupForm) {
                const sentenceToShow = this.attributesObject.bookPopupForm.sentence && this.attributesObject.bookPopupForm.sentence !== '' ?
                    this.attributesObject.bookPopupForm.sentence : 'Add Ticket Informations';
                this._communicationService.showPopupWithCallback(sentenceToShow, 'bookTickets', true, null,
                    true, this.attributesObject.bookPopupForm.form);
            } else {
                const params = this.formUtils.getGroupFields(this.child);
                this.addTicket(params);
            }
        }
    }

    addDirectTicket() {
        if (this.child.validateGroup(true, false)) {
            const params = this.formUtils.getGroupFields(this.child);
            this.addTicket(params);
        }
    }

    addTicket(params) {
        this._communicationService.showLoading(true);
        const url = this.attributesObject.add_url + '?id=' + this.playChosen;
        this._apiService.sendApi('post', url, params, true, false)
            .subscribe(response => {
            },
                (err) => {
                    this.getPageErrorCallback(err);
                    this._communicationService.showLoading(false);
                }, () => {
                    this.getStatisticsAPI(true);
                });
    }

    private _setPagingSession(selectedRowData = null) {
        const params = {
            selectedRowData: selectedRowData
        };
        sessionStorage.setItem('bookTickets', JSON.stringify(params));
    }

    private _subscriptionCallback(): void {
        console.log("Hey")
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData['notifyComponent'] === 'app-book-ticket' && this.subscriptionData['action'] === 'callback') {
                if (this.subscriptionData['type'] === 'bookTickets') {
                    const params = this.formUtils.getGroupFields(this.child);
                    const formParams = this.subscriptionData['formData'];
                    if (formParams.knet === '') {
                        formParams.knet = 0;
                    }
                    if (formParams.cash === '') {
                        formParams.cash = 0;
                    }
                    if (formParams.masterCard === '') {
                        formParams.masterCard = 0;
                    }
                    if (!formParams.clientMobileNumber) {
                        formParams.clientMobileNumber = '';
                    }
                    if (!formParams.clientName) {
                        formParams.clientName = '';
                    }
                    for (const key in formParams) {
                        params[key] = formParams[key];
                    }
                    this.addTicket(params);
                } else if (this.subscriptionData['type'] === 'bookTicketCustomAction') {
                    this.action.selectedId = this.playChosen;
                    const formParams = this.subscriptionData['formData'];
                    this.action.params = formParams;
                    this.customActionEmitter.emit(this.action);
                }
            }
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }
}
