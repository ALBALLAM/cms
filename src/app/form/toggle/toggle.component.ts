import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";

@Component({
    selector: 'app-toggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.component.css']
})
export class ToggleComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
        if (!this.element.value) {
            this.element.value = false;

        }
    }

    change(): void {
        // let toggle_value;
        // if(this.element.value=='true' || this.element.value==true || this.element.value=='1' || this.element.value=='yes' || this.element.value=='Yes'){
        // 		toggle_value = 1;
        // } else if(this.element.value=='false' || this.element.value==false || this.element.value=='0' || this.element.value=='no' || this.element.value=='No') {
        //   toggle_value = 0;
        // }
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': this.element.value,
            'grp': this.element['field_group']
        });
        this.element['change'] = true;
    }

}
