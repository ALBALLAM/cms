import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Field, FormFieldValue} from '../form.interface';

@Component({
    selector: 'app-dropdown',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})

export class SelectComponent implements OnInit, OnChanges {
    @Input() element: Field;
    @Input() value: any;
    @Input() floatLabel: boolean;
    @Input() allowClear = true;
    @Input() dataLists: any[];
    @Input() options: any[];
    @Input() allowSearch = true;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    field: FormFieldValue;
    selectedOptions = [];
    constSelection = [];
    selection = [];

    constructor() {
    }

    ngOnInit() {
        this.constSelection = this.value;
        if (!this.element.options) {
            this.element.options = [{'value': 'no data', 'text': 'no data'}];

            if (this.dataLists != undefined && this.dataLists != null && this.dataLists.length > 0) {
                this.element.options = this.dataLists;
            }
        }

        for (let i = 0; i < this.element.options.length; i++) {
            if (this.element.options[i].value === undefined) {
                this.element.options.splice(i, 1);
            }
        }

        for (let i = 0; i < this.element.options.length; i++) {
            this.selectedOptions.push(this.element.options[i]);
        }
        this.changeValue();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.options && changes.options.previousValue && changes.options.currentValue) {
            const isSame = (changes.options.previousValue.length === changes.options.currentValue.length) &&
                changes.options.previousValue.every(function (element, index) {
                    return element.value === changes.options.currentValue[index].value;
                });
            if (!isSame) {
                this.selectedOptions = [];
                for (let i = 0; i < this.element.options.length; i++) {
                    this.selectedOptions.push(this.element.options[i]);
                }
                this.element.value = '';
            }
        }
    }

    changeValue() {
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'grp': this.element['field_group'],
            'value': this.element.value,
            'hidden': this.element.hidden,
        });
    }

    search(query: string) {
        const result = this.select(query);
        this.selectedOptions = result;
    }

    onSelectionChange(event) {
        this.constSelection = event.value;
        this.changeValue();
    }

    select(query: string): string[] {
        const result = [];
        this.selection = [];
        for (const a of this.element.options) {
            if (a.text.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                result.push(a);
            } else if (this.constSelection && this.constSelection.indexOf(a.value) > -1) {
                this.selection.push(a);
            }
        }
        return result;
    }

    clearData(isArray) {
        if (isArray) {
            this.element.value = [];
            this.element.group.controls[this.element.identifier].setValue([]);
        } else {
            this.element.value = null;
            this.element.group.controls[this.element.identifier].setValue(null);
        }
        this.element.group.get(this.element.identifier).markAsTouched();
        this.element.group.get(this.element.identifier).markAsDirty();
        this.changeValue();
    }

}
