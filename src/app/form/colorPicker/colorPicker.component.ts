import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";

@Component({
    selector: 'app-color-picker',
    templateUrl: './colorPicker.component.html',
    styleUrls: ['./colorPicker.component.css']
})
export class ColorPickerComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
        this.element.changed = false;
    }

    change(): void {
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': this.element.value,
            'grp': this.element['field_group']
        });
        this.element.changed = true;
    }

    clicked(): void {
        this.element.changed = true;
    }
}
