import {Component, Input, OnInit} from '@angular/core';
import {Field} from "../../form/form.interface";
import {GroupService} from "../group.service";

@Component({
	selector: 'app-group-item',
	templateUrl: './group-item.component.html',
	styleUrls: ['./group-item.component.css']
})
export class GroupItemComponent implements OnInit {
	@Input() data: any;
	@Input() element: Field;
	@Input() index: number;
	hide: boolean = false;

	constructor(private _groupService: GroupService) {
	}

	ngOnInit() {
	}

	close(): void {
		this.hide = true;
		this._groupService.removeComponent({
			identifier: this.element.identifier,
			action: 'removeGroup',
			index: this.index,
			value: this.element.value
		});
	}
}
