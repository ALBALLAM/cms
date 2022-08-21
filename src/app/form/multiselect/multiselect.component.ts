import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Field} from "../form.interface";

@Component({
    selector: 'app-multiselect',
    templateUrl: './multiselect.component.html',
    styleUrls: ['./multiselect.component.scss']
})
export class MultiselectComponent implements OnInit {

    @Input() element: Field;
    @Input() value: any;
    @Input() floatLabel: boolean;

    @Input() public title: string;
    @Input() public singleSelection: boolean;
    @Input() public text: string;
    @Input() public selectAllText: string;
    @Input() public unSelectAllText: string;
    @Input() public enableSearchFilter = true;
    @Input() public searchPlaceholderText: string;
    @Input() public noDataAvailablePlaceholderText: string;
    @Input() public limitSelection: number;
    @Input() public selectedItems = [];
    @Input() public group: FormGroup;
    @Output() public eventEmitter = new EventEmitter();
    public dropdownSettings = {};

    public ngOnInit() {
        for (let option of this.element.options) {
            option['itemName'] = option.text;
            option['id'] = option.value;
        }
        if (this.element.group.get(this.element.identifier).value && this.element.group.get(this.element.identifier).value.length > 0) {
            for(let selectedOptions of this.element.group.get(this.element.identifier).value) {
                for (let option of this.element.options) {
                    if (selectedOptions == option['id']) {
                        this.selectedItems.push(option);
                    }
                }
            }
        }
        this.dropdownSettings = {
            singleSelection: this.singleSelection,
            text: 'Select',
            selectAllText: 'Select All',
            unSelectAllText: 'Unselect All',
            enableSearchFilter: this.enableSearchFilter,
            searchPlaceholderText: 'Search',
            noDataAvailablePlaceholderText: 'No Data Available',
            disabled: this.element.readonly,
            limitSelection: this.limitSelection,
            closeDropDownOnSelection: false,
            classes: 'multiselect-custom',
            searchBy: ['itemName'],
            maxHeight:150,
            position:'bottom'
        };
    }

    public onItemSelect() {
        this.changeValue();
    }

    public OnItemDeSelect() {
        this.changeValue();
    }

    public onSelectAll() {
        this.changeValue();
    }

    public onDeSelectAll() {
        this.changeValue();
    }

    public saveNewValue() {
        let value = [];
        for (let item of this.selectedItems) {
            value.push(item.value);
        }
        return value;
    }

    public changeValue() {
        this.eventEmitter.emit({
            'id': this.element.identifier,
            'grp': this.element['field_group'],
            'value': this.saveNewValue(),
            'type':'multi-select'
        });
    }

}
