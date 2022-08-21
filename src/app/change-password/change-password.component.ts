import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Field, FormFieldValue, Strength} from '../form/form.interface';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import SHA256 from 'sha256-es';
import {CommunicationService} from '../communication/communication.service';
import {ApiService} from '../api/api.service';
import {MatDialogRef} from '@angular/material';
import {changePassword} from '../changePasswordForm';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
    @ViewChild('closeButton') closeButton: ElementRef;
    @ViewChild('closeButtonStart') closeButtonStart: ElementRef;
    validationForm: FormGroup = new FormGroup({});
    old_password: string;
    new_password: string;
    confirm_password: string;
    strength: Strength;
    responsePage: any = changePassword;
    responseChangePass: any;
    hasLoaded: boolean = false;
    fields: {} = {};
    has_digit: boolean;
    has_lowercase: boolean;
    has_uppercase: boolean;
    valid: boolean;
    open: boolean;
    submitted: boolean = false;
    showError: boolean = false;
    errorMessage: string;

    constructor(private _formBuilder: FormBuilder,
                private _communicationService: CommunicationService,
                private _apiService: ApiService,
                private dialogRef: MatDialogRef<any>) {
    }

    ngOnInit() {
        this._communicationService.showLoading(true);
        this.getPageCallback();
        //this.getPage();
    }

    private getPage(): void {
        // this._apiService.sendApi('get', '/configure/changePassword', '', true, false)
        //   .subscribe(data => this.responsePage = data,
        //     (err) => {
        //       $('#closeButtonStart').click();
        //       this.errorCallBack(err);
        //     }, () => {
        //       this.getPageCallback();
        //     });
    }

    private getPageCallback(): void {
        this.hasLoaded = true;
        this.buildForm();
        this._communicationService.showLoading(false);
    }

    private errorCallBack(error): void {
        this._communicationService.showLoading(false);
        this.closeDialog();
        this._communicationService.showError(error.status);
    }

    changePassword(): void {
        this.showError = false;
        if (this.old_password && this.new_password) {
            if ((this.old_password != this.new_password) && (this.confirm_password == this.new_password)) {
                this._communicationService.showLoading(true);
                const params = {
                    oldPassword: SHA256.hash(this.old_password),
                    password: SHA256.hash(this.new_password)
                };
                this.submitted = true;
                this._apiService.sendApi('put', '/cmsUser/password/change', params, true, false)
                    .subscribe(data => this.responseChangePass = data,
                        (err) => {
                            this.changePasswordError(err);
                        }, () => {
                            this.changePasswordCallback();
                        });
            } else {
                if (this.old_password == this.new_password) {
                    this.errorMessage = 'Old and New password cannot be the same';
                    this.showError = true;
                } else if (this.confirm_password != this.new_password) {
                    this.errorMessage = 'Password does not match';
                    this.showError = true;
                }
            }
        } else {
            this.validationForm.controls['old_password_field'].markAsTouched();
            this.validationForm.controls['new_password_field'].markAsTouched();
            this.validationForm.controls['confirm_password_field'].markAsTouched();
        }
    }

    private changePasswordCallback(): void {
        this._communicationService.showLoading(false);
        this.closeDialog();
        this._communicationService.showAlert('Your Password was successfully changed');
    }

    private changePasswordError(error: any): void {
        switch (error.status) {
            case 400: {
                let messageError = error.data.error;
                this.errorMessage = messageError.message;
                this.showError = true;
            }
                break;
            default: {
                this._communicationService.showError(error.status);
            }
                break;
        }
        this._communicationService.showLoading(false);
    }

    openStrengthMeter(): void {
        this.open = true;
        this.validatePasswordStrength();
    }

    validatePasswordStrength(): void {
        this.valid = false;
        this.getPasswordStrength(this.new_password);
    }

    getPasswordStrength(password: string) {
        // if (/\d/.test(password))
        //     this.has_digit = true;
        // else this.has_digit = false;
        //
        // if (/[a-z]/.test(password))
        //     this.has_lowercase = true;
        // else this.has_lowercase = false;
        //
        // if (/[A-Z]/.test(password))
        //     this.has_uppercase = true;
        // else this.has_uppercase = false;

        // if (this.has_digit && this.has_lowercase && this.has_uppercase && password.length > 7) {
        if (password && password.length > 7) {
            this.valid = true;
            this.open = false;
            // this.strength.strength.id = 2;
            // this.strength.strength.text = 'Strong!';
        } else this.open = true;
    }

    private buildForm() {
        this.validationForm = this._formBuilder.group({});
        if (this.responsePage.fields && this.responsePage.fields.length) {
            for (var i = 0; i < this.responsePage.fields.length; i++) {
                this.addFieldValidation(this.responsePage.fields[i]);

                this.fields[this.responsePage.fields[i].identifier] = this.responsePage.fields[i];
            }
        }
    }

    // private addFieldValidation(zField) {
    //
    //   let fieldValidators = [];
    //
    //   if (zField.required)
    //     fieldValidators.push(Validators.required);
    //
    //   if (zField.required && zField.identifier!='old_password_field') {
    //       console.log('zField',zField);
    //       fieldValidators.push(Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}'));
    //   }
    //
    //   let control: FormControl = new FormControl(null, fieldValidators);
    //   this.validationForm.addControl(zField.identifier, control);
    // }

    private addFieldValidation(zField) {

        let fieldValidators = [];

        if (zField.required)
            fieldValidators.push(Validators.required);

        if (zField.required && zField.identifier != 'old_password_field')
            fieldValidators.push(Validators.minLength(8));

        // if (zField.required && zField.identifier === 'new_password_field') {
        //     fieldValidators.push(Validators.pattern('.*[0-9].*'));
        //     fieldValidators.push(Validators.pattern('.*[a-z].*'));
        //     fieldValidators.push(Validators.pattern('.*[A-Z].*'));
        // }

        let control: FormControl = new FormControl(null, fieldValidators);
        this.validationForm.addControl(zField.identifier, control);
    }

    private isPatternValid(pattern): boolean {
        try {
            ''.match(new RegExp(pattern));
            return true;
        } catch (err) {
            return false;
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
