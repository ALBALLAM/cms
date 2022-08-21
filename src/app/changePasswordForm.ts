export const changePassword = {
    "title":"Change Password",
    "fields":[
        {
            "label": "Old Password",
            "identifier": "old_password_field",
            "type": "password",
            "order": 0,
            "required": true,
            "options":null,
            "validation":"password_validator"
        },
        {
            "label": "New Password",
            "identifier": "new_password_field",
            "type": "password",
            "order": 1,
            "required": true,
            "options":null,
            "validation":"password_validator"
        },
        {
            "label": "Confirm Password",
            "identifier": "confirm_password_field",
            "type": "password",
            "order": 2,
            "required": true,
            "options":null,
            "validation": "free_text_validator"
        }
    ],
    "cancel_label":"Cancel",
    "save_label":"Save",
    "field_require_label":"Field is required",
    "new_confirm_match_label":"New and confirm password don't match",
    "old_new_match_label":"Old and new password cannot be the same"

};