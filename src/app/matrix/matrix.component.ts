import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Validation} from '../Validations';
import {ApiService} from '../api/api.service';
import {CommunicationService} from '../communication/communication.service';

const ntol = require('number-to-letter');

@Component({
    selector: 'app-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit {
    @Input() public data;
    @Input() public attributesObject;
    @Input() public backSection;
    @Input() public selectedId;
    public rowsAlpha = [];
    public fields: any = [
        {
            'identifier': 'columns',
            'readonly': false,
            'table_hidden': false,
            'required': true,
            'add_hidden': false,
            'form_hidden': false,
            'label': 'Number of Columns',
            'validation': 'free_text_validator',
            'type': 'number',
            'sortable': true,
            'order': 1
        },
        {
            'identifier': 'rows',
            'readonly': false,
            'table_hidden': false,
            'required': true,
            'add_hidden': false,
            'form_hidden': false,
            'label': 'Number of Rows',
            'validation': 'free_text_validator',
            'type': 'number',
            'sortable': true,
            'order': 0
        }];
    public orderObj = {};
    public clickedRow = {};
    public rows;
    public columns;
    public zones = [];
    public directions = [{text: 'Left', value: 'left'}, {text: 'Right', value: 'right'}];
    public showTableMatrix = false;
    Validation: any = Validation;
    public pickedZone;
    public pickedDirection = 'left';
    public matrixArray = [];
    public showNextButton = true;
    public showUpdateButtons = true;

    constructor(private _router: Router, private _apiService: ApiService,
                private _communicationService: CommunicationService) {
    }

    ngOnInit() {
        if (this.data && this.data.matrix && this.data.matrix.length > 0) {
            this.rows = this.data.matrix.length;
            this.columns = this.data.matrix[0].length;
            this.fields[1].value = this.rows;
            this.fields[0].value = this.columns;
            this.pickedDirection = this.data.matrix[0][0].direction;

            if (!this.attributesObject.permissions.canUpdate) {
                this.fields[0].readonly = true;
                this.fields[1].readonly = true;
                this.showUpdateButtons = false;
            }

            for (let i = 0; i < this.fields.length; i++) {
                this.orderObj[this.fields[i].identifier] = this.fields[i].order;
            }
            this.getZones();
        } else {
            if (!this.attributesObject.permissions.canAdd) {
                this.fields[0].readonly = true;
                this.fields[1].readonly = true;
                this.showNextButton = false;
            }
            for (let i = 0; i < this.fields.length; i++) {
                this.orderObj[this.fields[i].identifier] = this.fields[i].order;
            }
        }
    }

    backStateFunction(forceClose = false): void {
        if (forceClose) {
            this._router.navigate([this.backSection.link]);
        } else {
            if (this.showTableMatrix && this.showUpdateButtons) {
                this.resetMatrix();
            } else {
                this._router.navigate([this.backSection.link]);
            }
        }
    }

    checkRowsColumns(fieldObj): void {
        if (fieldObj.id === 'rows') {
            if (!isNaN(fieldObj.value)) {
                this.rows = fieldObj.value;
            } else {
                this.rows = 0;
            }
        }
        if (fieldObj.id === 'columns') {
            if (!isNaN(fieldObj.value)) {
                this.columns = fieldObj.value;
            } else {
                this.columns = 0;
            }
        }
    }

    public openMatrix() {
        if (this.rows && this.columns && this.rows !== 0 && this.columns !== 0) {
            if (this.zones && this.zones.length > 0) {
                this.prepareMatrix();
            } else {
                this.getZones();
            }
        } else {
            this.showTableMatrix = false;
        }
    }

    public getZones() {
        this._communicationService.showLoading(true);
        let url = this.attributesObject.getZonesUrl;
        if (this.selectedId && this.backSection) {
            if (url.indexOf('?') < 0) {
                url += '?';
            } else {
                url += '&';
            }
            url += 'id=' + this.selectedId;
        }
        this._apiService.sendApi('get', url, '', true, false)
            .subscribe(response => {
                    this.zones = response;
                    this.zones.unshift({
                        name: 'Blocked Zone',
                        color: '#ffffff',
                        price: 0,
                        _id: 'blocked'
                    });
                },
                (err) => {
                    this.getPageErrorCallback(err);
                }, () => {
                    if (this.zones && this.zones.length > 0) {
                        this.pickedZone = this.zones[0];
                        this.prepareMatrix();
                    } else {
                        this._communicationService.showAlert('This Seat Plan does not contain any zones');
                    }
                    this._communicationService.showLoading(false);
                });
    }

    public prepareMatrix() {
        let rowsArray = [];
        this.rowsAlpha = [];
        for (let i = 0; i < this.rows; i++) {
            this.rowsAlpha.push(ntol(Number(i)));
            let columnsArray = [];
            for (let j = 0; j < this.columns; j++) {
                if (this.data && this.data.matrix && this.data.matrix.length > 0 && this.data.matrix[i] && this.data.matrix[i][j] && this.data.matrix[i][j].zone) {
                    if ((j + 1) < 10) {
                        this.data.matrix[i][j]['seatLabel'] = '0' + (j + 1);
                    } else {
                        this.data.matrix[i][j]['seatLabel'] = '' + (j + 1);
                    }
                    columnsArray.push(this.data.matrix[i][j]);
                } else {
                    let seatLabelEmpty = '';
                    if ((j + 1) < 10) {
                        seatLabelEmpty = '0' + (j + 1);
                    } else {
                        seatLabelEmpty = '' + (j + 1);
                    }
                    columnsArray.push({zone: 'empty', color: 'transparent', seatLabel: seatLabelEmpty});
                }
            }
            rowsArray.push(columnsArray);
        }
        this.matrixArray = JSON.parse(JSON.stringify(rowsArray));
        this.showTableMatrix = true;
    }

    public resetMatrix() {
        this.showTableMatrix = false;
    }

    public selectSeat(seat) {
        if (seat.color === 'transparent') {
            if (this.pickedZone && this.pickedZone.color) {
                seat.color = this.pickedZone.color;
            }
            if (this.pickedZone && this.pickedZone._id) {
                seat.zone = this.pickedZone._id;
            }
        } else {
            seat.color = 'transparent';
            seat.zone = 'empty';
        }
    }

    public saveMatrix() {
        let foundSeat = false;
        let submitArray = [];
        for (let row of this.matrixArray) {
            let submitRow = [];
            for (let seat of row) {
                if (seat.zone != 'empty') {
                    submitRow.push({zone: seat.zone});
                    foundSeat = true;
                } else {
                    submitRow.push({});
                }
            }
            submitArray.push(submitRow);
        }
        if (!foundSeat) {
            this._communicationService.showAlert('Your matrix is empty, please fill seats');
        } else {
            this._communicationService.showLoading(true);
            let url = this.attributesObject.add_url;
            let method = 'post';
            if (this.data && this.data.matrix && this.data.matrix.length > 0) {
                method = 'put';
                url = this.attributesObject.save_url;
            }
            if (this.selectedId && this.backSection) {
                if (url.indexOf('?') < 0) {
                    url += '?';
                } else {
                    url += '&';
                }
                url += 'id=' + this.selectedId;
            }
            this._apiService.sendApi(method, url, {matrix: submitArray, direction: this.pickedDirection}, true, false)
                .subscribe(response => {
                    },
                    (err) => {
                        if (err.status == 460) {
                            if (err.data.error && err.data.error.message && err.data.error.message.data && err.data.error.message.data.message) {
                                this._communicationService.showAlert(err.data.error.message.data.message.en);
                            } else {
                                this._communicationService.showAlert(err.data.error.message);
                            }
                            this._communicationService.showLoading(false);
                        } else {
                            this.getPageErrorCallback(err);
                        }
                    }, () => {
                        this._communicationService.showLoading(false);
                        this.backStateFunction(true);
                    });
        }
    }

    public clearMatrix() {
        for (let row of this.matrixArray) {
            for (let seat of row) {
                seat.color = 'transparent';
                seat.zone = 'empty';
            }
        }
    }

    private getPageErrorCallback(error): void {
        this._communicationService.showLoading(false);
        this._communicationService.showError(error.status);
    }
}
