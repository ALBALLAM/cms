import { Component, OnDestroy, OnInit } from '@angular/core';
import SHA256 from 'sha256-es';
import { Router } from '@angular/router';
import { CommunicationService } from '../communication/communication.service';
import { ApiService } from '../api/api.service';
import { Validation } from '../Validations';
import { deleteSentence } from '../globalVariables';
import { customActionSentence } from '../globalVariables';
import { HttpClient, HttpParams } from '@angular/common/http';
import { saveAs } from 'file-saver';
import { Subscription } from 'rxjs/index';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-pageview',
    templateUrl: './pageview.component.html',
    styleUrls: ['./pageview.component.scss']
})
export class PageViewComponent implements OnDestroy, OnInit {

    showNotification: boolean = false;
    showDashboard: boolean = false;
    showKPI: boolean = false;
    showBookTicketDashboard: boolean = false;
    showMatrix: boolean = false;
    showWidgetCards: boolean = false;
    usersByGroupData: any;
    validation: any = Validation;
    columnObject: any;
    routing_params: any;
    id: string;
    responseData: any;
    currentPage: number = 1;
    previousSessionPage: number = 0;
    limitMaxPage: number = 20;
    totalRecords: number;
    totalCount: number;
    allowPagination: boolean;
    responseDataPrivileges: any;
    dependencies: any;
    tableTitle: string;
    formTitle: string;
    blocks: any;
    fields: any;
    fields_add: any;
    columns = [];
    fieldsOrder = [];
    dataLists: any;
    privilege_types: any;
    defaultPermission: any;
    sortBy: any;
    groupBy: any;
    data: any;
    groupingFields: boolean;
    allowSearch: boolean;
    allowDateSearch: boolean;
    allowCustomFilter: boolean;
    removeDateMax: boolean;
    dateSearch: any;
    filterSearch: any;
    startSearch: boolean = false;
    searchWord: string = '';
    seniority = [];
    skills = [];
    canAdd: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    deleteSentence: string = deleteSentence;
    permissions: any;
    manageFields: any;
    backSection: any;
    actions: any;
    showManageFields: boolean;
    showBackIcon: boolean;
    showTable: boolean;
    showPrivilegesTable: boolean;
    backUrl: string;
    apiUrls: any;
    message: string;
    rolesPrivileges: any;
    searchFields: string;
    canView: boolean;

    extraDataOptions = {};
    extraDataOptionsTexts = {};
    extraDataResponse: any;
    headers: any;
    hasExtraTable: boolean;
    extraTableApis: any;
    extraTableData: any;
    extraTableArray: any[] = [];
    showExtraTable: any;
    hideControlButtons: boolean;
    previousSessionRow;
    attributesObject: any;
    extraTableAttributes: any;
    searchFieldsArray: any[];
    theme: string;
    startSort: boolean = false;
    startDateFilter: boolean = false;
    startCustomFilter: boolean = false;
    sort: {
        sortField: '',
        sortOrder: 1
    };
    dateFilter: {
        dateField: ''
    };
    customFilters = {};
    filters: object;
    startColumnSearch: boolean = false;
    sideMenuLink;
    subscription: Subscription;
    subscriptionData: any;
    selectedAction: any;

