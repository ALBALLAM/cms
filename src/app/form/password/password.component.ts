import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Field, FormFieldValue, Strength} from '../form.interface';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  @Input() element: Field;
  @Input() value: string;
  @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
  field: FormFieldValue;

  confirm_password: string;
  strength: Strength;
  open: boolean;
  valid: boolean;
  clickedConfirm: boolean = false;

  constructor() {
    this.open = false;
    this.valid = false;
    this.strength = {
      has_digit: false,
      has_lowercase: false,
      has_uppercase: false,
      strength: {
        id: 1,
        text: 'Medium'
      }
    };
  }

  ngOnInit() {
  }

  blurFn(): void {
    this.open = false;
  }

  clickConfirmPassword(): void {
    if (!this.valid) {
      this.clickedConfirm = true;
    } else this.clickedConfirm = true;
  }

  validatePasswordStrength(): void {
    this.getPasswordStrength(this.element.value);
  }

  openStrengthMeter(): void {
    this.open = true;
    this.validatePasswordStrength();
  }

  getPasswordStrength(password: string) {
    if (/\d/.test(password))
      this.strength.has_digit = true;
    else this.strength.has_digit = false;

    if (/[a-z]/.test(password))
      this.strength.has_lowercase = true;
    else this.strength.has_lowercase = false;

    if (/[A-Z]/.test(password))
      this.strength.has_uppercase = true;
    else this.strength.has_uppercase = false;

    if (this.strength.has_digit && this.strength.has_lowercase && this.strength.has_uppercase && password.length > 7) {
      this.valid = true;
      this.open = false;
      this.strength.strength.id = 2;
      this.strength.strength.text = 'Strong!';
    } else this.open = true;

  }

  change(): void {
    this.eventEmitter.emit({'id': this.element.identifier, 'grp': this.element['field_group'], 'value': this.element.value});
  }

}
