import {Component, AfterViewInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';

import { IPopupButton } from './popup.interfaces';
import {FormUtilsService} from '../form-utils/form-utils.service';
declare var $: any;

@Component({
	selector: 'app-popup',
	templateUrl: './popup.component.html',
	styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements AfterViewInit {

	@Input() title: string;
	@Input() subTitle: string;
	@Input() buttons: IPopupButton[];
	@Input() loading: boolean;
	@Input() showCloseButton: boolean;
	@Input() showForm: boolean;
	@Input() form: any;
	@Input() extraInfo: any;
	@Input() fieldsOrder: any;
	@Input() validation: any;
	@Input() dataLists: any;
    @ViewChild('myappfrmpopup') child;
	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
	isShown = true;

	constructor(private formUtils: FormUtilsService) { }

	ngAfterViewInit() {
		if(this.showForm){
			for(let formfield of this.form){
				formfield.group.controls[formfield.identifier].setValue(null);
				formfield.group.controls[formfield.identifier].markAsUntouched();
				formfield.group.controls[formfield.identifier].markAsPristine();
				formfield.group.reset();
			}
		}
		$(".popup-content-one").addClass("load");
		$(".popup-container").addClass("load");
	}

	targetFunction(index: number) {
		if(this.showForm){
            if (this.child.validateGroup(true, false)) {
                const params = this.formUtils.getGroupFields(this.child);
                this.eventEmitter.emit({type:'setValueForm',values:params});
                for(let element of this.form) {
                	if(element.type==='toggle') {
						element.value = false;
					}
				}
                // this.form=null;
                this.buttons[index].function();
            }
		}else{
            if (this.buttons[index].link) {
                window.open(this.buttons[index].link, "_blank");
            }
            else {
                this.buttons[index].function();
            }
		}

	}

	closePopUp(): void{
		this.isShown = false;
		this.form=null;
		this.eventEmitter.emit({type:'closePopUp'});
	}
}
