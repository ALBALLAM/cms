import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Validation } from "../Validations";
import { FormUtilsService } from "../form-utils/form-utils.service";
import { CommunicationService } from "../communication/communication.service";
import { ApiService } from "../api/api.service";
import { VideoDialogComponent } from "../video-dialog/video-dialog.component";
import { MatDialog } from "@angular/material";
import { Route, Router } from "@angular/router";

@Component({
    selector: 'app-widget-form',
    templateUrl: './widget-form.component.html',
    styleUrls: ['./widget-form.component.scss']
})
export class WidgetFormComponent implements OnInit {
    @Input() public widgetConfiguration;
    @Input() public isAdd;
    @Input() public clickedRow = {};
    @Input() manageFields: any;
    @Input() pageUrl: string;
    @Input() formTitle: string;
    @Input() showUpdateButtons: boolean;
    @Input() saveAlert: string;
    public validation = Validation;
    public fields;
    public columns;
    public step;
    public stepsArray = [];
    public showForm: boolean;
    public showTable: boolean;
    public showPreview: boolean;
    public tableSelectedRows: any = [];
    public currentConfig: any;
    public previewData = {};
    public previewDataArray = [];
    public fieldsOrder: any = [];
    extraDataResponse: any;
    extraDataOptions = {};
    extraDataOptionsTexts = {};
    startSearch: boolean = false;
    searchWord: string = "";
    showEmptyTableError: string = "";
    currentPage: number = 1;
    firstTablePage: number = 0;
    limitMaxPage: number = 10;
    searchFields: string;
    startSort: boolean = false;
    startColumnSearch: boolean = false;
    filters: object;
    headers: any;
    responseData: any;
    totalRecords: number;
    allowPagination: boolean;
    isDirectSave: boolean;
    disableSaveButton: boolean;
    disableSaveButtonStep: number;
    sort: {
        sortField: '',
        sortOrder: 1
    };
    @ViewChild('myappfrm') child;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveData: EventEmitter<any> = new EventEmitter<any>();

    constructor(private formUtils: FormUtilsService, private _communicationService: CommunicationService, private _apiService: ApiService,
        private _dialog: MatDialog, private _router: Router) {
    }

    ngOnInit() {
        if (this.isAdd) {
            this.clickedRow = {};
        }
        this.previewData = {};
        this.stepsArray = [];
        if (!this.isAdd && !this.showUpdateButtons) {
            this._communicationService.showLoading(true);
            this.handleFinalForm(1);
        } else {
            this.handleNextStep(1);
        }
    }

    handleNextStep(step, isNext = true) {
        this.step = step;
        if (isNext) {
            this.stepsArray.push(step);
        }
        this.currentConfig = this.widgetConfiguration['step_' + this.step];
        if (this.currentConfig.next_dependency && this.clickedRow[this.currentConfig.next_dependency] && !this.disableSaveButton) {
            this.currentConfig.oldDependencyValue = this.clickedRow[this.currentConfig.next_dependency];
        }
        if (this.currentConfig.type === 'form') {
            if (this.currentConfig.extraData && this.currentConfig.extraData.length > 0) {
                let index = 0;
                for (let item of this.currentConfig.extraData) {
                    index++;
                    this._getExtraData(item, index, this.currentConfig.extraData.length, isNext);
                }
            } else {
                this.fields = this.currentConfig.fields;
                this.prepareFields(isNext);
                this.showForm = true;
                this.showTable = false;
                this.showPreview = false;
            }
        } else if (this.currentConfig.type === 'table') {
            this.columns = this.currentConfig.columns;
            this.prepareTable();
            this.getTableData(this.currentConfig, isNext);
        }
    }

    prepareFields(isNext) {
        let orderObj = {};
        for (let field of this.fields) {
            if (this.clickedRow[field.identifier]) {
                field.value = this.clickedRow[field.identifier];
            } else {
                field.value = '';
            }
            if ((field.type === 'dropdown' || field.type === 'multi-select') && this.extraDataOptions[field.identifier]) {
                field.options = this.extraDataOptions[field.identifier];
            }
            orderObj[field.identifier] = field.order;
            this.fieldsOrder.push(orderObj);
        }
    }

    prepareTable() {
        let searchFields = [];
        this.tableSelectedRows = [];
        for (let column of this.columns) {
            if (!column.hidden) {
                searchFields.push(column.name);
            }
        }
        this.searchFields = searchFields.join();
        if (this.clickedRow[this.currentConfig.field_identifier]) {
            if (this.currentConfig.singleSelection) {
                this.tableSelectedRows = this.clickedRow[this.currentConfig.field_identifier][0];
            } else {
                this.tableSelectedRows = this.clickedRow[this.currentConfig.field_identifier];
            }
        }
    }

