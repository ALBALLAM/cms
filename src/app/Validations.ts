export const Validation={
    free_text_validator: {
        regex: '^.*$',
        text: 'Wrong format'
    },
    number_validator: {
        regex:'^[+-]?(([0-9]+(\\,[0-9][0-9][0-9])*(\\.[0-9]*)?)|(\\.[0-9]+))$',
        text:'Invalid number'
    },
    mail_validator: {
        regex:'^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
        text:'Invalid email'
    }
};