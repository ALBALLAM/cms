// import {Component, EventEmitter, Input, AfterViewInit, Output, OnInit} from "@angular/core";
// import {Field} from "../form.interface";
// declare var $: any;
//
//
// @Component({
// 	selector: 'app-phone-number',
// 	templateUrl: './phone-number.component.html',
// 	styleUrls: ['./phone-number.component.css']
// })
// export class PhoneNumberComponent implements OnInit, AfterViewInit {
// 	@Input() element: Field;
// 	@Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
// 	@Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
// 	value: string = '';
// 	hasFocus: boolean = false;
// 	visited: boolean = false;
//
// 	constructor() {
// 	}
//
// 	ngOnInit() {
// 		this.element.valid = true;
// 		this.element['isEmpty'] = true;
// 		this.element['visitedOnce'] = false;
// 	}
//
// 	ngAfterViewInit() {
// 		$("#" + this.element.identifier).inputmask("phone", {
// 			showMaskOnFocus: false,
// 			showMaskOnHover: false,
// 			placeholder: ""
// 		});
//
// 		if (this.element.value) {
// 			setTimeout(() => {
// 				$("#" + this.element.identifier).inputmask("setvalue", this.element.value);
// 				this.value = this.element.value;
// 				this.keyup();
// 			}, 100);
// 		}
// 	}
//
// 	keyup(): void {
// 		this.element.group.get(this.element.identifier).markAsTouched();
//
// 		const value = $("#" + this.element.identifier).val();
// 		let unmaskedValue = value;
// 		unmaskedValue = unmaskedValue.replace(/[+]/, '');
// 		unmaskedValue = unmaskedValue.replace(/-/g, '');
//
// 		if (unmaskedValue == '') {
// 			this.element['isEmpty'] = true;
// 			if (!this.element.required) {
// 				this.element.valid = true;
// 			} else this.element.valid = false;
// 		} else if (unmaskedValue && unmaskedValue.length > 6) {
// 			this.element.value = value;
// 			this.element['isEmpty'] = false;
// 			this.element.valid = true;
// 		} else {
// 			this.element['isEmpty'] = false;
// 			this.element.value = value;
// 			this.element.valid = false;
// 		}
//
// 		this.hasFocus = true;
// 		this.element['change'] = true;
// 	}
//
// 	blur(): void {
// 		let maskedValue = $("#" + this.element.identifier).val();
// 		let unmaskedValue = maskedValue;
// 		unmaskedValue = unmaskedValue.replace(/[+]/, '');
// 		unmaskedValue = unmaskedValue.replace(/-/g, '');
//
// 		if (unmaskedValue == '') {
// 			maskedValue = '';
// 		}
//
// 		this.value = maskedValue;
// 		this.element.value = maskedValue;
// 		this.element.group.controls[this.element.identifier].setValue(maskedValue);
// 		this.element.group.controls[this.element.identifier].updateValueAndValidity();
// 		this.hasFocus = false;
// 	}
// }