    onRowSelection(selectedRows) {
        if (this.currentConfig.singleSelection && !selectedRows) {
            this.tableSelectedRows = {};
        } else {
            this.tableSelectedRows = selectedRows;
        }
    }

    handleBack(isPreview = false) {
        this.showEmptyTableError = '';
        if (isPreview) {
            this.columns = this.currentConfig.columns;
            this.showPreview = false;
            if (this.currentConfig.type === 'form') {
                this.showForm = true;
            } else {
                this.prepareTable();
                if (this.isDirectSave) {
                    this.getTableData(this.currentConfig);
                } else {
                    this.showTable = true;
                }
            }
        } else {
            let dataToRemove = this.stepsArray.pop();
            delete this.previewData[dataToRemove];
            this.showForm = false;
            this.fieldsOrder = [];
            this.fields = [];
            setTimeout(() => {
                this.handleNextStep(this.stepsArray[this.stepsArray.length - 1], false);
            }, 100);
        }
    }

    onSave(isDirectSave) {
        this.isDirectSave = isDirectSave;
        this.showEmptyTableError = '';
        this.previewData[this.step] = {
            data: [],
            step_title: this.currentConfig.step_title,
            step_type: this.currentConfig.type,
        };
        if (this.currentConfig.type === 'form') {
            if (this.child.validateGroup(true, false)) {
                const params = this.formUtils.getGroupFields(this.child);
                console.log('this.child', this.child)
                this.handleFormFilling(params, isDirectSave);
            }
        } else {
            if ((!this.currentConfig.singleSelection && this.tableSelectedRows.length > 0) ||
                (this.currentConfig.singleSelection && Object.keys(this.tableSelectedRows).length > 0)) {
                if (this.currentConfig.singleSelection) {
                    const element = this.tableSelectedRows;
                    this.tableSelectedRows = [element];
                }
                if (this.currentConfig.fillTableFromTag && this.currentConfig.field_identifier) {
                    this.handleTableFilling(this.tableSelectedRows, isDirectSave);
                }
            } else {
                this.showEmptyTableError = 'Please Select at least one record';
            }
        }
    }

    handleFormFilling(params, isView) {
        for (let field of this.fields) {
            console.log(this.fields)
            let previewOptions = [];
            if (field.type === 'dropdown' || field.type === 'multi-select') {
                for (let option of field.options) {
                    if (params[field.identifier].indexOf(option.id) > -1) {
                        previewOptions.push(option);
                    }
                }
            }
            this.clickedRow[field.identifier] = params[field.identifier];
            this.previewData[this.step].data.push({
                displayName: field.label,
                type: field.type,
                options: field.options,
                identifier: field.identifier,
                value: (field.identifier in params) ? params[field.identifier] : '',
                previewValue: previewOptions
            })
        }
        if (this.currentConfig.next_dependency && this.clickedRow[this.currentConfig.next_dependency]) {
            if (this.currentConfig.next[this.clickedRow[this.currentConfig.next_dependency]]) {
                if (this.currentConfig.oldDependencyValue === params[this.currentConfig.next_dependency]) {
                    this.disableSaveButton = false;
                } else {
                    this.disableSaveButton = true;
                    this.disableSaveButtonStep = this.step;
                }
                if (isView) {
                    if (this.disableSaveButton) {
                        this._communicationService.showAlert(this.saveAlert ? this.saveAlert : 'Cannot Save');
                    } else {
                        this.handleFinalForm(this.currentConfig.next[this.clickedRow[this.currentConfig.next_dependency]])
                    }
                } else {
                    this.showForm = false;
                    this.fieldsOrder = [];
                    this.fields = [];
                    setTimeout(() => {
                        this.handleNextStep(this.currentConfig.next[params[this.currentConfig.next_dependency]]);
                    }, 100);
                }
            } else {
                // todo remove this condition and direct route to preparePreviewData function if we need to save and review
                if (this.isDirectSave) {
                    this.submitData();
                } else {
                    this.preparePreviewData();
                }
            }
        } else if (this.currentConfig.next) {
            if (isView) {
                this.handleFinalForm(this.currentConfig.next);
            } else {
                this.showForm = false;
                this.fieldsOrder = [];
                this.fields = [];
                setTimeout(() => {
                    this.handleNextStep(this.currentConfig.next);
                }, 100);
            }
        } else {
            // todo remove this condition and direct route to preparePreviewData function if we need to save and review
            if (this.isDirectSave) {
                this.submitData();
            } else {
                this.preparePreviewData();
            }
        }
    }

