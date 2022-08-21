import {Component, EventEmitter, Input, AfterViewInit, Output, OnInit} from '@angular/core';
import {Field, FormFieldValue} from '../form.interface';
import 'inputmask';

declare var $: any;

@Component({
    selector: 'app-date',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.css']
})

export class DateComponent implements AfterViewInit, OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Input() value: string;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    field: FormFieldValue;
    changed: boolean = false;
    originalValue: any;
    maxDate: any;
    minDate: any;

    constructor() {
    }

    ngOnInit() {
        this.maxDate = new Date();
        if (this.element.value) {
            this.originalValue = new Date(this.element.value);
        }
        if (this.element['minDateToday']) {
            this.minDate = new Date()
        }
    }

    ngAfterViewInit() {
    }

    change(): void {
        this.element.value = $('#' + this.element.identifier).val();
        let dateObj = this.element.value.split('/');
        let dat;
        if (dateObj && dateObj.length == 3) {
            dat = new Date();
            dat.setDate(dateObj[0]);
            dat.setMonth(dateObj[1] - 1);
            dat.setFullYear(dateObj[2]);
        }
        if (dat && isNaN(dat.getTime())) {
            this.element.value = '';
            $('#' + this.element.identifier).val('');
            this.eventEmitter.emit({'id': this.element.identifier, 'grp': this.element['field_group'], 'value': ''});
        } else if (this.element.value != '') {
            this.element.value = new Date(this.element.value).toISOString();
            this.eventEmitter.emit({
                'id': this.element.identifier,
                'grp': this.element['field_group'],
                'value': this.element.value
            });
        }

        this.element['change'] = true;
    }

    clearDate() {
        this.originalValue = '';
        this.element.value = null;
    }

}
