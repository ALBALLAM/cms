import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MatFormFieldAppearance} from '@angular/material';
import {countries} from './countries';
import {Field} from '../form.interface';

@Component({
    selector: 'app-phone-number',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.component.scss']
})
export class PhoneNumberComponent implements OnInit {
    @Input() element: Field;
    @Input() public hint: string;
    @Input() public floatLabel: boolean;
    @Output() public keyUpEvent = new EventEmitter();
    @Output() public changeValueEvent = new EventEmitter();
    public countryCode: string;
    public selectedCountryCode: string;
    public line: string;
    public selectedOptions = [];
    public countries = countries;
    public disabledOptions: boolean;

    public triggerKeyUp(event) {
        this.changeValueEvent.emit({
            id: this.element.identifier,
            type: 'phone_number',
            phoneCode: this.selectedCountryCode,
            number: this.element.group.get(this.element.identifier).value
        });
    }

    public ngOnInit() {
        if (this.element.value && this.element.value != '') {
            this.element.value = {
                phoneCode: this.element.value.split('-')[0],
                number: this.element.value.split('-')[1]
            };
        }
        for (const item of this.countries) {
            const text = item.name + ' ( ' + item.dial_code + ' ) ';
            this.selectedOptions.push({text, value: item.dial_code});
        }
        this.countryCode = this.element.identifier + 'CountryCode';
        this.line = this.element.identifier + 'Line';
        this.disabledOptions = false;
        if (this.element.value && this.element.value.number && this.element.value.number !== '') {
            this.element.group.get(this.element.identifier).setValue(this.element.value.number);
        } else {
            this.element.group.get(this.element.identifier).setValue('');
        }
        if (this.element.value && this.element.value.phoneCode && this.element.value.phoneCode !== '') {
            this.selectedCountryCode = this.element.value.phoneCode;
        }
    }

    public onKeyPress(event) {
        return this._allowCharacter(event);
    }

    public changeValue(event) {
        this.selectedCountryCode = event.value;
        this.countries.map((country) => {
            if (country.dial_code === event.value) {
                this.changeValueEvent.emit({
                    id: this.element.identifier,
                    type: 'phone_number',
                    phoneCode: event.value,
                    number: this.element.group.get(this.element.identifier).value
                });
            }
        });
    }

    public search(query: string) {
        this.selectedOptions = this.select(query);
        if (this.selectedOptions.length === 0) {
            this.selectedOptions.push({text: 'No match found', value: 'noMatchFound'});
            this.disabledOptions = true;
            this.element.group.controls[this.countryCode].setValue('');
        } else {
            this.disabledOptions = false;
        }
    }

    public select(query: string): string[] {
        const result = [];
        for (const a of this.countries) {
            if (a.name.toLowerCase().indexOf(query) > -1 || a.dial_code.toLowerCase().indexOf(query) > -1) {
                const text = a.name + ' ( ' + a.dial_code + ' ) ';
                result.push({text, value: a.dial_code});
            }
        }
        return result;
    }

    private _allowCharacter(event): boolean {
        const allowedInputs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace'];
        const inputValue = this._getValue();
        let allowInput = false;
        if (allowedInputs.indexOf(event.key) > -1) {
            allowInput = !(
                (inputValue === '' && event.key === '.') ||
                (inputValue.indexOf('.') > -1 && event.key === '.') ||
                (event.key !== '.' && inputValue.indexOf('.') > -1 && inputValue.split('.')[1].length === 2)
            );
        }
        return allowInput;
    }

    private _getValue(): string {
        return this.element.group.get(this.element.identifier).value ? this.element.group.get(this.element.identifier).value.toString() : '';
    }

}