    handleTableFilling(tableSelectedRows, isView) {
        let previewOptions = [];
        let idValue = [];
        for (let row of tableSelectedRows) {
            idValue.push(row[this.currentConfig.fillTableFromTag]);
            previewOptions.push({
                id: row[this.currentConfig.fillTableFromTag],
                value: row[this.currentConfig.fillPreviewFromTag],
                image: row[this.currentConfig.fillPreviewImageFromTag],
                video: row[this.currentConfig.fillPreviewVideoFromTag]
            })
        }
        this.clickedRow[this.currentConfig.field_identifier] = tableSelectedRows;
        this.previewData[this.step].data.push({
            displayName: this.currentConfig.field_label,
            type: 'table',
            identifier: this.currentConfig.field_identifier,
            value: tableSelectedRows,
            idValue: idValue,
            previewValue: previewOptions
        });
        if (this.currentConfig.next) {
            if (isView) {
                this.handleFinalForm(this.currentConfig.next);
            } else {
                this.showTable = false;
                this.columns = [];
                this.searchFields = '';
                setTimeout(() => {
                    this.handleNextStep(this.currentConfig.next);
                }, 100);
            }
        } else {
            // todo remove this condition and direct route to preparePreviewData function if we need to save and review
            if (this.isDirectSave) {
                this.submitData();
            } else {
                this.preparePreviewData();
            }
        }
    }

    preparePreviewData() {
        this.previewDataArray = [];
        for (let step in this.previewData) {
            let fieldsArray = [];
            let orderArray = [];
            let orderObj = {};
            let index = 1;
            if (this.previewData[step].step_type === 'form') {
                for (let data of this.previewData[step].data) {
                    if (data.required || (!data.required && data.value !== '')) {
                        fieldsArray.push({
                            identifier: data.identifier,
                            type: data.type,
                            value: data.value,
                            options: data.options,
                            label: data.displayName,
                            required: true,
                            readonly: true,
                            order: index
                        });
                        orderObj[data.identifier] = index;
                        index++;
                        orderArray.push(orderObj);
                    }
                }
                this.previewData[step].fields = fieldsArray;
                this.previewData[step].fieldsOrder = orderArray;
            } else {
                this.previewData[step].tableArray = this.previewData[step].data[0].previewValue;
            }
            this.previewDataArray.push(this.previewData[step]);
        }
        this._communicationService.showLoading(false);
        this.showPreview = true;
        this.showTable = false;
        this.showForm = false;
    }

    handleFinalForm(stepNumber) {
        this.step = stepNumber;
        this.stepsArray.push(stepNumber);
        this.currentConfig = this.widgetConfiguration['step_' + stepNumber];
        if (this.currentConfig.next_dependency && this.clickedRow[this.currentConfig.next_dependency] && !this.disableSaveButton) {
            this.currentConfig.oldDependencyValue = this.clickedRow[this.currentConfig.next_dependency];
        }
        this.fields = this.currentConfig.fields;
        this.previewData[this.step] = {
            step_title: this.currentConfig.step_title,
            step_type: this.currentConfig.type,
            data: []
        };
        if (this.currentConfig.type === 'form') {
            if (this.currentConfig.extraData && this.currentConfig.extraData.length > 0) {
                let index = 0;
                for (let item of this.currentConfig.extraData) {
                    index++;
                    this._getExtraData(item, index, this.currentConfig.extraData.length, false, true);
                }
            } else {
                this.handleFormFilling(this.clickedRow, true);
            }
        } else {
            if (this.currentConfig.fillTableFromTag && this.currentConfig.field_identifier) {
                this.handleTableFilling(this.clickedRow[this.currentConfig.field_identifier], true);
            }
        }
    }

    closeForm() {
        this.eventEmitter.emit('closeForm');
    }

