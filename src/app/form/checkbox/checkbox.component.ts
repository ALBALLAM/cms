import {Component, EventEmitter, Input, OnInit, Output, ViewChildren} from "@angular/core";
import {Field} from "../form.interface";
import {MatCheckbox} from "@angular/material";

@Component({
	selector: 'app-checkbox',
	templateUrl: './checkbox.component.html',
	styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {
	@Input() element: Field;
	@Input() value: string;
	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
	@ViewChildren(MatCheckbox) checkboxes;
	changed: boolean = false;

	private _lastSelected;
	arrayOfValue: any[];

	constructor() {}

		ngOnInit() {
			console.log(this.element,'element checkbox')
		}

	change(index: number, e): void {
	  this.changed = true;
			this.arrayOfValue = [];
			// this._lastSelected = this.element.options.length - 1;
			const cbs = this.checkboxes.toArray();

			// if (this._lastSelected == index) {
			// 		if (cbs[this._lastSelected].ariaLabel == "i have never held any of the above" || cbs[this._lastSelected].ariaLabel == "i have no relation with any of the above") {
			// 				const lastIndex = this._lastSelected - 1;
			// 				for (var i = 0; i < lastIndex + 1; i++) {
			// 						cbs[i].checked = false;
			// 				}
			// 		}
			// } else {
			// 		cbs[this._lastSelected].checked = false;
			// }
			for (let j = 0; j < cbs.length; j++) {
			  if (cbs[j].checked) {
				  this.arrayOfValue.push(this.element.options[j].value);
			  }
			}
			this.element.value = this.arrayOfValue;
			this.eventEmitter.emit({'id':this.element.identifier, 'grp':this.element['field_group'], 'value': this.element.value});
			this.element['change'] = true;
	}
}


