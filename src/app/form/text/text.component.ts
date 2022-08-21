import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";

@Component({
	selector: 'app-text',
	templateUrl: './text.component.html',
	styleUrls: ['./text.component.css']
})
export class TextComponent implements OnInit {
	@Input() element: Field;
	@Input() floatLabel: boolean;
	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
	@Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
	additionalClass: any;

	constructor() {
	}

	ngOnInit() {
		if(this.element.type == 'email'){
			this.additionalClass = 'email-field';
		}else this.additionalClass = '';
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
