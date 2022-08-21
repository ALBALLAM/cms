import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";

@Component({
	selector: 'app-text-area',
	templateUrl: './textArea.component.html',
	styleUrls: ['./textArea.component.css']
})
export class TextAreaComponent implements OnInit {
	@Input() element: Field;
	@Input() floatLabel: boolean;
	@Input() maxLength: number;
	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
	additionalClass: any;

	constructor() {
	}

	ngOnInit() {
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
