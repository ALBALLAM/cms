import {
    AfterViewInit, Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Field, Form, FormFieldValue } from './form.interface';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as GlobalVariables from '../globalVariables';
import { FormUtilsService } from '../form-utils/form-utils.service';
import { element } from "protractor";

declare var $: any;


@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, AfterViewInit {
    @Input() FormId: string;
    @Input() FormFieldValues: FormFieldValue[];
    @Input() FormFields: Field[];
    @Input() dataLists: any[];
    @Input() SavedData: any;
    @Input() FormFieldsErrors: any;
    @Input() FormFieldsOrder: any[];
    @Output() eventEmitter: EventEmitter<any> = new EventEmitter<any>();
    @Input() blockTitle: string;
    @Input() visited: boolean;
    @Input() floatLabel = true;
    @Input() validation: any;
    @Input() isLogin = false;
    validationForm: any;
    addField: any;
    form: Form;
    fields: Field[] = [];
    fieldsTemp: Field[] = [];
    valid: boolean = false;
    @Input() dependencies: any;
    @Input() buttons: any[];
    @Output() submitBtns: EventEmitter<any> = new EventEmitter<any>();
    @Output() notifyParent: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _formBuilder: FormBuilder, private formUtils: FormUtilsService) {
    }

    ngOnInit() {
        this.callback();
        for (var j = 0; j < this.fields.length; j++) {
            this.onNotify({ 'id': this.fields[j]['identifier'], 'grp': this.fields[j]['field_group'] });
            this.fields[j]['validationText'] = this.validation && this.validation[this.fields[j].validation] ? this.validation[this.fields[j].validation]['text'] : '';
        }
    }

    ngAfterViewInit() {
        this.eventEmitter.emit('init');
    }

    submitButon(buttonId): void {
        this.submitBtns.emit(buttonId);
    }

    emptyFields(): void {
        this.validationForm.reset();
    }

    callback(): void {
        let identifiersOrder = [];
        this.fieldsTemp = this.FormFields;

        for (var j = 0; j < this.fieldsTemp.length; j++) {
            identifiersOrder[this.fieldsTemp[j]['order']] = this.fieldsTemp[j]['identifier'];
        }

        for (var i = 0; i < identifiersOrder.length; i++) {
            for (var j = 0; j < this.fieldsTemp.length; j++) {
                if (identifiersOrder[i] == this.fieldsTemp[j]['identifier']) {
                    this.fields.push(this.fieldsTemp[j]);
                    if (this.FormFieldValues && this.FormFieldValues[this.fieldsTemp[j]['identifier']] == undefined) this.FormFieldValues[this.fieldsTemp[j]['identifier']] = '';
                    break;
                }
            }
        }
        this.addValidation();
    }

    prepareFieldGroup(field: any): void {
        let tempFieldValue = [];
        if (typeof (field.value) === 'object') {
            if (field.value && field.value.length > 0) {
                for (let item in field.value) {
                    for (let fieldItem of field.fields) {
                        fieldItem.value = field.value[item][fieldItem.identifier] ? field.value[item][fieldItem.identifier] : '';
                    }
                    const groupBox = this.formUtils.getGroupBoxValidation(field);
                    if (groupBox) {
                        tempFieldValue.push(field.value[item]);
                        for (let fieldItem of field.fields) {
                            fieldItem.value = '';
                        }

                    } else {
                        field.value = tempFieldValue;

                        break;
                    }
                }
            }
        }
    }

    transform(value: string) {
        if (value && typeof (value) == 'string') {
            value = value.toLowerCase();
            return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
    }

    addValidation(): void {
        let group = {};

        for (var i = 0; i < this.fields.length; i++) {
            if (this.fields[i].type == 'title') continue;
            if (this.fields[i].type == 'fields-group') {
                for (var j = 0; j < this.fields[i]['fields'].length; j++) {
                    if (this.fields[i]['fields'][j].type == 'title') continue;
                    group = this.addFieldValidation(this.fields[i]['fields'][j], group);
                }
            }
            else group = this.addFieldValidation(this.fields[i], group);
        }

        if (group != undefined) {
            this.validationForm = this._formBuilder.group(group);
        } else {
            this.validationForm = new FormGroup({});
        }
    }

    addFieldValidation(zField, group): any {
        if (zField.type !== 'file') {
            let fieldValidators = [];

            let regex: string = this.validation && this.validation[zField.validation] ? this.validation[zField.validation].regex : undefined;

            if (zField.type == 'email') {
                regex = '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
            }

            // Handle missing regex
            if (!regex || regex == undefined) {
                regex = '^[a-zA-Z-_ ]*$';
            }

            regex = regex.replace('//', '/');

            if (!zField.readonly && zField.type !== 'time' && zField.type !== 'date') {

                if (zField.required)
                    fieldValidators.push(Validators.required);
                if (regex && this.isPatternValid(regex))
                    fieldValidators.push(Validators.pattern(regex));
            }
            let fieldAttributes = { value: zField.value, disabled: zField.readonly };
            let control: FormControl = new FormControl(fieldAttributes, fieldValidators);

            group[zField.identifier] = control;

            let elementGroup = {};
            elementGroup[zField.identifier] = control;
            zField['group'] = new FormGroup(elementGroup);

            if (zField.identifier == 'password_field') {
                let control_confirm: FormControl = new FormControl(null, Validators.required);
                elementGroup['confirm_' + zField.identifier] = control_confirm;

                let fieldGroup = {};
                fieldGroup['confirm_' + zField.identifier] = control_confirm;
                zField['group_confirm'] = new FormGroup(elementGroup);

            }

            return group;
        }
    }

    onNotify(fieldObj): void {
        if (fieldObj && fieldObj.value) {
            if (this.dependencies && this.dependencies.length > 0) {
                for (const dependency of this.dependencies) {
                    if (dependency.field === fieldObj.id && !fieldObj.hidden && dependency.value.indexOf(fieldObj.value) > -1) {
                        for (const field of this.fields) {
                            if (dependency.changeField.indexOf(field.identifier) > -1) {
                                if (dependency.changeType === 'maxLength') {
                                    field[dependency.changeType] = dependency.newValue;
                                    if (field && field.value && field.value !== '') {
                                        field.value = field.value.substring(0, dependency.newValue);
                                    }
                                } else if (dependency.changeType === 'show') {
                                    field.hidden = false;
                                } else if (dependency.changeType === 'hide') {
                                    field.hidden = true;
                                    if (field.type !== 'table-input') {
                                        if (!field.initialValue) {
                                            field.value = '';
                                            field.group.get(field.identifier).markAsUntouched();
                                            field.group.get(field.identifier).markAsPristine();
                                        }
                                    }
                                } else if (dependency.changeType === 'changeOptions') {
                                    for (const fieldToCheck of this.fields) {
                                        const fieldToGetOptions = dependency.changeField[0] + '_' + fieldObj.value;
                                        if (fieldToCheck.identifier === fieldToGetOptions) {
                                            field.options = fieldToCheck.options;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (fieldObj.type === 'multi-select') {
            for (let field of this.fields) {
                if (field.identifier === fieldObj.id) {
                    let newArray = [];
                    for (let value of field.group.controls[field.identifier].value) {
                        newArray.push(value.id);
                    }
                    field.value = newArray;
                }
            }
        } else if (fieldObj.type === 'phone_number') {
            for (let field of this.fields) {
                if (field.identifier === fieldObj.id) {
                    field.value = {
                        number: fieldObj.number,
                        phoneCode: fieldObj.phoneCode
                    };
                }
            }
        }
    }

    onCustomNotify(object): void {
        this.eventEmitter.emit(object);
        this.notifyParent.emit(object);
    }

    process(date) {
        if (date) {
            try {
                var parts = date.split('/');
                if (parts.length == 3)
                    return new Date(parts[2], parts[1] - 1, parts[0]);
            } catch (err) {
                return date;
            }
        }
    }

    applyDependencies(dependencies, fieldChanged): void {
        var success, depFields, depFieldDeps, j, x, values;
        var changedFieldValue = fieldChanged['value'];
        var depFieldTmp;
        if (changedFieldValue instanceof Array) changedFieldValue = changedFieldValue[0];
        for (j = 0; j < dependencies.length; j++) {
            success = fieldChanged.hidden ? false : true;
            if (success) {
                if (dependencies[j]['op'] == 'eq') {
                    values = dependencies[j]['value'].split(',');
                    success = false;
                    for (x = 0; x < values.length; x++) {
                        if (changedFieldValue == values[x]) {
                            success = true;
                            break;
                        }
                    }
                }
                else if (dependencies[j]['op'] == 'neq') {
                    success = (changedFieldValue != dependencies[j]['value'] && changedFieldValue != '');
                }
                else if (dependencies[j]['op'] == 'lt') {
                    success = (changedFieldValue < dependencies[j]['value']);
                }
                else if (dependencies[j]['op'] == 'gt') {
                    success = (this.process(changedFieldValue) > this.process(dependencies[j]['value']));
                }
            }
            depFields = dependencies[j]['fields'].split(',');

            for (x = 0; x < depFields.length; x++) {
                if (fieldChanged['field_group']) {
                    var groupField = this.FormFields[this.FormFieldsOrder[fieldChanged['field_group']]];
                    for (var i = 0; i < groupField['fields'].length; i++) {
                        if (groupField['fields'][i].identifier == depFields[x]) {
                            depFieldTmp = groupField['fields'][i];
                            break;
                        }
                    }
                }
                else depFieldTmp = this.FormFields[this.FormFieldsOrder[depFields[x]]];
                if (depFieldTmp == undefined) {
                }
                if (dependencies[j]['action'] == 'show') {
                    depFieldTmp.hidden = !success;
                    if (success && depFieldTmp['type'] == 'fields-group') {
                        if ($('.' + depFieldTmp['identifier'] + '.grp-box').length == 0 &&
                            !$('#' + depFieldTmp['identifier'] + ' .grp-elements-container').is(':visible')) {
                            $('#' + depFieldTmp['identifier'] + ' .grp-elements-container').show();
                            for (var y = 0; y < depFieldTmp['fields'].length; y++) {
                                depFieldTmp['fields'][y]['value'] = '';
                                if (depFieldTmp['fields'][y]['type'] == 'dropdown') {
                                    depFieldTmp['fields'][y]['change'] = false;
                                    depFieldTmp['fields'][y]['visited'] = false;
                                }
                                else {
                                    this.validationForm.controls[depFieldTmp['fields'][y]['identifier']].markAsPristine();
                                    this.validationForm.controls[depFieldTmp['fields'][y]['identifier']].markAsUntouched();
                                }
                            }
                        }
                    }
                }
                else if (dependencies[j]['action'] == 'hide') {
                    depFieldTmp.hidden = success;
                }
                else if (success && dependencies[j]['action'] == 'set') {

                    depFieldTmp['value'] = dependencies[j]['fieldValue'];
                    if (depFieldTmp.type == 'dropdown') depFieldTmp.changed = false;
                    else if (depFieldTmp.type == 'phone_number') {
                        $('#' + depFields[x]).val(depFieldTmp['value']);
                        this.FormFields[this.FormFieldsOrder[depFields[x]]].valid = true;
                    }
                    else {
                        this.validationForm.controls[depFieldTmp.identifier].markAsPristine();
                        this.validationForm.controls[depFieldTmp.identifier].markAsUntouched();
                    }
                }
                else if (dependencies[j]['action'] == 'disable') {
                    depFieldTmp.readonly = success;
                }
                depFieldDeps = depFieldTmp.dependencies;
                if (depFieldDeps != undefined) {
                    this.applyDependencies(depFieldDeps, depFieldTmp);
                }
            }
        }
    }

    hideDependentFields(depFieldDeps, success): void {
        var depFields, x, z;
        for (x = 0; x < depFieldDeps.length; x++) {
            if (depFieldDeps[x]['action'] == 'show') {
                depFields = depFieldDeps[x]['fields'].split(',');
                for (z = 0; z < depFields.length; z++) {
                    this.FormFields[this.FormFieldsOrder[depFields[z]]].hidden = !success;
                    if (this.FormFields[this.FormFieldsOrder[depFields[z]]].dependencies != undefined)
                        this.hideDependentFields(this.FormFields[this.FormFieldsOrder[depFields[z]]].dependencies, success);
                }
            }
        }
    }

    isPatternValid(pattern): boolean {
        try {
            ''.match(new RegExp(pattern));
            return true;
        } catch (err) {
            return false;
        }
    }

    validateGroup(showError: boolean, withScroll: boolean): boolean {
        this.valid = false;
        let validForm = true;
        let scrollToElmnt = withScroll;

        for (let field of this.fields) {
            if (!field.hidden) {
                if (field.type === 'title' || field.hidden || field.readonly || field.form_hidden) continue;
                if (field.type === 'time') {
                    if (field.error && field.error !== '') validForm = false;
                    if (field.required && (field.value === '' || field.value == null)) {
                        if (showError) {
                            field.group.controls[field.identifier].markAsTouched();
                        }
                        field.change = true;
                        validForm = false;
                    } else if (field.type === 'time') {
                        const regex = new RegExp(GlobalVariables.timeRegExp);
                        const valid = regex.test(field.value);
                        if (!valid) {
                            validForm = false;
                        } else {
                            if (field.value && field.value != '') {
                                field.value = field.value.replace('am', 'AM');
                                field.value = field.value.replace('pm', 'PM');
                            }
                        }
                    }
                } else if (field.type === 'phone_number') {
                    if (field.required && ((typeof (field.value) == 'string' && field.value == '')
                        || (typeof (field.value) != 'string' &&
                            (field.value.number == '' || field.value.number == null || !field.value.phoneCode || field.value.phoneCode == '')))) {
                        if (showError) {
                            field.group.controls[field.identifier].markAsTouched();
                            field.visited = true;
                            $('#' + field.identifier).click();
                            $('#' + field.identifier).blur();
                        }
                        field.valid = false;
                        validForm = false;
                    } else {
                        if ((typeof (field.value) != 'string')) {
                            field.value = field.value.phoneCode + '-' + field.value.number;
                        }
                        field.change = true;
                    }
                } else if (field.type == 'checkbox') {
                    if (field.value == '') {
                        validForm = false;
                    }
                } else if (field.type == 'text-area') {
                    if (field.required && (field.value == '' || !field.value)) {
                        validForm = false;
                        if (showError) {
                            field.group.controls[field.identifier].markAsTouched();
                        }
                        if (showError) {
                            $('#' + field.identifier).click();
                            $('#' + field.identifier).blur();
                            field.group.controls[field.identifier].markAsTouched();
                            field.group.controls[field.identifier].updateValueAndValidity();
                        }
                    }
                } else if (field.type == 'color-picker') {
                    if (field.required && (field.value == '' || !field.value)) {
                        validForm = false;
                    }
                } else if (field.type == 'chip-select') {
                    if (field.required && (!field.value || field.value.length == 0)) {
                        validForm = false;
                    }
                } else if (field.type == 'seat-selector') {
                    if (field.required && (!field.value || field.value.length == 0)) {
                        validForm = false;
                        field.group.controls[field.identifier].markAsTouched();
                    }
                } else if (field.type == 'chip-input') {
                    if (field.required && (!field.value || field.value.length == 0)) {
                        validForm = false;
                    }
                } else if (field.type == 'auto-complete') {
                    if (field.required && field.value == '') {
                        validForm = false;
                    }
                } else if (field.type == 'date') {
                    if (field.required && field.value == '') {
                        validForm = false;
                    }
                } else if (field.type === 'datepicker') {
                    field.changed = true;
                    if (field.required && field.value === '') {
                        validForm = false;
                    }
                } else if (field.type == 'fields-group') {
                    let grpValid = true;
                    let allEmpty = true;
                    for (var grpField of field['fields']) {
                        if (grpField.type == 'title' || grpField.hidden || grpField.readonly) continue;
                        if (grpField.type == 'date') {
                            if (grpField.required && (grpField.value == '' || grpField.value == null)) {
                                grpValid = false;
                                grpField.group.controls[grpField.identifier].markAsTouched();
                            }
                            if (grpField.value && grpField.value.length > 0) allEmpty = false;
                        } else if (grpField.type == 'checkbox') {
                            if (grpField.required && grpField.value == '') grpValid = false;
                            else allEmpty = false;
                        } else if (grpField.type == 'text-area') {
                            if (grpField.required && grpField.value == '') grpValid = false;
                        } else if (grpField.type == 'dropdown' || grpField.type == 'multi-select') {
                            if (grpField.value && grpField.value.length > 0) allEmpty = false;
                            if (grpField.required && grpField.value == '') {
                                grpValid = false;
                                if ((!field['value'] || field['value'] == '') && showError) {
                                    grpField.change = true;
                                }
                            }
                        } else {
                            var valid = grpField.group.controls[grpField.identifier].valid;
                            if (!valid) {
                                grpValid = false;
                                if ((!field['value'] || field['value'] == '') && showError) {
                                    $('#' + grpField.identifier).click();
                                    $('#' + grpField.identifier).blur();
                                    grpField.group.controls[grpField.identifier].updateValueAndValidity();
                                }
                            } else if (grpField.value && grpField.value.length > 0) allEmpty = false;
                        }
                    }
                    if (grpValid && !allEmpty) {
                        this.addToTable(field, false);
                        $('#' + field.identifier + ' .grp-elements-container').hide();
                    }
                } else if (field.type == 'multi-select') {
                    if (!field.value || (field.value.length === 0)) field.value = '';
                    if (field.required && field.value == '') {
                        validForm = false;
                        if (showError) {
                            field.group.controls[field.identifier].markAsTouched();
                        }
                        if (showError) {
                            field.change = true;
                        }
                    }
                } else if (field.type == 'dropdown') {
                    if (!field.value || (field.value.length === 0)) field.value = '';
                    if (field.required && field.value == '') {
                        validForm = false;
                        if (showError) {
                            field.group.controls[field.identifier].markAsTouched();
                        }
                        if (showError) {
                            field.change = true;
                        }
                    }
                } else if (field.type == 'auto-complete') {
                    if (field.required && field.value.city == '') {
                        validForm = false;
                        if (showError) {
                            $('#' + field.identifier).click();
                            $('#' + field.identifier).val('');
                            $('#' + field.identifier).addClass('ng-invalid ng-touched');
                        }
                    }
                } else if (field.type == 'number' && field['format'] == 'account_number') {
                    if (!field.valid) {
                        $('#' + field.identifier).click();
                        $('#' + field.identifier).blur();
                        field.group.controls[field.identifier].markAsTouched();
                    }
                } else if (field.type === 'editor') {
                    field.changed = true;
                    if (field.required) {
                        if (!field.value || field.value.length === 0) {
                            validForm = false;
                        }
                    }

                } else if (field.type === 'toggle') {
                    if (field.value && field.value == '') {
                        validForm = false;
                    }
                } else if (field.type === 'file') {

                } else if (field.type === 'image' || field.type === 'gallery') {
                    if (field.required) {
                        if (!field.value || field.value.length === 0) {
                            validForm = false;

                            if (showError) {
                                field.valid = false;
                            }
                        }
                    }
                } else if (field.type === 'video') {
                    if (field.required) {
                        if (!field.value || field.value.length === 0) {
                            validForm = false;

                            if (showError) {
                                field.valid = false;
                            }
                        }
                    }
                } else if (field.type === 'location') {
                    if (field.required) {
                        if (!field.value || field.value.length === 0) {
                            validForm = false;

                            if (showError) {
                                field.valid = false;
                            }
                        }
                    }
                } else {
                    let valid = field.group.controls[field.identifier].valid;
                    if (!valid) {
                        validForm = false;
                        if (showError) {
                            $('#' + field.identifier).click();
                            $('#' + field.identifier).blur();
                            field.group.controls[field.identifier].markAsTouched();
                            field.group.controls[field.identifier].updateValueAndValidity();
                        }

                    } else {
                        if (field.error && field.error != '') {
                            validForm = false;
                        }
                    }

                }
            }
            if (scrollToElmnt && !validForm) {
                scrollToElmnt = false;
                document.getElementById(field.identifier).scrollIntoView();
            }
        }
        if (validForm) {
            this.valid = true;
        }
        return this.valid;
    }

    validateBlock(): boolean {
        let valid = true;
        for (var field of this.fields) {
            if (field.type == 'date' || field.type == 'title' || field.hidden) continue;
            else if (field.type == 'dropdown' || field.type == 'multi-select') {
                if (field.required && field.value == '') {
                    valid = false;
                    break;
                }
            } else {

                if (field.required && field.value == '') {
                    valid = false;
                    break;
                }

                if (this.validation[field.validation].regex.value != '') {
                    var regex = new RegExp(this.validation[field.validation].regex.value);
                    if (!regex.test(field.value)) {
                        valid = false;
                        break;
                    }
                }
            }
        }

        return this.valid;

    }

    addTable(grpFields, groupObj) {
        var hasValue = false;
        var html = '<div class=\'' + groupObj.identifier + ' grp-box\'><div id=\'' + groupObj.identifier + '_close\' class=\'remove-icon\' #' + groupObj.identifier + ' onclick=\' $(this).parent().remove()\'></div>';
        for (var i = 0; i < groupObj['fields'].length; i++) {
            if (grpFields[groupObj['fields'][i].identifier] != null && grpFields[groupObj['fields'][i].identifier] != '') hasValue = true;
            else continue;
            let fieldValue = grpFields[groupObj['fields'][i].identifier];
            if (groupObj['fields'][i]['type'] == 'number') {
                fieldValue = fieldValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
            html += '<div class=\'grp-field ' + groupObj['fields'][i].identifier + '\'><div class=\'grp-field-title\'>' + groupObj['fields'][i]['label'] + '</div><div class=\'grp-field-value\'>' + fieldValue + '</div></div>';
        }
        html += '</div>';
        if (hasValue) $('#' + groupObj.identifier + '_title').append(html);
    }

    addToTable(groupObj, fromBtn, hasSubGroup = null) {
        if (!$('#' + groupObj.identifier + ' .grp-elements-container').is(':visible')) {
            if (groupObj.identifier != 'tax_resident_country_table' || (!groupObj.value || groupObj.value.length < 3)) {
                $('#' + groupObj.identifier + ' .grp-elements-container').show();
            } else {
                this.eventEmitter.emit({
                    id: 'tax_resident_country_table',
                    action: 'showTinPopup'
                });
            }
            return;
        }

        var valueObj = {};
        var validated = true;
        var isEmpty = true;

        for (var i = 0; i < groupObj['fields'].length; i++) {
            if (groupObj['fields'][i]['hidden']) continue;
            if (groupObj['fields'][i]['value'] == null || groupObj['fields'][i]['value'].length == 0) {
                if (groupObj['fields'][i]['required'] == true) {
                    validated = false;
                    if (groupObj['fields'][i]['type'] == 'dropdown') {
                        groupObj['fields'][i].change = true;
                        $('#' + groupObj['fields'][i].identifier + ' input').click();
                        $('#' + groupObj['fields'][i].identifier + ' input').blur();
                    } else {
                        $('#' + groupObj['fields'][i].identifier).click();
                        $('#' + groupObj['fields'][i].identifier).blur();
                    }
                    if (groupObj['fields'][i].group)
                        groupObj['fields'][i].group.controls[groupObj['fields'][i].identifier].updateValueAndValidity();
                    break;
                }
            }
            isEmpty = false;
            let fieldValue = groupObj['fields'][i]['value'];
            valueObj[groupObj['fields'][i]['identifier']] = groupObj['fields'][i]['value'];
        }


        if (isEmpty) return;
        if (validated) {
            if (!groupObj.value) groupObj.value = [];
            groupObj.value.push(valueObj);

            this.eventEmitter.emit({ type: 'field-group', identifier: groupObj.identifier, value: valueObj });
            for (var i = 0; i < groupObj['fields'].length; i++) {
                if (hasSubGroup == null) {
                    groupObj['fields'][i].value = '';
                    if (groupObj['fields'][i].type == 'dropdown') {
                        groupObj['fields'][i].change = false;
                        groupObj['fields'][i].visited = false;
                    }
                    else {
                        this.validationForm.controls[groupObj['fields'][i].identifier].markAsPristine();
                        this.validationForm.controls[groupObj['fields'][i].identifier].markAsUntouched();
                    }
                } else {
                    if (groupObj['fields'][i]['field_sub_group'] == true) {
                        groupObj['fields'][i].value = valueObj[groupObj['fields'][i]['identifier']] ? valueObj[groupObj['fields'][i]['identifier']] : '';

                    } else {
                        groupObj['fields'][i].value = '';
                        if (groupObj['fields'][i].type == 'dropdown') {
                            groupObj['fields'][i].change = false;
                            groupObj['fields'][i].visited = false;
                        }
                        else {
                            this.validationForm.controls[groupObj['fields'][i].identifier].markAsPristine();
                            this.validationForm.controls[groupObj['fields'][i].identifier].markAsUntouched();
                        }
                    }
                }
            }

            if (!fromBtn) $('#' + groupObj.identifier + ' .grp-elements-container').hide();
            groupObj['change'] = true; //will reload the groups to drow the boxes
            groupObj['changed'] = true; //flag that group is changed used for isBlockChanged
            $('#' + groupObj.identifier + ' .grp-elements-container').find('input[subGroup!=\'true\']').val('');
        }
    }

    private getFormFieldValues(): any {
        if (this.FormFieldValues == undefined) this.FormFieldValues = [];

        for (var i = 0; i < this.fields.length; i++) {
            if (this.fields[i].type == 'file') {
                if (this.fields[i]['valid']) {
                    this.FormFieldValues[this.fields[i].identifier] = this.fields[i].value;
                } else delete this.FormFieldValues[this.fields[i].identifier];
            } else this.FormFieldValues[this.fields[i].identifier] = this.fields[i].value;
        }
        return this.FormFieldValues;
    }

    private setFieldCustomErrors(id, error): void {
        for (var i = 0; i < this.fields.length; i++) {
            if (this.fields[i].identifier == id) {
                this.fields[i]['error'] = error;
                break;
            }
        }
    }

    private isPostDay(currentDate, date): boolean {
        if (currentDate.getFullYear() <= date.getFullYear() &&
            currentDate.getMonth() <= date.getMonth() &&
            currentDate.getDate() <= date.getDate()
        ) {
            return true;
        } else return false;

    }

    private _setFieldValue(field: object): void {
        this.validationForm.controls[field['identifier']].setValue(field['value']);
    }

    setUntouchedField(identifier: string): void {
        this.validationForm.controls[identifier].markAsPristine();
        this.validationForm.controls[identifier].markAsUntouched();
    }
}
