import {Component, Input, OnInit} from "@angular/core";
import {Field} from "../form.interface";

@Component({
	selector: 'app-result',
	templateUrl: './result.component.html',
	styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit{
	@Input() element: Field;
	@Input() postFix: any;
	@Input() preFix: any;
	@Input() value: number;
	@Input() error: string;

	constructor() {
	}

	ngOnInit(){
		if(this.error)this.element.error = this.error;
		else this.element.error = '';
	}
}
