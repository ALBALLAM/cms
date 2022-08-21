import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { Field } from "../form.interface";

declare var $: any;

@Component({
    selector: 'app-number',
    templateUrl: './number.component.html',
    styleUrls: ['./number.component.css']
})
export class NumberComponent implements AfterViewInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    maxLength = '1000000000';

    constructor() {
    }

    ngAfterViewInit() {
        if (this.element['maxLength']) {
            this.maxLength = this.element['maxLength'];
        }

        if (this.element['format'] && this.element['format'] == 'account_number') {
            $("#" + this.element.identifier).inputmask("numeric", {
                allowMinus: false,
                groupSize: '4',
                groupSeparator: ' ',
                autoGroup: true,
                rightAlign: false
            });

        } else if (this.element['format'] && this.element['format'] == 'decimal') {
            $("#" + this.element.identifier).inputmask({
                alias: 'numeric',
                groupSeparator: ',',
                autoGroup: true,
                digits: 2,
                digitsOptional: false,
                rightAlign: false
            });
        } else {
            $("#" + this.element.identifier).inputmask("numeric", {
                allowMinus: false,
                radixPoint: '',
                groupSize: '3',
                groupSeparator: ',',
                autoGroup: true,
                rightAlign: false
            });
        }

        setTimeout(() => {
            if (this.element.value) {
                $("#" + this.element.identifier).inputmask("setvalue", this.element.value);
            } else if (this.element['maxLength'] && this.element.value == 0) {
                $("#" + this.element.identifier).inputmask("setvalue", this.element.value);
            } else {
                $("#" + this.element.identifier).inputmask("setvalue", '');
            }

            this.change(true);
        }, 100);

        this.element.change = false;
    }

    change(fromInit): void {
        let value = $("#" + this.element.identifier).val();
        if (this.element['format'] && this.element['format'] == 'account_number') {
            value = value.replace(/ /g, "");
        } else if (this.element['format'] && this.element['format'] == 'decimal') {
            // value = value.replace('.', '');
            value = value.replace(/,/g, '');
        } else {
            value = value.replace('.', '');
            value = value.replace(/,/g, '');
        }

        if (this.element['format'] == 'account_number' && this.element.required) {
            if (value != '') {
                this.element.valid = true;
            } else {
                this.element.valid = false;
            }
        }
        if (value && value != '') {
            this.element.value = parseFloat(value);
        } else {
            this.element.value = value;
        }
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'grp': this.element['field_group'],
            'value': parseFloat(this.element.value)
        });
        if (!fromInit) {
            this.element.change = true;
        }
    }

    blur(): void {
        if (this.element.value || this.element.value === 0) {
            this.element.group.get(this.element.identifier).setValue(parseFloat(this.element.value));
        } else {
            this.element.group.get(this.element.identifier).setValue('');
        }
    }
}
