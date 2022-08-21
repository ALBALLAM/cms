import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";
import {ENTER, COMMA} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material";

@Component({
    selector: 'app-chip-input',
    templateUrl: './chip-input.component.html',
    styleUrls: ['./chip-input.component.css']
})
export class ChipInputComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Input() addNewButton: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
    additionalClass: any;
    removable: boolean = true;
    selectable: boolean = true;
    addOnBlur: boolean = true;
    touched: boolean = false;
    separatorKeysCodes = [ENTER, COMMA];
    chipItems = [];

    constructor() {
    }

    ngOnInit() {
        if (this.element.value) {
            for (let item of this.element.value) {
                this.chipItems.push(item);
            }
        } else {
            this.element.value = [];
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if ((value || '').trim()) {
            this.chipItems.push(value.trim());
            this.element.value.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.change();
    }

    setTouched() {
        this.touched = true;
    }

    remove(index): void {
        this.chipItems.splice(index, 1);
        this.element.value.splice(index, 1);
        this.change();
    }

    change(): void {
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': this.element.value,
            'grp': this.element['field_group']
        });
        this.element['change'] = true;
    }
}
