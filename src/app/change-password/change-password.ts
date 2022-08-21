export interface ChangePasswordPageResponse{
	title: string;
	fields: any[];
	validation:any;
	saved_data: any;
}

export interface ChangePasswordFields{
	old_password_field: any;
	new_password_field: any;
	confirm_password_field: any;
}

export interface Field {
	label: string;
	identifier: string;
	type: string;
	required: boolean;
	validation: FieldValidation;
	group: any;
	group_confirm: any;
	options: any;
	hidden: boolean;
	value: any;
	order: string;
	dependencies: any;
}

export interface FieldValidation {
	min: FieldLengthValidation;
	max: FieldLengthValidation;
	regex: FieldStructureValidation;
}

export interface FieldLengthValidation {
	value: number;
	error_message: Translation;
}

export interface FieldStructureValidation {
	value: string;
	error_message: string;
}

export interface Translation {
	value: string;
}
