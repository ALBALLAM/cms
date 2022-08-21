import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {CommunicationService} from '../communication/communication.service';
import {Subscription} from 'rxjs/index';
import {customActionSentence} from '../globalVariables';
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";
import {MatDialog} from "@angular/material";

@Component({
    selector: 'app-datatable',
    templateUrl: './datatable.component.html',
    styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnInit, OnDestroy {

    @Input() tableTitle: string;
    @Input() deleteSentence: string;
    @Input() tableRowHeight: string;
    @Input() sortBy: string;
    @Input() data: any[] = [];
    @Input() columns: any[] = [];
    @Input() groupingFields: boolean;
    @Input() groupBy: string;
    @Input() usePagination: boolean;
    @Input() useSearch: boolean;
    @Input() maxPageLimit: number;
    @Input() totalRecords: number;
    @Input() previousSessionRow: string;
    @Input() firstTablePage: number;
    @Input() limitMaxPage: number;
    @Input() selectedRecords: any;
    @Input() headers: any;
    @Input() hideSelectionAll: boolean;
    @Input() tableHeaders: any;
    @Input() selectionModeSingle: boolean;
    @Output() loadMorePages = new EventEmitter<any>();
    @Output() rowSelection = new EventEmitter<any>();
    @Output() rowUnSelection = new EventEmitter<any>();
    @Output() columnActionEmitter = new EventEmitter<any>();

    @ViewChild('myappfrm') child;
    multiple: boolean = true;
    showForm: boolean = false;
    clickedRow: any = {};
    currentPage: number = 1;
    searchWord: string;
    sortField: string;
    filters: object;
    sortOrder: number;
    subscription: Subscription;
    subscriptionData: any;
    action: any;
    rowAction: any;
    theme: string;
    tempData: any[] = [];
    tempPage: number;
    tempMaxPageLimit: number;
    showSeletedRecords: boolean;

    constructor(private _communicationService: CommunicationService, private _dialog: MatDialog) {
    }

    private _subscriptionCallback(): void {
        if (this.subscriptionData && typeof (this.subscriptionData)) {

            if (this.subscriptionData['notifyComponent'] == 'app-table' && this.subscriptionData['action'] === 'callback') {
                if (this.subscriptionData['type'] === 'columnAction') {
                    this.rowAction.params = {};
                    if (this.rowAction.columnInfo.button_action.action_type == 'popup') {
                        for (let key in this.subscriptionData['formData']) {
                            this.rowAction.params[key] = this.subscriptionData['formData'][key]
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
        if (this.headers && this.tableHeaders && this.tableHeaders.data.length > 0) {
            for (let header of this.tableHeaders.data) {
                header.value = this.headers[header.identifier];
            }
        }
        this.subscription = this._communicationService.getData().subscribe(
            response => {
                this.subscriptionData = response;
                this._subscriptionCallback();
            });
        this.theme = this._communicationService.getThemeConstants().theme;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
            searchWord: this.searchWord, sort: {sortField: this.sortField, sortOrder: this.sortOrder}
        });
    }

    onRowSelect(event) {
        this.rowSelection.emit(this.selectedRecords);
    }

    onRowUnselect(event) {
        this.rowUnSelection.emit(this.selectedRecords);
        if(this.showSeletedRecords){
            this.data = this.selectedRecords;
        }
    }

    onAllRowSelect(event) {
        this.rowSelection.emit(this.selectedRecords);
    }

    customRowAction(columnInfo, clickedRow) {
        this.rowAction = {columnInfo: columnInfo, clickedRow: clickedRow};
        if (columnInfo.button_action.action_type && columnInfo.button_action.action_type == 'popup') {
            let sentenceToShow = columnInfo.button_action.sentence && columnInfo.button_action.sentence != '' ? columnInfo.button_action.sentence : customActionSentence;
            this._communicationService.showPopupWithCallback(sentenceToShow, 'columnAction', true, null, true, columnInfo.button_action.form);
        } else {
            let sentenceToShow = columnInfo.button_action.sentence && columnInfo.button_action.sentence != '' ? columnInfo.button_action.sentence : customActionSentence;
            this._communicationService.showPopupWithCallback(sentenceToShow, 'columnAction');
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

    public paginate(event) {
        if(!this.usePagination){
            if (event.first === 0) {
                this.currentPage = 1;
            } else {
                this.currentPage = (event.first / event.rows) + 1;
            }
        }
    }

    public viewSelectedRows() {
        this.tempData = this.data;
        this.tempPage = this.currentPage;
        this.tempMaxPageLimit = this.maxPageLimit;
        this.data = this.selectedRecords;
        this.firstTablePage = 0;
        this.showSeletedRecords = true;
    }

    public viewAllRows() {
        this.data = this.tempData;
        this.firstTablePage = (this.tempPage - 1) * this.tempMaxPageLimit;
        this.showSeletedRecords = false;
    }
}

