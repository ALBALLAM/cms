import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {Field} from "../form.interface";
import {ENTER} from "@angular/cdk/keycodes";
import {MatAutocompleteSelectedEvent, MatChipInputEvent} from "@angular/material";
import {element} from "protractor";

@Component({
    selector: 'app-chip-select',
    templateUrl: './chip-select.component.html',
    styleUrls: ['./chip-select.component.css']
})
export class ChipSelectComponent implements OnInit {
    @Input() element: Field;
    @Input() floatLabel: boolean;
    @Input() addNewButton: boolean;
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Output() customEventEmitter: EventEmitter<any> = new EventEmitter<any>();
    additionalClass: any;
    filteredValues: any;
    removable: boolean = true;
    selectable: boolean = true;
    addOnBlur: boolean = false;
    separatorKeysCodes = [ENTER];
    blurClicked2:boolean=false;
    newValueToAdd:string;
    chipItems;
    @ViewChild("autocompleteInput") autocompleteInput: ElementRef;

    constructor() {
    }

    ngOnInit() {
        this.chipItems = [];
        if(!this.element.value){
            this.element.value=[];
        }else{
            this.element.value.forEach(elementValue => {
                this.element.options.forEach(option => {
                    if (elementValue === option.value) {
                        this.chipItems.push(option.text);
                    }
                });
            });
        }
        this.filteredValues = this.element.options;
    }

    filterValues(search) {
        this.filteredValues = this.element.options.filter(value =>
            value.text.toLowerCase().indexOf(search.toLowerCase()) === 0);
    }

    checkValueOption(value,options) : boolean{
        for(let option of options){
            if(option.text==value || option.value==value){
                if(this.element.value.indexOf(option.value)>-1){
                    return false;
                }else{
                    this.newValueToAdd=option.value;
                    return true;
                }

            }
        }
        return false;
    }

    add(event: MatChipInputEvent): void {
        let input = event.input;
        let value = event.value;
        if ((value || '').trim()) {
            if (this.checkValueOption(value.trim(), this.element.options)) {
                if(this.newValueToAdd=="ALL"){
                    this.element.value=[];
                    this.element.value.push(this.newValueToAdd);
                }else{
                    this.element.value.push(this.newValueToAdd);
                }

            } else {
                this.autocompleteInput.nativeElement.value = "";
            }
            // Reset the input value
            if (input) {
                input.value = '';
            }
        }
    }

    blur2(event): void {
        this.element.value.length > 0 ? this.blurClicked2 = true : this.blurClicked2 = false;
        // if(this.checkValueOption(this.element.value,this.element.options)){
        // }else{
        // 	this.autocompleteInput.nativeElement.value=null;
        // }
        // this.change();
    }

    remove(itemObj: any): void {
        let index = this.chipItems.indexOf(itemObj);
        if (index >= 0) {
            this.element.value.splice(index, 1);
            this.chipItems.splice(index, 1);
        }
        this.change();
    }

    change(): void {
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'value': this.element.value,
            'grp': this.element['field_group']
        });
        this.element['change'] = true;
    }

    addOption(event: MatAutocompleteSelectedEvent): void {
        let value = event.option.value;
        let text = event.option.viewValue;
        if ((value || '').trim()) {
            if (this.checkValueOption(value.trim(), this.element.options)) {
                if(this.newValueToAdd=="ALL"){
                    this.element.value=[];
                    this.chipItems.value = [];
                    this.element.value.push(this.newValueToAdd);
                    this.chipItems.push(this.newValueToAdd);
                }else{
                    this.element.value.push(this.newValueToAdd);
                    if (this.chipItems === undefined) {
                        this.chipItems = [];
                    }
                    this.chipItems.push(text);
                }
            }
        }
        this.autocompleteInput.nativeElement.value=null;
        this.change();
    }
}
