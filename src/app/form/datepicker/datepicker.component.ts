import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlatpickrOptions} from 'ng2-flatpickr';
import {Field} from '../form.interface';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    options: FlatpickrOptions = {
        utc: false,
        defaultDate: '',
        enableTime: true,
        time_24hr: false,
        onChange: (selectedDates, dateStr, instance) => {
            this.element.changed = true;
            if (dateStr) {
                // if (this.element.showUTC) {
                this.element.value = dateStr.replace(' ', 'T') + ':00';
                // }
                // else {
                //     this.element.value = new Date(dateStr).toISOString();
                // }
            } else {
                this.element.value = '';
            }
        },
        onClose: (selectedDates, dateStr, instance) => {
            this.element.changed = true;
        }
    };

    constructor() {
    }

    ngOnInit() {
        this.element.changed = false;
        if (this.element.value) {
            if (this.element.showBasedTimezone && this.element.timezone) {
                this.options.defaultDate = moment.tz(this.element.value, this.element.timezone).locale('en').format('YYYY-MM-DD HH:mm');
                this.element.value = this.options.defaultDate;
            } else {
                this.options.defaultDate = this.element.value;
            }
        }
    }

}
