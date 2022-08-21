export interface Translation {
    value: string;
}

export interface Form {
    _id: string;
    fields: Field[];
}

export interface Field {
    label: string;
    subtitle: string;
    identifier: string;
    type: string;
    required: boolean;
    customizedDesign: boolean;
    validation: string;
    group: any;
    group_confirm: any;
    options: Option[];
    hidden: boolean;
    form_hidden: boolean;
    table_hidden: boolean;
    value: any;
    order: string;
    dependencies: any;
    readonly: boolean;
    change: boolean;
    visited: boolean;
    error: string;
    allowClear: boolean;
    valid: boolean;
    changed: boolean;
    isEmpty: boolean;
    isIcon: boolean;
    field_sub_group: boolean;
    isPoster: boolean;
    isArabic: boolean;
    headerView: boolean;
    showUTC: boolean;
    showBasedTimezone: boolean;
    maxSize: number;
    oldAmount: any;
    maxSizeSentence: string;
    getData: string;
    selectedId: string;
    timezone: string;
    initialValue: any;
}

export interface FormFieldValue {
    id: string;
    value: string;
    order: string;
}

export interface Option {
    text: string;
    value: string;
}

export interface FieldStructureValidation {
    value: string;
    error_message: string;
}

export interface FieldLengthValidation {
    value: number;
    error_message: Translation;
}

export interface Strength {
    has_digit: boolean;
    has_lowercase: boolean;
    has_uppercase: boolean;
    strength: StrengthLevel;
}

export interface StrengthLevel {
    id: number;
    text: string;
}



