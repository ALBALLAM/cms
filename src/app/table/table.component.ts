import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    AfterViewInit, SimpleChange, SimpleChanges
} from '@angular/core';
import { Column } from '../pageview/pageview';
import { FormUtilsService } from '../form-utils/form-utils.service';
import { Router } from '@angular/router';
import { CommunicationService } from '../communication/communication.service';
import { Subscription } from 'rxjs/index';
import { customActionSentence } from '../globalVariables';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'app-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {

    @Input() canView: boolean;
    @Input() canAdd: boolean;
    @Input() canUpdate: boolean;
    @Input() canDelete: boolean;
    @Input() manageFields: any;
    @Input() permissions: any;
    @Input() actions: any;
    @Input() showManageFields: boolean;
    @Input() showBackIcon: boolean;
    @Input() tableTitle: string;
    @Input() formTitle: string;
    @Input() backUrl: string;
    @Input() deleteSentence: string;
    @Input() tableRowHeight: string;
    @Input() backSection: any;
    @Input() fields: Column[];
    @Input() fields_add: Column[];
    @Input() fieldsOrder: any[];
    @Input() validation: any[];
    @Input() dataLists: any[];
    @Input() privilege_types: any;
    @Input() sortBy: string;
    @Input() data: any[] = [];
    @Input() columns: any[] = [];
    @Input() showPrivilegesTable: boolean;
    @Input() rolesPrivileges: any;
    @Input() groupingFields: boolean;
    @Input() groupBy: string;
    @Input() selectedId: string;
    @Input() showNotification: boolean;
    @Input() showDashboard: boolean;
    @Input() showWidgetCards: boolean;
    @Input() pageUrl: string;
    @Input() hasExtraTable: boolean;
    @Input() showExtraTable: boolean;
    @Input() extraTable: any;
    @Input() hideControlButtons: boolean;
    @Input() usePagination: boolean;
    @Input() useSearch: boolean;
    @Input() allowDateSearch: boolean;
    @Input() removeDateMax: boolean;
    @Input() allowCustomFilter: boolean;
    @Input() dateSearch: any;
    @Input() filterSearch: any;
    @Input() maxPageLimit: number;
    @Input() totalRecords: number;
    @Input() totalCount: number;
    @Input() previousSessionRow;
    @Input() firstTablePage: number;
    @Input() headers: any;
    @Input() tableHeaders: any;
    @Input() showWidgetForm: boolean;
    @Input() showWidgetOnUpdate: boolean;
    @Input() saveWidgetFormAlert: boolean;
    @Input() widgetConfiguration: any;
    @Input() isWidgetAdd: boolean;
    @Input() showTableWidgetForm: boolean;
    @Input() dependencies: any;
    @Input() allowOneAdd: boolean;
    @Output() deleteItem = new EventEmitter<any>();
    @Output() saveItem = new EventEmitter<any>();
    @Output() privileges = new EventEmitter<any>();
    @Output() getExtraTablee = new EventEmitter<any>();
    @Output() getUsersByGroup = new EventEmitter<any>();
    @Output() loadMorePages = new EventEmitter<any>();
    @Output() customActionEmitter = new EventEmitter<any>();
    @Output() columnActionEmitter = new EventEmitter<any>();

    @ViewChild('myappfrm') child;
    @ViewChild('myactionfrm') actionForm;

    showNewPage: boolean;
    showExtraTableError: boolean;
    extraTableError: string;
    expandedItems: any = [];
    showAddEditForm: boolean;
    selectedRows: any[] = [];
    nbSelectedRows: number;
    multiple: boolean = true;
    sortable: boolean = true;
    showTableForm: boolean = true;
    showDeleteBtn: boolean = false;
    selectedRecords: any;
    showForm: boolean = false;
    addNewButton: boolean = false;
    showUpdateForm: boolean = false;
    clickedRow: any = {};
    clickedRowWidget: any = {};
    showTableDiv: boolean;
    showEditDiv: boolean;
    currentPage: number = 1;
    searchWord: string;
    sortField: string;
    filters: object;
    sortOrder: number;
    subscription: Subscription;
    subscriptionData: any;
    action: any;
    rowAction: any;
    permissionsAllowed: boolean = false;
    showUpdateButtons: boolean = false;
    theme: string;
    dateValueFrom: any;
    dateValueTo: any;
    currentDate: any;
    currentDateFrom: any;
    filterForm: FormGroup;

    constructor(private formUtils: FormUtilsService, private _router: Router, private _communicationService: CommunicationService,
        private _dialog: MatDialog, private _formBuilder: FormBuilder) {
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {
            if (this.subscriptionData['notifyComponent'] == 'app-table' && this.subscriptionData['action'] === 'closeForm') {
                this.showTableWidgetForm = false;
                this.showDeleteBtn = false;
                this.closePrivilegesForm();
            }
            if (this.subscriptionData['notifyComponent'] == 'app-table' && this.subscriptionData['action'] === 'callback') {
                if (this.subscriptionData['type'] === 'customAction') {
                    const rowIds = [];
                    for (const item of this.selectedRecords) {
                        if (JSON.parse(sessionStorage.getItem('routing-params'))['url'] == 'winners') {
                            rowIds.push({ user_id: item.user_id, session_id: item.session_id });
                        } else {
                            rowIds.push(item._id);
                        }
                    }

                    this.action.params = {
                        users: rowIds,
                    };
                    if (this.action.action_type == 'popup') {
                        this.action.params = {
                            ...this.subscriptionData['formData'],
                            ...this.action.params
                        };
                    } else if (this.action.action_type == 'export') {
                        const names = [];
                        for (let x = 0; x < this.columns.length; x++) {
                            names.push(this.columns[x].name);
                        }
                        this.action.params = {
                            columns: names
                        };
                    }

                    this.customActionEmitter.emit(this.action);
                } else if (this.subscriptionData['type'] === 'delete') {
                    this.deleteItem.emit(this.selectedRecords);
                } else if (this.subscriptionData['type'] === 'columnAction') {
                    this.rowAction.params = {};
                    if (this.rowAction.columnInfo.button_action.action_type == 'popup') {
                        for (let key in this.subscriptionData['formData']) {
                            this.rowAction.params[key] = this.subscriptionData['formData'][key];
                        }
                    }
                    if (this.rowAction.columnInfo.button_action.send_attributes) {
                        for (let attribut of this.rowAction.columnInfo.button_action.send_attributes) {
                            this.rowAction.params[attribut] = this.rowAction.clickedRow[attribut];
                        }
                    }
                    this.columnActionEmitter.emit(this.rowAction);
                }
            }
        }
    }

    ngOnInit() {
        if (this.allowCustomFilter && this.filterSearch && this.filterSearch.length > 0) {
            this.initializeFilters();
        }
        this.theme = this._communicationService.getThemeConstants().theme;
        if (this.previousSessionRow && this.previousSessionRow.selectedRowData && !this.previousSessionRow.routeTableDirect) {
            this.showTableDiv = false;
            this.selectedRecords.push(this.previousSessionRow.selectedRowData);
            this.onRowSelect({ type: 'row', data: this.previousSessionRow.selectedRowData });
        } else {
            this.initiateVar();
            this.showUpdateForm = false;
            this.showUpdateButtons = false;
            this.setFieldValues();
        }

        if (this.permissions['customActions'] && Object.keys(this.permissions['customActions']).length > 0) {
            for (let action in this.permissions['customActions']) {
                if (this.permissions['customActions'][action] && this.permissions['customActions'][action] == true) {
                    this.permissionsAllowed = true;
                    break;
                }
            }
        }

        if (this.headers && this.tableHeaders && this.tableHeaders.data.length > 0) {
            for (let header of this.tableHeaders.data) {
                header.value = this.headers[header.identifier];
                if (header.fieldToConcat) {
                    header.fieldToConcat = this.headers[header.fieldToConcat];
                }
            }
        }
        //hide multiple selection if all custom actions are allow none selection like export pdf and excel
        if (this.actions && this.actions.length > 0) {
            let foundMultiSelection = false;
            for (let action of this.actions) {
                if (!action.allowNoneSelection) {
                    foundMultiSelection = true;
                    break;
                }
            }
            if (!foundMultiSelection) {
                this.permissionsAllowed = false;
            }
        }
        this.nbSelectedRows = this.selectedRows.length;

        //to expend all grouping
        if (this.showTableDiv) {
            for (let obj of this.data) {
                this.expandedItems.push(obj[this.groupBy]);
            }
        }
        this.currentDate = new Date();
        this.currentDateFrom = new Date();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    initializeFilters() {
        const controllers = {};
        for (const filter of this.filterSearch) {
            controllers[filter.identifier] = '';
            controllers[filter.identifier] = filter.all_label_value;
            if (!filter.value) {
                filter.value = filter.all_label_value;
            }
        }
        this.filterForm = this._formBuilder.group(controllers);

        for (const filter of this.filterSearch) {
            filter.group = this.filterForm;
            filter.required = false;
            // filter.disableClear = true;
        }
    }

    initiateVar() {
        if (this.showNotification) {
            this.showTableDiv = false;
            this.showEditDiv = true;
            this.showForm = true;
            this.addNewButton = true;
            this.showAddEditForm = true;
        } else {
            this.showTableDiv = true;
            this.showEditDiv = false;
            this.showForm = false;
            this.showAddEditForm = false;
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.headers && this.tableHeaders && this.tableHeaders.data.length > 0) {
            for (let header of this.tableHeaders.data) {
                header.value = this.headers[header.identifier];
            }
        }
        if ((changes.showExtraTable && changes.showExtraTable.previousValue !== changes.showExtraTable.currentValue) ||
            (changes.showPrivilegesTable && changes.showPrivilegesTable.previousValue !== changes.showPrivilegesTable.currentValue)) {
            if (!this.showPrivilegesTable && !this.showExtraTable) {
                this.showAddEditForm = false;
                this.selectedRecords = [];
                this.showDeleteBtn = false;
            }
        }
        if (changes.showPrivilegesTable && changes.showPrivilegesTable.currentValue === true && changes.showPrivilegesTable.previousValue !== changes.showPrivilegesTable.currentValue) {
            let index = 0;
            for (let record of this.rolesPrivileges.data) {
                record.enableRow = false;
                for (let key in this.privilege_types[record.link]) {
                    if (key.indexOf('can') > -1 && this.privilege_types[record.link][key] === 'primary') {
                        record.enableRow = true;
                        break;
                    }
                }
                if (!record.enableRow) {
                    this.rolesPrivileges.data.splice(index, 1);
                }
                index++;
            }
        }
    }

    backStateFunction(): void {
        if (this.showBackIcon) {
            this.showUpdateForm = false;
            this.showAddEditForm = false;
            let params = {
                url: this.backUrl,
                previousUrl: this._router.url
            };
            sessionStorage.setItem('routing-params', JSON.stringify(params));
            this._router.navigate([this.backUrl]);
        } else if (this.backSection) {
            if (JSON.parse(sessionStorage.getItem('routing-params'))) {
                const params = JSON.parse(sessionStorage.getItem('routing-params'));
                if (params.previousUrl === '/bookTickets') {
                    this._router.navigate(['/bookTickets']);
                } else {
                    this._router.navigate([this.backSection.link]);
                }
            } else {
                this._router.navigate([this.backSection.link]);
            }
        }
    }

    loadMore(event) {
        if (event) {
            if (event.first === 0) {
                this.currentPage = 1;
            } else {
                this.currentPage = (event.first / event.rows) + 1;
            }
            this.maxPageLimit = event.rows;
            this.searchWord = event.globalFilter;
            this.sortField = event.sortField;
            this.filters = event.filters;
            this.sortOrder = event.sortOrder;
        }
        this.loadMorePages.emit({
            currentPage: this.currentPage, limitMax: this.maxPageLimit, filters: this.filters,
            searchWord: this.searchWord, sort: { sortField: this.sortField, sortOrder: this.sortOrder }
        });
    }

    setFormValues(showReadOnly = false) {
        this.setFieldValues(showReadOnly);
        if (this.addNewButton) {
            this.showForm = true;
            this.showUpdateForm = false;
        }
        else {
            if (showReadOnly) {
                this.showUpdateButtons = false;
            } else {
                this.showUpdateButtons = true;
            }
            this.showUpdateForm = true;
            this.showForm = false;
        }
    }

    setFieldValues(putAllReadOnly = false): void {
        for (let field in this.fields) {
            if (putAllReadOnly) {
                this.fields[field].readonly = true;
            }
            if (this.clickedRow[this.fields[field].identifier] != undefined) {
                if (this.fields[field].showBasedTimezone) {
                    this.fields[field].timezone = this.clickedRow['timezone'];
                }
                this.fields[field].value = this.clickedRow[this.fields[field].identifier];
            } else {
                this.fields[field].value = '';
            }
        }
        if (!this.showNotification) {
            for (let field in this.fields_add) {
                if (this.fields_add[field].resetFields) {
                    this.fields_add[field].hidden = true;
                }
                if (!this.fields_add[field].initialValue) {
                    this.fields_add[field].value = '';
                } else {
                    this.fields_add[field].value = this.fields_add[field].initialValue;
                }
            }
        }

    }

    deleteRows(): void {
        this._communicationService.showPopupWithCallback(this.deleteSentence, 'delete');
    }

    customAction(action): void {
        console.log(action)
        if ((!this.selectedRecords || this.selectedRecords.length < 1) && !action.allowNoneSelection) {
            const alert = 'Select row(s) in order to perform an action';
            this._communicationService.showAlert(alert);
        } else {
            this.action = null;
            this.action = action;
            if (this.action.action_type && this.action.action_type == 'popup') {
                if (this.action && this.action.form && this.action.form.showExtraData) {
                    if (this.action.form.showExtraData && this.action.form.showExtraData.isConcat) {
                        let totalAmount = 0;
                        for (let record of this.selectedRecords) {
                            if (!isNaN(record[this.action.form.showExtraData.concatField])) {
                                totalAmount += parseFloat(record[this.action.form.showExtraData.concatField]);
                            }
                        }
                        this.action.form.showExtraData.extraInfo = 'Total Price: ' + totalAmount;
                    }
                }
                let sentenceToShow = this.action.sentence && this.action.sentence != '' ? this.action.sentence : customActionSentence;
                this._communicationService.showPopupWithCallback(sentenceToShow, 'customAction', true, null, true, this.action.form);
            } else if (this.action.action_type && this.action.action_type == 'newPage') {
                let oldAmount = 0;
                if (this.action.form.showRecordInformation && this.action.form.concatField) {
                    for (let record of this.selectedRecords) {
                        oldAmount += record[this.action.form.concatField];
                    }
                }
                this.action.form.fieldsOrder = [];
                for (const field of this.action.form.formFields) {
                    if (field.type === 'seat-selector') {
                        field.selectedId = this.selectedId;
                        field.oldAmount = oldAmount;
                    }
                    let orderObj = {};
                    orderObj[field.identifier] = field.order;
                    this.action.form.fieldsOrder.push(orderObj);
                }
                let sentenceToShow = this.action.sentence && this.action.sentence != '' ? this.action.sentence : customActionSentence;
                this.action.title = sentenceToShow;
                this.showTableDiv = false;
                this.showNewPage = true;
            } else {
                let sentenceToShow = this.action.sentence && this.action.sentence != '' ? this.action.sentence : customActionSentence;
                if (this.action && this.action.showExtraData) {
                    if (this.action.showExtraData.isConcat) {
                        let totalAmount = 0;
                        for (let record of this.selectedRecords) {
                            if (!isNaN(record[this.action.showExtraData.concatField])) {
                                totalAmount += parseFloat(record[this.action.showExtraData.concatField]);
                            }
                        }
                        this.action.showExtraData.extraInfo = 'Total Price: ' + totalAmount;
                        sentenceToShow += ' (Total Price: ' + totalAmount + ')';
                    }
                }
                this._communicationService.showPopupWithCallback(sentenceToShow, 'customAction');
            }
        }
    }

    showDeleteButton(): void {
        this.showDeleteBtn = true;
    }

    onSaveWidgetForm(event) {
        if (event) {
            if (event.isAdd) {
                this.saveItem.emit({ action: 'add', submittedObj: event.data });
            } else {
                this.saveItem.emit({
                    action: 'update',
                    submittedObj: event.data,
                    selectedRecord: this.selectedRecords[0] ? this.selectedRecords[0] : this.selectedRecords
                });
            }
        }
    }

    onSave() {
        if (this.child.validateGroup(true, false)) {
            const params = this.formUtils.getGroupFields(this.child);
            if (params.knet == '') {
                params.knet = 0;
            }
            if (params.masterCard == '') {
                params.masterCard = 0;
            }
            if (params.cash == '') {
                params.cash = 0;
            }

            if (this.addNewButton) {
                this.saveItem.emit({ action: 'add', submittedObj: params });
            } else {
                this.saveItem.emit({
                    action: 'update',
                    submittedObj: params,
                    selectedRecord: this.selectedRecords[0] ? this.selectedRecords[0] : this.selectedRecords
                });
            }
        }
    }

    closeForm(emptySelectedRow: boolean = true) {
        this.showTableDiv = true;
        this.showEditDiv = false;
        this.showTableWidgetForm = false;
        this.showForm = false;
        this.showUpdateForm = false;
        this.showUpdateButtons = false;
        this.showAddEditForm = false;
        this.addNewButton = true;
        this.showDeleteBtn = false;

        if (emptySelectedRow) {
            this.clickedRow = {};
            this.clickedRowWidget = {};
            this.selectedRecords = [];
        }
    }

    private _setPagingSession(selectedRow = null, selectedRowData = null, routeTableDirect = false) {
        const params = {
            page: this.currentPage,
            selectedRow: selectedRow,
            selectedRowData: selectedRowData,
            routeTableDirect: routeTableDirect
        };
        sessionStorage.setItem(this.pageUrl, JSON.stringify(params));
    }

    routeToManageFields(link, id, selectedRowData, routeTableDirect = false) {
        const params = {
            url: '/' + link,
            previousUrl: this._router.url,
            id: id,
            selectedRowData: selectedRowData,
            routeTableDirect: routeTableDirect
        };
        this._setPagingSession(id, selectedRowData, routeTableDirect);
        sessionStorage.setItem('routing-params', JSON.stringify(params));
        this._router.navigate(['/' + link]);
    }

    onRowSelect(event) {
        if (event.originalEvent) {
            if (event.originalEvent.showManage) {
                this.routeToManageFields(event.originalEvent.link, event.data['_id'], event.data, true);
            }
        }
        if (event.type === 'row') {
            this.closeForm(false);
            if (this.canUpdate || this.canAdd || this.canView) {
                this._communicationService.showLoading(true);
            }
            if (this.permissions.canDelete && this.selectedRecords.length > 1) {
                this.showTableForm = false;
                this.showAddEditForm = false;
            } else {
                this.showAddEditForm = true;

            }
            if (this.permissions.canDelete) {
                this.showDeleteBtn = true;
            }
            this.addNewButton = false;
            this.clickedRow = event.data;
            this.clickedRowWidget = JSON.parse(JSON.stringify(event.data));
            if (this.permissions.canUpdate) {
                this.openUpdateForm(event);
            } else {
                this.openUpdateForm(event, true);
            }
        } else {
            this.permissions.canDelete && this.selectedRecords.length > 0 ?
                this.showDeleteBtn = true : this.showDeleteBtn = false;
        }
    }

    openUpdateForm(event, onlyView = false) {
        this.showTableDiv = false;
        if (this.showWidgetForm && this.showWidgetOnUpdate) {
            if (onlyView) {
                this.showUpdateButtons = false;
            } else {
                this.showUpdateButtons = true;
            }
            this.isWidgetAdd = false;
            this.showTableWidgetForm = true;
        } else {
            this.showEditDiv = true;
            this.showAddEditForm = true;
            this.setFormValues(onlyView);
            switch (this.pageUrl) {
                case 'profiles':
                    this.getPrivileges('update', event.data);
                    break;
                default: {
                    if (this.hasExtraTable) {
                        this.getExtraTable('update', event.data);
                    }
                }
                    break;
            }
        }
    }

    onRowUnselect(event) {
        if (this.selectedRecords.length == 0) {
            this.showDeleteBtn = false;
            this.showTableForm = false;
            this.showAddEditForm = false;
        }
    }

    onAllRowSelect(event) {
        if (this.permissions.canDelete && this.selectedRecords.length > 1) {
            this.showTableForm = false;
            this.showAddEditForm = false;
        } else {
            this.showAddEditForm = true;
        }
        this.permissions.canDelete && this.selectedRecords.length > 0 ? this.showDeleteBtn = true : this.showDeleteBtn = false;
        this.addNewButton = false;
    }

    showDialogToAdd() {
        if (this.allowOneAdd && this.data.length === 1) {
            this._communicationService.showAlert('This section is already created');
        } else {
            if (this.showWidgetForm) {
                this.showTableDiv = false;
                this.showEditDiv = false;
                this.showAddEditForm = false;
                this.isWidgetAdd = true;
                this.showTableWidgetForm = true;
            } else {
                this.showTableDiv = false;
                this.showEditDiv = true;
                this.selectedRecords = [];
                this.showAddEditForm = true;
                this.addNewButton = true;
                this.showDeleteBtn = false;
                this.setFormValues();

                if (this.pageUrl === 'profiles') {
                    this.getPrivileges('add');
                }
                if (this.hasExtraTable) {
                    this.getExtraTable('add');
                }
            }
        }
    }

    getPrivileges(type, data = null) {
        this.showAddEditForm = true;
        this.privileges.emit({ data: data, type: type });
        // if (type === 'update') {
        //     this.privileges.emit(data);
        // } else if (type === 'add') {
        //     this.privileges.emit({permissions: defaultPermissions});
        // }
        this.showTableForm = true;
        // if (this.rolesPrivileges) {
        //     for (let field in this.rolesPrivileges.fields) {
        //         if (this.clickedRow[this.rolesPrivileges.fields[field].identifier] != undefined) {
        //             this.rolesPrivileges.fields[field].value = this.clickedRow[this.rolesPrivileges.fields[field].identifier];
        //         } else
        //             this.rolesPrivileges.fields[field].value = '';
        //     }
        // }
    }

    getExtraTable(type, data = null) {
        this.showAddEditForm = true;
        if (type === 'update') {
            data.type = 'update';
            this.getExtraTablee.emit(data);
        } else if (type === 'add') {
            let data = {};
            data['type'] = 'add';
            this.getExtraTablee.emit(data);
        }
        this.showTableForm = true;
    }

    deleteRow(tableElement, rowIndex) {
        tableElement.data.splice(rowIndex, 1);

    }

    addRow(tableElement) {
        let newRow = {};
        for (let column of tableElement.columns) {
            if (column.type == 'dropdown') {
                // newRow[column.name] = column.options[0].value;
            } else if (column.type == 'image') {
                newRow[column.name] = { 'value': '' };
            }
            else {
                newRow[column.name] = '';
            }
        }
        if (tableElement.data === undefined) {
            tableElement.data = [];
        }
        tableElement.data.push(newRow);
    }

    onSavePrivileges() {
        let params = {}, permissions = {};
        for (const row of this.rolesPrivileges.data) {
            permissions[row.section_id] = {
                canAdd: (row.canAdd === true),
                canUpdate: (row.canUpdate === true),
                canDelete: (row.canDelete === true),
                canRead: (row.canRead === true)
            };
            for (let key in row) {
                if (row[key] && row[key].options && row[key].value) {
                    permissions[row.section_id][key] = [];
                    for (let value of row[key].value) {
                        permissions[row.section_id][key].push(value);
                    }
                    row[key].value = [];
                }
            }
            if (row.filter) {
                permissions[row.section_id]['filter'] = row.filter;
            }
        }
        if (this.child.validateGroup(true, false)) {
            params = this.formUtils.getGroupFields(this.child);
            params['permissions'] = permissions;

            if (this.addNewButton) {
                this.saveItem.emit({ action: 'add', submittedObj: params });
            } else {
                this.saveItem.emit({ action: 'update', submittedObj: params });
            }
        }
    }

    onSaveExtraTable() {
        let params = {};
        let showError = false;
        this.extraTable.forEach(tableElement => {
            tableElement.showExtraTableError = false;
            let index = 0;
            if (tableElement.required === true) {
                if (tableElement.data.length === 0) {
                    showError = true;
                    tableElement.showExtraTableError = true;
                    tableElement.extraTableError = 'Please Fill All Table Before Saving';
                } else {
                    for (const row of tableElement.data) {
                        index++;
                        for (let column of tableElement.columns) {
                            row['order'] = index;
                            if (column.required) {
                                if ((column.type != 'image' && !row[column.name] || row[column.name] === '')) {
                                    showError = true;
                                    tableElement.showExtraTableError = true;
                                    tableElement.extraTableError = 'Please Fill All Table Before Saving';
                                    break;
                                } else if (column.type == 'image' && (!row[column.name] || !row[column.name].value.data || row[column.name].value.data == '') && (!row[column.name] || !row[column.name].value || row[column.name].value == '')) {
                                    showError = true;
                                    tableElement.showExtraTableError = true;
                                    tableElement.extraTableError = 'Please Fill All Table Before Saving';
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!showError) {
            if (this.child.validateGroup(true, false)) {
                params = this.formUtils.getGroupFields(this.child);
                this.extraTable.forEach(tableElement => {
                    params[tableElement.param_id] = tableElement.data;
                });
                if (this.addNewButton) {
                    this.saveItem.emit({ action: 'add', submittedObj: params });
                } else {
                    this.saveItem.emit({
                        action: 'update',
                        submittedObj: params,
                        selectedRecord: this.selectedRecords[0]
                    });
                }
            }
        }
    }

    closePrivilegesForm() {
        if (this.showNotification) {
            this.child.emptyFields();
        } else {
            this.clickedRowWidget = {};
            this.showTableDiv = true;
            this.showNewPage = false;
            this.showEditDiv = false;
            this.showTableForm = false;
            this.showAddEditForm = false;
            this.showDeleteBtn = false;
            this.showExtraTableError = false;
            this.selectedRecords = [];
        }
    }

    checkBoxChanged(event, row, column_name) {
        if (this.privilege_types[row.link].canRead == 'primary' && !event.checked && column_name == 'canRead') row.canUpdate = row.canDelete = row.canAdd = false;
    }

    updateData(value) {
        if (this.permissions.canDelete && this.selectedRecords.length > 1) {
            this.showTableForm = false;
            this.showAddEditForm = false;
        } else {
            this.showAddEditForm = true;
        }
        if (this.permissions.canDelete) this.showDeleteBtn = true;
        this.addNewButton = false;
        this.clickedRow = value;
        if (this.permissions.canDelete) {
            if (!this.permissions.canDelete) {
                this.showTableDiv = false;
                this.showEditDiv = true;
            } else {
                this.showTableDiv = true;
                this.showEditDiv = true;
            }
            this.setFormValues();
            if (JSON.parse(sessionStorage.getItem('routing-params'))['url'] == 'profile') {
                this.getPrivileges('update');
            }
        }
    }

    // getUsersByGroups(sectionObj) {
    //     this.getUsersByGroup.emit(sectionObj);
    // }

    errorHandle(message) {
        this._communicationService.showAlert(message);

    }

    customRowAction(columnInfo, clickedRow) {
        this.rowAction = { columnInfo: columnInfo, clickedRow: clickedRow };
        if (columnInfo.button_action.action_type && columnInfo.button_action.action_type == 'popup') {
            let sentenceToShow = columnInfo.button_action.sentence && columnInfo.button_action.sentence != '' ? columnInfo.button_action.sentence : customActionSentence;
            this._communicationService.showPopupWithCallback(sentenceToShow, 'columnAction', true, null, true, columnInfo.button_action.form);
        } else {
            let sentenceToShow = columnInfo.button_action.sentence && columnInfo.button_action.sentence != '' ? columnInfo.button_action.sentence : customActionSentence;
            this._communicationService.showPopupWithCallback(sentenceToShow, 'columnAction');
        }
    }

    keyPress(event: any): void {
        const pattern = /[0-9]/;
        const charInput = String.fromCharCode(event.charCode);

        if (!pattern.test(charInput)) {
            event.preventDefault();
        }
    }

    public openVideoPopUp(video_src): void {
        event.stopPropagation();
        this._dialog.open(VideoDialogComponent, {
            data: {
                src: video_src
            }
        });
    }

    public selectSearchDate(event) {
        let dateObj = { dateField: this.dateSearch.field };
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
        this.loadMorePages.emit({
            currentPage: this.currentPage,
            limitMax: this.maxPageLimit,
            filters: this.filters,
            searchWord: this.searchWord,
            sort: { sortField: this.sortField, sortOrder: this.sortOrder },
            dateFilter: dateObj
        });
    }

    public filterSearchEvent() {
        let customFilters = {};
        for (let filter of this.filterSearch) {
            if (filter && filter.value) {
                customFilters[filter.identifier] = filter.value;
            }
        }
        this.loadMorePages.emit({
            currentPage: this.currentPage,
            limitMax: this.maxPageLimit,
            filters: this.filters,
            searchWord: this.searchWord,
            sort: { sortField: this.sortField, sortOrder: this.sortOrder },
            customFilters: customFilters
        });
    }

    public customActionNewPageHandleForm() {
        if (this.actionForm.validateGroup(true, false)) {
            let params = {};
            params = this.formUtils.getGroupFields(this.actionForm);
            const rowIds = [];
            for (const item of this.selectedRecords) {
                rowIds.push(item._id);
            }
            params['rows'] = rowIds;
            this.action.params = params;
            this.customActionEmitter.emit(this.action);
        }
    }

    routeToManage(link, event) {
        event.showManage = true;
        event.link = link;
        this.onRowSelect(event);
    }
}