    constructor(private _router: Router,
        private _communicationService: CommunicationService,
        private _apiService: ApiService,
        private _http: HttpClient) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
    }

    ngOnInit() {
        // this._communicationService.closeSideBar();
        this.theme = this._communicationService.getThemeConstants().theme;
        if (sessionStorage.getItem('side-menu-params-links')) {
            this.sideMenuLink = JSON.parse(sessionStorage.getItem('side-menu-params-links'));
        }
        if (sessionStorage.getItem('routing-params')) {
            this.routing_params = JSON.parse(sessionStorage.getItem('routing-params'));
            this.id = this.routing_params.id;
            this._checkSession();
            this.getSectionAttributes();
            // this.initializePage();
        } else {
            this._router.navigate(['/sign-in']);
        }
    }

    private _checkSession() {
        if (sessionStorage.getItem(this.routing_params.url)) {
            let previousSession = sessionStorage.getItem(this.routing_params.url);
            previousSession = JSON.parse(previousSession);
            if (previousSession['page']) {
                this.previousSessionPage = (parseInt(previousSession['page']) - 1) * this.limitMaxPage;
                this.currentPage = previousSession['page'];
            }
            if (previousSession['selectedRow']) {
                this.previousSessionRow = previousSession;
            }
        }
    }

    getSectionAttributes() {
        this._communicationService.showLoading(true);
        this._apiService.sendApi('get', '/section/' + this.routing_params.url, '', true, false)
            .subscribe(data => {
                this.attributesObject = this.addCustomFields(data);
                this.allowCustomFilter = this.attributesObject.allowCustomFilter;
                this.filterSearch = this.attributesObject.filterSearch;
                this.extraTableAttributes = (this.attributesObject.extraTables && this.attributesObject.extraTables.length > 0) ? this.attributesObject.extraTables[0] : [];
                this.blocks = this.attributesObject.blocks;
                this.backSection = this.attributesObject.backSection;
                if (this.attributesObject.tableLimit) {
                    this.limitMaxPage = this.attributesObject.tableLimit;
                }
            },
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    this.checkSearchSession();
                    this.prepareTableColumns();
                });
    }

    addCustomFields(data) {
        const newFormFields = [
            {
                "identifier": "clientName",
                "required": true,
                "label": "Client Name",
                "validation": "free_text_validator",
                "type": "text",
                "order": 1
            },
            {
                "identifier": "clientMobileNumber",
                "required": true,
                "label": "Client Mobile Number",
                "validation": "free_text_validator",
                "type": "text",
                "order": 2
            },
            {
                "identifier": "cash",
                "required": true,
                "label": "Cash",
                "validation": "free_text_validator",
                "type": "number",
                "order": 3
            },
            {
                "identifier": "knet",
                "required": true,
                "label": "KNET",
                "validation": "free_text_validator",
                "type": "number",
                "order": 4
            },
            {
                "identifier": "masterCard",
                "required": true,
                "label": "Master Card",
                "validation": "free_text_validator",
                "type": "number",
                "order": 5
            }
        ];

        if (data && data.fields && data.fields.length > 0) {
            for (let index = 0; index < data.fields.length; index++) {
                const field = data.fields[index];
                if (field.identifier === 'clientMobileNumber') {
                    field.type = 'text';
                }
            }
        }


        if (data && data.customActions && data.customActions.length > 0) {
            for (let index = 0; index < data.customActions.length; index++) {
                const action = data.customActions[index];
                if (action.url === '/cms/tickets/bookReserved') {
                    action.form.formFields = newFormFields;
                    break;
                }
            }
        }

        return data;
    }

    checkSearchSession() {
        if (sessionStorage.getItem(this.routing_params.url + '-search')) {
            const searchParams = JSON.parse(sessionStorage.getItem(this.routing_params.url + '-search'));
            if (searchParams.customFilters) {
                for (const filter of this.filterSearch) {
                    if (searchParams.customFilters[filter.identifier]) {
                        filter.value = searchParams.customFilters[filter.identifier];
                    }
                }
            }
        }
    }

    // initializePage(): void {
    //     this.canAdd = this.canUpdate = this.canDelete = false;
    //     this.routing_params = JSON.parse(sessionStorage.getItem('routing-params'));
    //     this.id = this.routing_params.id;
    //     this._checkSession();
    //     this.apiUrls = JSON.parse(sessionStorage.getItem('side_menu_links'));
    //     if (this.apiUrls[this.routing_params.url].show_only_form) {
    //         this.showNotification = true;
    //     } else {
    //         this.showNotification = false;
    //     }
    //     if(this.routing_params.url === 'dashboard') {
    //         this.showDashboard = true;
    //         return;
    //     }
    //     if (this.apiUrls[this.routing_params.url].has_extra_data) {
    //         let index = 0;
    //         for (let item of this.apiUrls[this.routing_params.url].extra_data) {
    //             index++;
    //             this._getExtraData(item, index, this.apiUrls[this.routing_params.url].extra_data.length);
    //         }
    //     } else {
    //         if (!this.showNotification) {
    //             this.getTableData();
    //         } else {
    //             this.setTableColumns();
    //         }
    //     }
    //     if (this.apiUrls[this.routing_params.url].showExtraTable) {
    //         this.hasExtraTable = true;
    //         this.extraTableApis = this.apiUrls[this.routing_params.url].extra_table_apis;
    //     } else {
    //         this.hasExtraTable = false;
    //     }
    // }

    prepareTableColumns(): void {
        if (this.attributesObject.show_only_form) {
            this.showNotification = true;
        } else {
            this.showNotification = false;
        }
        if (this.attributesObject.showDashboard) {
            this.showDashboard = true;
        }
        if (this.attributesObject.showMatrix) {
            this.showMatrix = true;
        }
        if (this.attributesObject.showWidgetCards) {
            this.showWidgetCards = true;
        }
        if (this.attributesObject.extraData && this.attributesObject.extraData.length > 0) {
            let index = 0;
            for (let item of this.attributesObject.extraData) {
                index++;
                this._getExtraData(item, index, this.attributesObject.extraData.length);
            }
        } else {
            if (this.attributesObject.showKPI) {
                this.showKPI = true;
            } else if (this.attributesObject.showBookTicketDashboard) {
                this.showBookTicketDashboard = true;
            } else {
                if (!this.showNotification && !this.showKPI && !this.showBookTicketDashboard) {
                    this.getTableData();
                } else {
                    this.setTableColumns();
                }
            }
        }
        if (this.attributesObject.extraTables && this.attributesObject.extraTables.length > 0) {
            this.hasExtraTable = true;
            this.extraTableApis = this.attributesObject.extraTables;
        } else {
            this.hasExtraTable = false;
        }
    }

    getTableData(showSuccessAfterCustom = false): void {
        this._communicationService.showLoading(true);
        if (this.routing_params && this.attributesObject) {
            this.backUrl = this.attributesObject.backUrl;
            let url = this.getUrl(this.attributesObject.get_url);
            this._apiService.sendApi('get', url, '', true, false)
                .subscribe(response => {
                    if (this.attributesObject.CMSFormat) {
                        response = response.data.result ? response.data.result : this.attributesObject.allowPagination ? {
                            data: [],
                            totalPages: 1
                        } : [];
                    }
                    this.responseData = this.attributesObject.allowPagination ? response.data : response;
                    this.headers = response.headers;
                    this.totalRecords = this.attributesObject.allowPagination ? (response.totalPages * this.limitMaxPage) : null;
                    this.totalCount = this.attributesObject.allowPagination ? response.totalCount ? response.totalCount : 0 : null;
                    this.allowPagination = this.attributesObject.allowPagination;
                },
                    (err) => {
                        this.getPageErrorCallback(err);
                    }, () => {
                        if (!this.attributesObject.showDashboard && !this.attributesObject.showMatrix) {
                            this.setTableColumns(showSuccessAfterCustom);
                        } else {
                            this._communicationService.showLoading(false);
                        }
                    });
        }
    }

    getUrl(initialUrl) {
        let url;
        if (this.attributesObject.allowPagination) {
            if (this.startSearch) {
                url = initialUrl
                    + '?page=' + this.currentPage + '&limit=' + this.limitMaxPage + '&search=' + encodeURIComponent(this.searchWord) +
                    '&searchFields=' + this.searchFields;
            } else {
                url = initialUrl + '?page=' + this.currentPage
                    + '&limit=' + this.limitMaxPage;
            }
        } else {
            if (this.startSearch) {
                url = initialUrl
                    + '?search=' + encodeURIComponent(this.searchWord);
                if (this.seniority && this.seniority.length > 0) {
                    url += '&seniority[]=' + this.seniority.join('&seniority[]=');
                }
                if (this.skills && this.skills.length > 0) {
                    url += '&skills[]=' + this.skills.join('&skills[]=');
                }
            } else {
                url = initialUrl;
            }
        }
        if (this.startSort) {
            url += '&sortField=' + this.sort.sortField + '&sortOrder=' + this.sort.sortOrder;
        }
        if (this.startDateFilter) {
            url += '&dateField=' + this.dateFilter.dateField;
            if (this.dateFilter['from']) {
                url += '&from=' + this.dateFilter['from'];
            }
            if (this.dateFilter['to']) {
                url += '&to=' + this.dateFilter['to'];
            }
        }
        if (this.startCustomFilter) {
            for (let key in this.customFilters) {
                url += '&' + key + '=' + this.customFilters[key];
            }
        }
        if (this.startColumnSearch) {
            for (let x = 0; x < Object.keys(this.filters).length; x++) {
                url += '&column_' + Object.keys(this.filters)[x] + '=' + this.filters[Object.keys(this.filters)[x]].value;
            }
        }
        if (this.id && this.backSection) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'id=' + this.id;
        }

        return url;
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }

    fillColumns(fields) {
        let columns = [];
        let columns_add = [];
        for (let field of fields) {
            let readOnlyStatus;
            let changedReadOnlyStatus = false;
            if (!field.add_hidden) {
                readOnlyStatus = field.readonly;
                field.readonly = false;
                changedReadOnlyStatus = true;
                columns_add.push(JSON.parse(JSON.stringify(field)));
            }
            if (changedReadOnlyStatus) {
                field.readonly = readOnlyStatus;
            }
            if (!field.update_hidden) {
                columns.push(JSON.parse(JSON.stringify(field)));
            }
        }
        return {
            columns: columns,
            columns_add: columns_add
        };
    }


    setTableColumns(showSuccessAfterCustom = false): void {
        this._communicationService.showLoading(false);
        if ((this.responseData && this.attributesObject) || this.showNotification) {
            this.manageFields = this.attributesObject.manageFields;
            //Checking Manage Permissions
            if (this.manageFields && this.manageFields.length > 0 && this.sideMenuLink) {
                let newManageFields = [];
                for (let manage of this.manageFields) {
                    if (this.sideMenuLink[manage.link]) {
                        newManageFields.push(manage);
                    }
                }
                this.manageFields = JSON.parse(JSON.stringify(newManageFields));
            }
            let columnsFilling = this.fillColumns(this.attributesObject.fields);
            this.fields = [], this.fields_add = [], this.columns = [], this.data = [];
            this.fields = columnsFilling.columns ? columnsFilling.columns : [];
            this.fields_add = columnsFilling.columns_add ? columnsFilling.columns_add : [];
            for (let i = 0; i < this.fields_add.length; i++) {
                if ((this.fields_add[i].type === 'dropdown' || this.fields_add[i].type === 'multi-select' || this.fields_add[i].type === 'chip-select') && this.extraDataOptions[this.fields_add[i].identifier]) {
                    this.fields_add[i].options = this.extraDataOptions[this.fields_add[i].identifier];
                }
                if ((this.fields_add[i].type === 'seat-selector')) {
                    this.fields_add[i].selectedId = this.id;
                }
            }
            if (this.allowCustomFilter && this.filterSearch && this.filterSearch.length > 0) {
                for (let filter of this.filterSearch) {
                    if (filter.type === 'dropdown' && (!filter.options || filter.options.length === 0) && this.extraDataOptions[filter.identifier]) {
                        filter.options = this.extraDataOptions[filter.identifier];
                        if (filter.options && filter.options.length > 0) {
                            filter.options.unshift({ text: filter.all_label, value: filter.all_label_value });
                        }
                    }
                }
            }
            let searchFields = [];
            this.searchFieldsArray = [];
            for (let i = 0; i < this.fields.length; i++) {
                if (!this.fields[i].table_hidden) {
                    searchFields.push(this.fields[i].identifier);
                    this.searchFieldsArray.push(this.fields[i].identifier);
                }
                let columnObj =
                {
                    name: this.fields[i].identifier,
                    label: this.fields[i].label,
                    hidden: this.fields[i].table_hidden,
                    titleHidden: this.fields[i].columnTitleHide,
                    type: this.fields[i].type,
                    preview: this.fields[i].preview,
                    showUTC: this.fields[i].showUTC,
                    showBasedTimezone: this.fields[i].showBasedTimezone,
                    button_action: this.fields[i].button_action,
                    sortable: this.fields[i].sortable ? this.fields[i].sortable : false,
                    allowSearch: this.fields[i].allowSearch ? this.fields[i].allowSearch : false,
                    tooltip: this.fields[i].label,
                    withBackgroundColor: this.fields[i].withBackgroundColor,
                    isIcon: this.fields[i].isIcon,
                    readonly: this.fields[i].readonly,
                    numeric: false,
                    filter: true,
                    widthFormat: this.fields[i].widthFormat,
                    link: this.fields[i].link,
                };
                if ((this.fields[i].type === 'dropdown' || this.fields[i].type === 'multi-select' || this.fields[i].type === 'chip-select') && this.extraDataOptions[this.fields[i].identifier]) {
                    this.fields[i].options = this.extraDataOptions[this.fields[i].identifier];
                }
                if (this.fields[i].type === 'seat-selector') {
                    this.fields[i].selectedId = this.id;
                }
                if (this.fields[i].type === 'manage') {
                    let foundManage = false;
                    for (let item of this.manageFields) {
                        if (item.link === this.fields[i].link) {
                            foundManage = true;
                        }
                    }
                    if (!foundManage) {
                        columnObj.hidden = true;
                    }
                }
                let orderObj = {};
                orderObj[this.fields[i].identifier] = this.fields[i].order;
                this.columns.push(columnObj);
                this.fieldsOrder.push(orderObj);
            }
            this.searchFields = searchFields.join();
            this.data = this.responseData;
            for (const record of this.data) {
                if (record.dateDisplay && record.timezone) {
                    record.dateDisplayFormatted = moment.tz(record.dateDisplay, record.timezone).locale('en').format('DD MMM YYYY');
                    record.timeDisplayFormatted = moment.tz(record.dateDisplay, record.timezone).locale('en').format('hh:mm A');
                    record.fullDateDisplayFormatted = moment.tz(record.dateDisplay, record.timezone).locale('en').format('DD MMM YYYY hh:mm A');
                }
            }
            this.sortBy = this.attributesObject.sortBy;
            this.dependencies = this.attributesObject.dependencies;
            this.groupingFields = this.attributesObject.grouping;
            this.groupBy = this.attributesObject.groupBy;
            this.allowSearch = this.attributesObject.allowSearch;
            this.allowDateSearch = this.attributesObject.allowDateSearch;
            this.removeDateMax = this.attributesObject.removeDateMax;
            this.dateSearch = this.attributesObject.dateSearch;
            // this.searchColumn = this.attributesObject.searchColumn;
            this.dataLists = this.attributesObject.data_list ? this.attributesObject.data_list : {};
            this.privilege_types = this.attributesObject.sectionPermissions ? this.attributesObject.sectionPermissions : {};
            this.defaultPermission = this.attributesObject.defaultPermissions ? this.attributesObject.defaultPermissions : {};
            this.tableTitle = this.attributesObject.tableName;
            this.formTitle = this.attributesObject.formTitle;
            this.permissions = this.attributesObject.permissions;
            // this.canAdd = this.permissions.canAdd;
            // this.canUpdate = this.permissions.canUpdate;
            // this.canDelete = this.permissions.canDelete;
            if (this.attributesObject.delete_sentence && this.attributesObject.delete_sentence != '') {
                this.deleteSentence = this.attributesObject.delete_sentence;
            }
            this.actions = this.attributesObject.customActions;
            this.showBackIcon = this.attributesObject.backIcon;
            // this.canView = this.apiUrls[this.routing_params.url].canView;
            this.showTable = true;
            this.showPrivilegesTable = false;
            this.showExtraTable = false;
            this.hideControlButtons = this.attributesObject.hideControlButtons ? true : false;
            // this._communicationService.closeForm();
            if (showSuccessAfterCustom && this.attributesObject.showSentenceOnSuccess) {
                let successSentence = this.attributesObject.sentenceOnSuccess && this.attributesObject.sentenceOnSuccess != '' ? this.attributesObject.sentenceOnSuccess : customActionSentence;
                this._communicationService.showAlert(successSentence);
            }
        }
        this._communicationService.showLoading(false);
    }

    onSave(submittedObj: any): void {
        this._communicationService.showLoading(true);
        let videoContent;
        if (submittedObj.action === 'add') {
            let obj = submittedObj.submittedObj;
            if (obj._id === '') {
                delete obj._id;
                submittedObj.submittedObj = obj;
            }
            let url = this.attributesObject.add_url;
            if (this.id && this.id != '' && this.backSection) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                url += 'id=' + this.id;
            }
            const params = this._handleParams(submittedObj.action, this.attributesObject, submittedObj.submittedObj);
            if (this.attributesObject.upload_video && params[this.attributesObject.upload_tag]) {
                videoContent = params[this.attributesObject.upload_tag];
                delete params[this.attributesObject.upload_tag];
            }
            if (this.attributesObject.upload_movie && params[this.attributesObject.upload_movie_tag]) {
                videoContent = params[this.attributesObject.upload_movie_tag];
                delete params[this.attributesObject.upload_movie_tag];
            }
            this._apiService.sendApi('post', url, params, true, false)
                .subscribe(data => this.responseData = data,
                    (err) => {
                        if (err.status == 460) {
                            if (err.data.error && err.data.error.message && err.data.error.message.data && err.data.error.message.data.message) {
                                this._communicationService.showAlert(err.data.error.message.data.message.en);
                            } else {
                                this._communicationService.showAlert(err.data.error.message);
                            }
                        } else {
                            this._communicationService.showError(err.status);
                        }
                        this._communicationService.showLoading(false);
                    }, () => {
                        this._communicationService.closeForm();
                        if (this.showNotification) {
                            this._communicationService.showLoading(false);
                        } else if (this.attributesObject.upload_video) {
                            this.uploadVideo(videoContent, this.responseData.data.result);
                        } else if (this.attributesObject.upload_movie && videoContent && videoContent.data) {
                            const input = {
                                videoContent: videoContent,
                                selectedId: this.responseData.data.result,
                                upload_movie_tag_name: params[this.attributesObject.upload_movie_tag_name],
                                upload_url: this.attributesObject.upload_url,
                                upload_movie_tag: this.attributesObject.upload_movie_tag,
                                upload_method: this.attributesObject.upload_method
                            };
                            if (this.attributesObject.isUploadEpisode) {
                                input.upload_movie_tag_name = input.selectedId.movieName + ' - Season ' + params.season + ' - Episode ' + params.episodeNumber;
                                input.selectedId = input.selectedId.episodeId;
                            }
                            this._communicationService.showLoading(false);
                            this.uploadMovie(input);
                            this.getTableData();
                        } else {
                            if (this.attributesObject.link === 'mobileUsers') {
                                let successSentence = 'The new password is: ' + this.responseData.passcode;
                                this._communicationService.showAlert(successSentence);
                            }
                            this.getTableData();
                        }
                    });
        } else if (submittedObj.action === 'update') {
            // saveParamSeparated
            const params = this._handleParams(submittedObj.action, this.attributesObject, submittedObj.submittedObj);
            if (this.attributesObject.upload_video && params[this.attributesObject.upload_tag]) {
                videoContent = params[this.attributesObject.upload_tag];
                delete params[this.attributesObject.upload_tag];
            }
            if (this.attributesObject.upload_movie && params[this.attributesObject.upload_movie_tag]) {
                videoContent = params[this.attributesObject.upload_movie_tag];
                delete params[this.attributesObject.upload_movie_tag];
            }
            let url;
            if (this.attributesObject.saveParamSeparated && this.attributesObject.saveParamSeparated === true) {
                url = this.attributesObject.save_url + submittedObj.selectedRecord._id;
            } else if (this.attributesObject.saveParamInQuery && this.attributesObject.saveParamInQuery === true) {
                url = this.attributesObject.save_url + '?_id=' + submittedObj.selectedRecord._id;
                delete params._id;
            } else {
                url = this.attributesObject.save_url;
            }
            if (this.id && this.id != '' && this.backSection) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                url += 'id=' + this.id;
            }
            this._apiService.sendApi('put', url, params, true, false)
                .subscribe(data => this.responseData = data,
                    (err) => {
                        if (err.data.error && err.data.error.message && err.data.error.message.data && err.data.error.message.data.message) {
                            this._communicationService.showAlert(err.data.error.message.data.message.en);
                        } else {
                            this._communicationService.showAlert(err.data.error.message);
                        }
                        this._communicationService.showLoading(false);
                    }, () => {
                        if (this.attributesObject.upload_video && videoContent && videoContent.data) {
                            this.uploadVideo(videoContent, submittedObj.selectedRecord._id);
                        } else if (this.attributesObject.upload_movie && videoContent && videoContent.data) {
                            const input = {
                                videoContent: videoContent,
                                selectedId: submittedObj.selectedRecord._id,
                                upload_movie_tag_name: params[this.attributesObject.upload_movie_tag_name],
                                upload_url: this.attributesObject.upload_url,
                                upload_movie_tag: this.attributesObject.upload_movie_tag,
                                upload_method: this.attributesObject.upload_method
                            };
                            if (this.attributesObject.isUploadEpisode) {
                                input.upload_movie_tag_name = submittedObj.selectedRecord.movie_title_en + ' - Season ' + params.season + ' - Episode ' + params.episodeNumber;
                            }
                            this._communicationService.showLoading(false);
                            this.uploadMovie(input);
                            this._communicationService.closeForm();
                            this.getTableData();
                        } else {
                            this._communicationService.closeForm();
                            this.getTableData();
                        }
                    });
        }

    }

    uploadMovie(input) {
        let moviesArray;
        if (sessionStorage.getItem('moviesArray')) {
            moviesArray = JSON.parse(sessionStorage.getItem('moviesArray'));
        } else {
            moviesArray = [];
        }
        let found = false;
        for (let movie of moviesArray) {
            if (movie['id'] === input.selectedId) {
                movie.status = 'pending';
                found = true;
                break;
            }
        }
        if (!found) {
            moviesArray.push({ id: input.selectedId, name: input.upload_movie_tag_name, state: 'pending' });
        }
        sessionStorage.setItem('moviesArray', JSON.stringify(moviesArray));
        this._communicationService.refreshMovies();
        let videoUploadUrl = input.upload_url;
        if (input.selectedId && input.selectedId != '') {
            if (videoUploadUrl.indexOf('?') < 0) {
                videoUploadUrl += '?';
            } else {
                videoUploadUrl += '&';
            }
            videoUploadUrl += 'id=' + input.selectedId;
        }
        const formData = new FormData();
        formData.append(input.upload_movie_tag, input.videoContent.data);
        let doneResponse;
        this._apiService.sendApi(input.upload_method, videoUploadUrl, formData,
            true, false, null, false, true)
            .subscribe(data => doneResponse = data,
                (err) => {
                    this.updateMovie(input.selectedId, true);
                }, () => {
                    this.updateMovie(input.selectedId, false);
                });
    }

    public updateMovie(movieID, isError) {
        if (sessionStorage.getItem('moviesArray')) {
            let moviesArray2 = JSON.parse(sessionStorage.getItem('moviesArray'));
            for (let i = 0; i < moviesArray2.length; i++) {
                if (moviesArray2[i]['id'] === movieID) {
                    if (isError) {
                        moviesArray2[i].state = 'error';
                    } else {
                        moviesArray2[i].state = 'completed';
                    }
                    sessionStorage.setItem('moviesArray', JSON.stringify(moviesArray2));
                    this._communicationService.refreshMovies();
                    if (isError) {
                        this._communicationService.showAlert('An error occurred while uploading \"' + moviesArray2[i].name + '\"');
                    } else {
                        this._communicationService.showAlert('\"' + moviesArray2[i].name + '\" was successfully uploaded');
                    }
                    break;
                }
            }
        }
    }

    public uploadVideo(videoContent, id) {
        let videoUploadUrl = this.attributesObject.upload_url;
        if (id && id != '') {
            if (videoUploadUrl.indexOf('?') < 0) {
                videoUploadUrl += '?';
            } else {
                videoUploadUrl += '&';
            }
            videoUploadUrl += 'id=' + id;
        }
        const formData = new FormData();
        formData.append(this.attributesObject.upload_movie_tag, videoContent.data);
        this._apiService.sendApi(this.attributesObject.upload_method, videoUploadUrl, formData,
            true, false, null, false, true)
            .subscribe(data => this.responseData = data,
                (err) => {
                    if (err.status == 460) {
                        this._communicationService.showAlert(err.data.error.message.message.en);
                    } else {
                        this._communicationService.showError(err.status);
                    }
                    this._communicationService.showLoading(false);
                }, () => {
                    this._communicationService.closeForm();
                    this.getTableData();
                });
    }

    private _handleParams(action: string, apiConfig, params): any {
        const paramsActionKeys = {
            add: 'add_params',
            update: 'update_params'
        };
        if (action in paramsActionKeys && paramsActionKeys[action] in apiConfig) {
            for (const key in apiConfig['update_params']) {
                if (apiConfig['update_params'].hasOwnProperty(key)) {
                    params[key] = apiConfig['update_params'][key];
                }
            }
        }
        return params;
    }

    onDelete(selectedRows: any[]): void {
        this._communicationService.showLoading(true);

        for (let i = 0; i < selectedRows.length; i++) {
            let _id = selectedRows[i]._id;
            if (this.routing_params.url.indexOf('user') > -1) {
                _id = selectedRows[i]._id;
            }
            let url;
            if (this.attributesObject.saveParamInQuery && this.attributesObject.saveParamInQuery === true) {
                url = this.attributesObject.delete_url + '?_id=' + _id;
            } else {
                url = this.attributesObject.delete_url + '/' + _id;
            }
            if (this.id && this.backSection) {
                if (this.attributesObject.saveParamInQuery && this.attributesObject.saveParamInQuery === true) {
                    url += '&id=' + this.id;
                } else {
                    url += '?id=' + this.id;
                }
            }
            this._apiService.sendApi('delete', url, '', true, true)
                .subscribe(data => this.responseData = data,
                    (err) => {
                        if (err.status == 460) {
                            if (err.data.error && err.data.error.message && err.data.error.message.data && err.data.error.message.data.message) {
                                this._communicationService.showAlert(err.data.error.message.data.message.en);
                            } else {
                                this._communicationService.showAlert(err.data.error.message);
                            }
                        } else {
                            this._communicationService.showError(err.status);
                        }
                        this._communicationService.showLoading(false);
                    }, () => {
                        this._communicationService.closeForm();
                        this.getTableData();
                    });
        }
    }

    public showPdf(linkSource, name) {
        const fileName = name + '.pdf';
        const base64PDF = linkSource.split('data:application/pdf;base64,')[1];
        const binary = atob(base64PDF.replace(/\s/g, ''));
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([view], { type: 'application/pdf' });
        if (window.top.navigator.msSaveOrOpenBlob) {
            window.top.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const downloadLink = document.createElement('a');
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();
        }
    }

    public openPDF(linkSource, name) {
        // const fileName = name + '.pdf';
        const base64PDF = linkSource.split('data:application/pdf;base64,')[1];
        const binary = atob(base64PDF.replace(/\s/g, ''));
        const len = binary.length;
        const buffer = new ArrayBuffer(len);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([view], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        iframe.contentWindow.print();
    }

    public showExcel(buffer, name) {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileName = name + '.xlsx';
        // const base64PDF = linkSource.split('data:application/pdf;base64,')[1];
        // const binary = atob(base64PDF.replace(/\s/g, ''));
        // const len = binary.length;
        // const buffer = new ArrayBuffer(len);
        // const view = new Uint8Array(buffer);
        // for (let i = 0; i < len; i++) {
        //     view[i] = binary.charCodeAt(i);
        // }
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        // if (window.top.navigator.msSaveOrOpenBlob) {
        //     window.top.navigator.msSaveOrOpenBlob(blob, fileName);
        // } else {
        //     const downloadLink = document.createElement('a');
        //     downloadLink.href = linkSource;
        //     downloadLink.download = fileName;
        //     downloadLink.click();
        // }
    }

    onCustomAction(action, acceptActionAgain = false): void {
        this._communicationService.showLoading(true);
        let url;
        if (action.exportPDF || action.exportExcel) {
            url = this.getUrl(action.url);
        } else {
            url = action.url;
        }
        if (this.id && action.addID) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'id=' + this.id;
        }
        let params = action.params;
        if (action.exportPDF) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            if (params && params.users && params.users.length && params.users.length > 0) {
                url += 'isExport=true&records[]=' + params.users;
            } else if (action && action.selectedId) {
                url += 'isExport=true&id=' + action.selectedId;
            } else {
                url += 'isExport=true';
            }

            // params = {};
        }
        if (action.exportExcel) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'isExcel=true&isExport=true';

            if (action.date && action.date.from) {
                url += `&from=${action.date.from}`
            }
            if (action.date && action.date.to) {
                url += `&to=${action.date.to}`
            }
            if (params && params.users) {
                for (let i of params.users) {
                    url += '&records[]=' + i;
                }
            }
        }
        if (acceptActionAgain) {
            params.acceptActionAgain = true;
        }
        this._apiService.sendApi(action.method, url, params, true, false, null, action.exportExcel)
            .subscribe(data => {
                if (action.exportExcel) {
                    saveAs(data.body, action.title + '.xlsx');
                } else {
                    this.responseData = data;
                }
            },
                (err) => {
                    if (err.status == 460) {
                        this._communicationService.showLoading(false);
                        this._communicationService.showAlert(err.data.error.message.data.message.en);
                    } else {
                        this.getPageErrorCallback(err);
                    }
                }, () => {
                    if (action.exportPDF) {
                        this.showPdf(this.responseData.result, action.title);
                        this._communicationService.showLoading(false);
                    }
                    if (action.openPDF) {
                        this._communicationService.showLoading(false);
                        this.openPDF(this.responseData.result, action.title);
                    } else if (action.exportExcel) {
                        this._communicationService.showLoading(false);
                    } else {
                        if (action.permission === 'canRefund' && this.responseData && this.responseData.foundIssuedSeats) {
                            this.selectedAction = action;
                            const sentenceToShow = 'One or more of the tickets that you are trying to refund have already checked in. Are you sure you want to refund them? (' + this.responseData.seatsIssuedString + ')';
                            this._communicationService.showLoading(false);
                            this._communicationService.showPopupWithCallback(sentenceToShow, 'acceptRefund');
                        } else {
                            this._communicationService.closeForm();
                            this.getTableData(true);
                        }
                    }
                });
    }

    onColumnAction(rowAction): void {
        this._communicationService.showLoading(true);
        this._apiService.sendApi(rowAction.columnInfo.button_action.method, rowAction.columnInfo.button_action.url, rowAction.params, true, false)
            .subscribe(data => this.responseData = data,
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    if (rowAction.columnInfo.button_action.id === 'generatePass' && this.responseData.passcode) {
                        let successSentence = 'The new password is: ' + this.responseData.passcode;
                        this._communicationService.showAlert(successSentence);
                    }
                    this._communicationService.closeForm();
                    this.getTableData(true);
                });

    }

    _getExtraData(item, index, length, extraTable = false, extraTableElement = null) {
        this._communicationService.showLoading(true);
        let url = item.url;
        if (this.id && this.backSection) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'id=' + this.id;
        }
        this._apiService.sendApi('get', url, '', true, false)
            .subscribe(data => this.extraDataResponse = data,
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    if (this.extraDataResponse) {
                        if (item.CMSFormat) {
                            this.extraDataResponse = this.extraDataResponse.data.result ? this.extraDataResponse.data.result : [];
                        }
                        if (item.resultIn) {
                            this.extraDataOptions[item.data_id] = this.extraDataResponse;
                            this.extraDataOptionsTexts[item.data_id] = {};
                        } else {
                            this.extraDataOptions[item.data_id] = [];
                            this.extraDataOptionsTexts[item.data_id] = {};
                            for (const item2 of this.extraDataResponse) {
                                let option = {};
                                option[item.text_to_display] = item2[item.text_label];
                                option[item.value_label_to_display] = item2[item.value_label];
                                this.extraDataOptions[item.data_id].push(option);
                                this.extraDataOptionsTexts[item.data_id][item2[item.value_label]] = item2[item.text_label];
                            }
                        }

                        if (index === length) {
                            if (this.showNotification) {
                                this.setTableColumns();
                            } else {
                                if (extraTable) {
                                    this.setExtraDataTable(extraTableElement);
                                } else {
                                    this.getTableData();
                                }

                            }
                        }
                    }
                });
    }

    getPrivileges(ObjData): void {
        if (ObjData.type == 'update') {
            this.responseDataPrivileges = ObjData.data.permissions;
        } else {
            this.responseDataPrivileges = this.defaultPermission;
        }
        this.setPrivilegesTable();
    }

    getExtraTablee(data): void {
        let type = data.type;
        delete data.type;
        this.extraTableArray = [];
        if (type === 'update') {
            this.extraTableData = {};
            this.extraTableApis.forEach(extraTableElement => {
                if (extraTableElement.get_from_table && extraTableElement.get_from_table === true) {
                    this.extraTableData[extraTableElement.param_id] = [];
                    this.extraTableData[extraTableElement.param_id] = data[extraTableElement.param_id];
                }
                if (extraTableElement.extraData && extraTableElement.extraData.length > 0) {
                    let index = 0;
                    for (let item of extraTableElement.extraData) {
                        index++;
                        this._getExtraData(item, index, extraTableElement.extraData.length, true, extraTableElement);
                    }
                } else {
                    this.setExtraDataTable(extraTableElement);
                }
            });
        } else {
            this.extraTableApis.forEach(extraTableElement => {
                this.extraTableData = [];
                if (extraTableElement.extraData && extraTableElement.extraData.length > 0) {
                    let index = 0;
                    for (let item of extraTableElement.extraData) {
                        index++;
                        this._getExtraData(item, index, extraTableElement.extraData.length, true, extraTableElement);
                    }
                } else {
                    this.setExtraDataTable(extraTableElement);
                }
            });
        }

    }

    // formatPrivileges(profileID) {
    //   let newResponsePrivi = [];
    //   for (let permission of this.responseDataPrivileges) {
    //     if (permission.profile_id === profileID) {
    //       newResponsePrivi.push(permission);
    //     }
    //   }
    //   this.responseDataPrivileges = newResponsePrivi;
    // }

    // getTypes(): void {
    //   this._communicationService.showLoading(true);
    //   this._apiService.sendApi('get', this.apiUrls[this.routing_params.url].get_types_url, '', true, false)
    //     .subscribe(data => this.typesData = data,
    //       (err) => {
    //         this.getPageErrorCallback(err);
    //       }, () => {
    //         let options = [];
    //         if (this.typesData) {
    //           for (const item of this.typesData) {
    //             let option = {
    //               text: item.type.en,
    //               value: item._id
    //             };
    //             options.push(option);
    //           }
    //           this.typesOption = options;
    //           this.setTableColumns();
    //         }
    //       });
    // }

    // private _getUsersData(): void {
    //   this._communicationService.showLoading(true);
    //   this._apiService.sendApi('get', this.apiUrls[this.routing_params.url].get_profiles_url, '', true, false)
    //     .subscribe((data) => {
    //         if (data && Array.isArray(data)) {
    //           this.usersProfilesOption = data;
    //         } else {
    //           this.usersProfilesOption = [];
    //         }
    //
    //         this.setTableColumns();
    //       },
    //       (err) => {
    //         this.getPageErrorCallback(err);
    //       }, () => {
    //         this._communicationService.showLoading(false);
    //         this.getTableData();
    //       });
    // }

    setPrivilegesTable(): void {
        this.rolesPrivileges = {};
        if (this.responseDataPrivileges) {
            this.rolesPrivileges.fields = [], this.rolesPrivileges.fields_add = [], this.rolesPrivileges.columns = [],
                this.rolesPrivileges.fieldsOrder = [], this.rolesPrivileges.data = [];
            let columnsFilling = this.fillColumns(this.extraTableAttributes.fields);
            this.rolesPrivileges.fields = columnsFilling.columns ? columnsFilling.columns : [];

            this.rolesPrivileges.fields_add =
                columnsFilling.columns_add ?
                    columnsFilling.columns_add : [];
            for (let i = 0; i < this.rolesPrivileges.fields.length; i++) {
                let columnObj =
                {
                    name: this.rolesPrivileges.fields[i].identifier,
                    label: this.rolesPrivileges.fields[i].label,
                    hidden: this.rolesPrivileges.fields[i].table_hidden ? this.rolesPrivileges.fields[i].table_hidden : this.rolesPrivileges.fields[i].hidden,
                    type: this.rolesPrivileges.fields[i].type,
                    sortable: true,
                    tooltip: this.rolesPrivileges.fields[i].label,
                    numeric: false,
                    filter: true
                };
                let orderObj = {};
                orderObj[this.rolesPrivileges.fields[i].identifier] = this.rolesPrivileges.fields[i].order;
                this.rolesPrivileges.columns.push(columnObj);
                this.rolesPrivileges.fieldsOrder.push(orderObj);
            }
            this.rolesPrivileges.data = this.responseDataPrivileges;
            this.rolesPrivileges.sortBy = this.extraTableAttributes.sortBy;
            this.rolesPrivileges.validation = this.validation;
            this.rolesPrivileges.tableTitle = this.extraTableAttributes.tableName;
            this.rolesPrivileges.canAdd = false;
            this.rolesPrivileges.canUpdate = true;
            this.rolesPrivileges.canDelete = false;
            this.rolesPrivileges.canExport = false;
            this.showPrivilegesTable = true;
        }
        this._communicationService.showLoading(false);
    }

    setExtraDataTable(extraTableElement = null): void {
        let extraTable: any = {};
        extraTable.fields = [], extraTable.fields_add = [], extraTable.columns = [],
            extraTable.fieldsOrder = [], extraTable.data = [], extraTable.columnSearch = [];
        let columnsFilling = this.fillColumns(extraTableElement.fields);
        extraTable.fields = columnsFilling.columns ? columnsFilling.columns : [];
        extraTable.fields_add = columnsFilling.columns_add ? columnsFilling.columns_add : [];
        for (let j = 0; j < extraTable.fields_add.length; j++) {
            if ((extraTable.fields_add[j].type === 'dropdown' || extraTable.fields_add[j].type === 'multi-select' || extraTable.fields_add[j].type === 'chip-select') && this.extraDataOptions[extraTable.fields_add[j].identifier]) {
                if (!extraTable.fields_add[j].options || extraTable.fields_add[j].options.length === 0) {
                    extraTable.fields_add[j].options = this.extraDataOptions[extraTable.fields_add[j].identifier];
                    extraTable.fields_add[j].options_text = this.extraDataOptionsTexts[extraTable.fields_add[j].identifier];
                }
            }
            if ((extraTable.fields_add[j].type === 'seat-selector')) {
                extraTable.fields_add[j].options = this.extraDataOptions[extraTable.fields_add[j].identifier];
                extraTable.fields_add[j].options_text = this.extraDataOptionsTexts[extraTable.fields_add[j].identifier];
            }
        }
        for (let i = 0; i < extraTable.fields.length; i++) {
            if ((extraTable.fields[i].type === 'dropdown' || extraTable.fields[i].type === 'multi-select' || extraTable.fields[i].type === 'chip-select') && this.extraDataOptions[extraTable.fields[i].identifier]) {
                if (!extraTable.fields[i].options || extraTable.fields[i].options.length === 0) {
                    extraTable.fields[i].options = this.extraDataOptions[extraTable.fields[i].identifier];
                    extraTable.fields[i].options_text = this.extraDataOptionsTexts[extraTable.fields[i].identifier];
                }
            }
            if ((extraTable.fields[i].type === 'seat-selector')) {
                extraTable.fields[i].options = this.extraDataOptions[extraTable.fields[i].identifier];
                extraTable.fields[i].options_text = this.extraDataOptionsTexts[extraTable.fields[i].identifier];
            }
            let columnObj =
            {
                name: extraTable.fields[i].identifier,
                identifier: extraTable.fields[i].identifier,
                required: extraTable.fields[i].required,
                label: extraTable.fields[i].label,
                hidden: extraTable.fields[i].table_hidden ? extraTable.fields[i].table_hidden : extraTable.fields[i].hidden,
                type: extraTable.fields[i].type,
                sortable: true,
                tooltip: extraTable.fields[i].label,
                numeric: false,
                filter: true,
                options: extraTable.fields[i].options ? extraTable.fields[i].options : null,
                options_text: extraTable.fields[i].options_text ? extraTable.fields[i].options_text : null,
                editable: !extraTable.fields[i].readonly,
            };
            let orderObj = {};
            orderObj[extraTable.fields[i].identifier] = extraTable.fields[i].order;
            extraTable.columns.push(columnObj);
            extraTable.fieldsOrder.push(orderObj);
            extraTable.columnSearch.push(extraTable.fields[i].identifier);
        }
        extraTable.data = this.extraTableData[extraTableElement.param_id] ? this.extraTableData[extraTableElement.param_id] : [];
        extraTable.showExtraTableError = false;
        for (let row of extraTable.data) {
            if (row['image']) {
                row['image'] = { value: 'data:image/jpeg;base64,' + row['image'] };
            } else {
                row['image'] = { value: '' };
            }
        }
        // this.extraTable.tableIndex = index;
        extraTable.columnCount = extraTable.columns.length + 1;
        extraTable.sortBy = extraTableElement.sortBy;
        extraTable.validation = this.validation;
        extraTable.tableTitle = extraTableElement.tableName;
        extraTable.required = extraTableElement.required;
        extraTable.get_from_table = extraTableElement.get_from_table;
        extraTable.param_id = extraTableElement.param_id;
        extraTable.canAdd = extraTableElement.sectionPermissions.canAdd;
        extraTable.canUpdate = extraTableElement.sectionPermissions.canUpdate;
        extraTable.canDelete = extraTableElement.sectionPermissions.canDelete;
        extraTable.canExport = extraTableElement.sectionPermissions.canExport;
        if (extraTable.canDelete) {
            extraTable.columnCount++;
        }
        extraTable.columnCount = parseInt(extraTable.columnCount);
        extraTable.get_column_identifier = extraTableElement.get_column_identifier;
        this.extraTableArray.push(extraTable);
        this.showExtraTable = true;
        this._communicationService.showLoading(false);
    }

    getUsersByGroup(sectionObj) {
        this._communicationService.showLoading(true);
        this._apiService.sendApi('get', this.apiUrls[this.routing_params.url].get_app_user_by_group_url + '?' + sectionObj.section + '=' + sectionObj.value, '', true, false)
            .subscribe(data => this.usersByGroupData = data,
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    let valueToSet = [];
                    for (let user of this.usersByGroupData) {
                        valueToSet.push(user.email);
                    }
                    for (let i = 0; i < this.fields.length; i++) {
                        if (this.fields[i].type == 'chip-select' && this.fields[i].identifier == 'email') {
                            this.fields[i].value = valueToSet;
                        }
                    }
                    this._communicationService.showLoading(false);
                });
    }

    loadMorePages(event) {
        this.seniority = [];
        this.skills = [];
        let callGetTable = false;
        // let previousSession = sessionStorage.getItem(this.routing_params.url);
        // previousSession = JSON.parse(previousSession);
        if ((this.currentPage !== event.currentPage || this.limitMaxPage !== event.limitMax)) {
            this.currentPage = event.currentPage;
            this.limitMaxPage = event.limitMax;
            sessionStorage.removeItem(this.routing_params.url);
            // this.getTableData();
            callGetTable = true;
        }
        if ((event.searchWord && event.searchWord !== '') || (this.searchWord && this.searchWord !== '')) {
            this.searchWord = event.searchWord;
            if (!event.searchWord || event.searchWord === '') {
                this.startSearch = false;
            } else {
                this.startSearch = true;
            }
            // this.getTableData();
            callGetTable = true;
        }
        if ((event.seniority && event.seniority.length > 0)) {
            this.seniority = event.seniority;
            this.startSearch = true;
            // this.getTableData();
            callGetTable = true;
        }
        if ((event.skills && event.skills.length > 0)) {
            this.skills = event.skills;
            this.startSearch = true;
            // this.getTableData();
            callGetTable = true;
        }
        if (event.sort && event.sort.sortField) {
            this.sort = event.sort;
            this.startSort = true;
            callGetTable = true;
        }
        if (event.dateFilter && event.dateFilter.dateField) {
            this.dateFilter = event.dateFilter;
            this.startDateFilter = true;
            callGetTable = true;
        }
        if (event.customFilters) {
            this.customFilters = event.customFilters;
            this.startCustomFilter = true;
            let sessionForCurrentRoute = sessionStorage.getItem(this.routing_params.url + '-search') ? JSON.parse(sessionStorage.getItem(this.routing_params.url + '-search')) : {};
            sessionForCurrentRoute.customFilters = this.customFilters;
            sessionStorage.setItem(this.routing_params.url + '-search', JSON.stringify(sessionForCurrentRoute));
            callGetTable = true;
        }
        if (event.filters && Object.keys(event.filters).length > 0) {
            this.filters = event.filters;
            this.startColumnSearch = true;
            callGetTable = true;
        } else if (this.startColumnSearch) {
            callGetTable = true;
        }
        if (callGetTable === true) {
            this.getTableData();
        }
    }

    public ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData['notifyComponent'] === 'app-pageview' && this.subscriptionData['action'] === 'callback') {
                if (this.subscriptionData['type'] === 'acceptRefund') {
                    this.onCustomAction(this.selectedAction, true);
                }
            }
        }
    }
}
