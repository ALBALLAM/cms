import {AfterViewInit, Component, EventEmitter, Input, Output} from "@angular/core";
import {Field} from "../form.interface";

declare var $: any;

import "inputmask";
import * as GlobalVariables from "../../globalVariables";
import {NgxMaterialTimepickerTheme} from 'ngx-material-timepicker';

@Component({
    selector: 'app-time',
    templateUrl: './time.component.html',
    styleUrls: ['./time.component.css']
})
export class TimeComponent implements AfterViewInit {
    @Input() element: Field;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Input() floatLabel: boolean;
    valid: boolean;
    darkTheme: NgxMaterialTimepickerTheme;

    constructor() {
        this.darkTheme = {
            container: {
                bodyBackgroundColor: '#fff',
                buttonColor: '#1E1E1E'
            },
            dial: {
                dialBackgroundColor: '#1E1E1E',
            },
            clockFace: {
                clockFaceBackgroundColor: '#F0F0F0',
                clockHandColor: '#1E1E1E',
                clockFaceTimeInactiveColor: '#1E1E1E'
            }
        };
    }

    ngAfterViewInit() {
        if (this.element.value && this.element.value != '') {
            this.element.value = this.element.value.replace('PM', 'pm');
            this.element.value = this.element.value.replace('AM', 'am');
        }
        $("#" + this.element.identifier).inputmask({
            placeholder: "HH:MM",
            mask: "(00|01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20|21|22|23):(0|1|2|3|4|5)9 (AM|PM)",
            showMaskOnHover: false
        });
    }

    timeSet(event): void {
        if (event) {
            this.element.value = event;
            this.eventEmitter.emit(this.element.identifier);
            let regex = new RegExp(GlobalVariables.timeRegExp);
            this.valid = regex.test(this.element.value);
            if (!this.valid) {
                this.element.value = "";
                $("#" + this.element.identifier).val("");
                this.eventEmitter.emit({
                    'id': this.element.identifier,
                    'grp': this.element['field_group'],
                    'value': this.element.value
                });
            }
        }
    }
}