    _getExtraData(item, index, length, isNext, isView = false) {
        this._communicationService.showLoading(true);
        let url = item.url;
        this._apiService.sendApi('get', url, '', true, false)
            .subscribe(data => this.extraDataResponse = data,
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    if (this.extraDataResponse) {
                        if (item.CMSFormat) {
                            this.extraDataResponse = this.extraDataResponse.data.result ? this.extraDataResponse.data.result : [];
                        }
                        this.extraDataOptions[item.data_id] = [];
                        this.extraDataOptionsTexts[item.data_id] = {};
                        for (const item2 of this.extraDataResponse) {
                            let option = {};
                            option[item.text_to_display] = item2[item.text_label];
                            option[item.value_label_to_display] = item2[item.value_label];
                            this.extraDataOptions[item.data_id].push(option);
                            this.extraDataOptionsTexts[item.data_id][item2[item.value_label]] = item2[item.text_label];
                        }
                        if (index === length) {
                            if (isView) {
                                for (let field of this.currentConfig.fields) {
                                    if ((field.type === 'dropdown' || field.type === 'multi-select') && this.extraDataOptions[field.identifier]) {
                                        field.options = this.extraDataOptions[field.identifier];
                                    }
                                }
                                this.fields = this.currentConfig.fields;
                                this.handleFormFilling(this.clickedRow, true);
                            } else {
                                this.fields = this.currentConfig.fields;
                                this.prepareFields(isNext);
                                this._communicationService.showLoading(false);
                                this.showForm = true;
                            }
                        }
                    }
                });
    }

    loadMorePages(event) {
        if ((this.currentPage !== event.currentPage || this.limitMaxPage !== event.limitMax)) {
            this.currentPage = event.currentPage;
            this.limitMaxPage = event.limitMax;
            this.getTableData(this.currentConfig);
        } else if ((event.searchWord && event.searchWord !== '') || (this.searchWord && this.searchWord !== '')) {
            this.searchWord = event.searchWord;
            this.startSearch = true;
            this.getTableData(this.currentConfig);
        } else if (event.sort && event.sort.sortField) {
            this.sort = event.sort;
            this.startSort = true;
            this.getTableData(this.currentConfig);
        } else if (event.filters && Object.keys(event.filters).length > 0) {
            this.filters = event.filters;
            this.startColumnSearch = true;
            this.getTableData(this.currentConfig);
        }
    }

    getTableData(tableConfig, isNext = true): void {
        this._communicationService.showLoading(true);
        let url;
        if (tableConfig.allowPagination) {
            if (this.startSearch) {
                url = tableConfig.get_url
                    + '?page=' + this.currentPage + '&limit=' + this.limitMaxPage + '&search=' + encodeURIComponent(this.searchWord) +
                    '&searchFields=' + this.searchFields;
            } else {
                url = tableConfig.get_url + '?page=' + this.currentPage
                    + '&limit=' + this.limitMaxPage;
            }
        } else {
            if (this.startSearch) {
                url = tableConfig.get_url
                    + '?search=' + encodeURIComponent(this.searchWord);
            } else {
                url = tableConfig.get_url;
            }
        }
        if (this.startSort) {
            url += '&sortField=' + this.sort.sortField + '&sortOrder=' + this.sort.sortOrder;
        }
        if (this.startColumnSearch) {
            for (let x = 0; x < Object.keys(this.filters).length; x++) {
                url += '&column_' + Object.keys(this.filters)[x] + '=' + this.filters[Object.keys(this.filters)[x]].value;
            }
        }
        this._apiService.sendApi('get', url, '', true, false)
            .subscribe(response => {
                if (tableConfig.CMSFormat) {
                    response = response.data.result ? response.data.result : tableConfig.allowPagination ? {
                        data: [],
                        totalPages: 1
                    } : [];
                }
                this.responseData = tableConfig.allowPagination ? response.data : response;
                this.headers = response.headers;
                this.totalRecords = tableConfig.allowPagination ? (response.totalPages * this.limitMaxPage) : null;
                this.allowPagination = tableConfig.allowPagination;
            },
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    this.showTable = true;
                    this.showForm = false;
                    this.showPreview = false;
                    this._communicationService.showLoading(false);
                });
        this.startSearch = false;
    }

    submitData() {
        let submitData = {};
        for (let step in this.previewData) {
            for (let field of this.previewData[step].data) {
                if (field.type === 'table') {
                    submitData[field.identifier] = field.idValue
                } else {
                    submitData[field.identifier] = field.value
                }
            }
        }
        this.saveData.emit({ data: submitData, isAdd: this.isAdd });
    }

    public openVideoPopUp(video_src): void {
        event.stopPropagation();
        this._dialog.open(VideoDialogComponent, {
            data: {
                src: video_src
            }
        });
    }

    public routeToManageFields(link, id, selectedRowData) {
        const params = {
            url: '/' + link,
            previousUrl: this._router.url,
            id: id,
            selectedRowData: selectedRowData
        };
        this._setPagingSession(id, selectedRowData);
        sessionStorage.setItem('routing-params', JSON.stringify(params));
        this._router.navigate(['/' + link]);
    }

    private _setPagingSession(selectedRow = null, selectedRowData = null) {
        const params = {
            page: this.currentPage,
            selectedRow: selectedRow,
            selectedRowData: selectedRowData
        };
        sessionStorage.setItem(this.pageUrl, JSON.stringify(params));
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }
}
