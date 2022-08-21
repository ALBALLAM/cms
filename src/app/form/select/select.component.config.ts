export const SELECT_PRESET_VALUE_CONFIG = Object.assign({}/*, DEFAULT_DROPDOWN_CONFIG*/, {
	highlight: false,
	create: false,
	persist: true,
	plugins: ['dropdown_direction', 'remove_button'],
	dropdownDirection: 'down',
	labelField: 'text',
	valueField: 'value',
	searchField: ['text']
});

export const SINGLE_SELECT_PRESET_VALUE_CONFIG = Object.assign({}/*, DEFAULT_DROPDOWN_CONFIG*/, {
	highlight: false,
	create: false,
	persist: true,
	plugins: ['dropdown_direction', 'remove_button'],
	dropdownDirection: 'down',
	labelField: 'text',
	valueField: 'value',
	searchField: ['text']
});

export const MULTI_SELECT_PRESET_VALUE_CONFIG = Object.assign({}/*, DEFAULT_DROPDOWN_CONFIG*/, {
	highlight: false,
	create: false,
	persist: true,
	plugins: ['dropdown_direction', 'remove_button'],
	dropdownDirection: 'down',
	labelField: 'text',
	valueField: 'value',
	searchField: ['text'],
	maxItems:100
});
