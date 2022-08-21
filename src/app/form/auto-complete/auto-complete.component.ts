import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Field} from "../form.interface";
import {Observable, Subject} from "rxjs";
import {ApiService} from "../../api/api.service";
import {CommunicationService} from "../../communication/communication.service";
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
	selector: 'app-auto-complete',
	templateUrl: './auto-complete.component.html',
	styleUrls: ['./auto-complete.component.css']
})
export class AutoCompleteComponent implements OnInit {
	@Input() element: Field;
	@Input() floatLabel: boolean;
	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
	additionalClass: any;
	searchTerm$ = new Subject<string>();
	optionsList:any=[];
	spinnerActive=false;

	constructor(private _apiService:ApiService,private _communicationService:CommunicationService) {
	}

	ngOnInit() {
		// this.search(this.searchTerm$).subscribe((response) => {
		// 		this.optionsList = [];
		// 		if(response) {
		// 			this.fillOptionList(response);
		// 		}
		// 	},
		// 	(error) => {
		// 		this.getPageErrorCallback(error);
		// 		this.stopSpinner();
		// 	},
		// 	()=>{
		// 		this.stopSpinner();
		// 	});
		if(this.element.value){
			this.element.value=this.element.value.value;
			this.eventEmitter.emit({
				'id': this.element.identifier,
				'value': this.element.value,
				'grp': this.element['field_group']
			});
		}
	}

	startSpinner() {
		this.spinnerActive = true;
	}
	stopSpinner() {
		let foundItem=false;
		let emptyValue=false;
		if(this.element.value && this.element.value!=''){
			if(this.optionsList && this.optionsList.length>0) {
				for (let option of this.optionsList) {
					if (option.value === this.element.value) {
						foundItem=true;
						break;
					}
				}
				if(!foundItem){
					this.element.group.get(this.element.identifier).setValue('');
					emptyValue=true;
				}
			}
		} else {
			this.element.group.get(this.element.identifier).setValue('');
			emptyValue=true;
		}
		if(emptyValue){
			this.element.value='';
			this.eventEmitter.emit({
				'id': this.element.identifier,
				'value': this.element.value,
				'grp': this.element['field_group']
			});
		}
		this.spinnerActive = false;
	}

	fillOptionList(res){
		for(let option of res){
			this.optionsList.push({
				value:option.id,
				text:option[this.element.identifier]
			})
		}
	}

	change(event): void {
		this.element.value=event.option.value.value;
		this.eventEmitter.emit({
			'id': this.element.identifier,
			'value': this.element.value,
			'grp': this.element['field_group']
		});
		this.stopSpinner();
	}

	loadList($event) {
		if ($event && $event.target.value && $event.target.value.length > 1) {
			this.searchTerm$.next($event.target.value);
			this.startSpinner();
		}
	}

		search(terms: Observable<string>) {
		// return terms.debounceTime(1000)
         //    .distinctUntilChanged()
         //    .switchMap(term => this._apiService.sendApi('get',this.element['api']+"?"+this.element.identifier+"="+term, '', true, false));
	}
	private getPageErrorCallback(error): void {
		this._communicationService.showLoading(false);
		this._communicationService.showError(error.status);
	}

	displayFn(option){
		return option.text;
	}
}
