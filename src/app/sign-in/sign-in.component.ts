import { Component, OnInit, ViewChild } from '@angular/core';
import SHA256 from 'sha256-es';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunicationService } from '../communication/communication.service';
import { PageViewComponent } from '../pageview/pageview.component';
import { ApiService } from '../api/api.service';
import { FormUtilsService } from '../form-utils/form-utils.service';
import { SignInService } from "./sign-in.service";

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
    loading = true;
    response: any;
    errorMessage: string = '';
    showErrorMessage = false;
    email: string = '';
    password: string = '';
    sideMenus: any = [];
    originalSavedSideMenu: any;
    sideMenuLinks: any;

    @ViewChild('reset') resetEmail;
    @ViewChild('resetForm') resetForm;
    responseOtp: any;
    responseResendOtp: any;
    responseReset: any
    checkPasswordTokenResponse: any;
    responseResetForm: any;
    resetFields = [{
        identifier: 'email',
        label: 'Email',
        options: null,
        order: 0,
        required: true,
        type: 'email',
        validation: 'mail_validator',
    }];
    resetButtons = [
        { id: 'submit', label: 'Submit', style: 'submit' }
    ];
    resetPasswordFields = [
        {
            identifier: 'password',
            label: 'New Password',
            options: null,
            order: 0,
            required: true,
            type: 'password',
            validation: 'password_validator',
        },
        {
            identifier: 'confirm_password',
            label: 'Confirm New Password',
            options: null,
            order: 1,
            required: true,
            type: 'password',
            validation: 'password_validator',
        }
    ];
    resetPasswordButtons = [
        { id: 'submit', label: 'Submit', style: 'submit' }
    ];
    resetFormFieldsOrder = { email: 0 };
    resetPasswordFormFieldsOrder = { password: 0, confirm_password: 1 };
    validation = {
        'free_text_validator': {
            'regex': '^.*$',
            'text': 'Wrong format'
        },
        'number_validator': {
            'regex': '^[+-]?(([0-9]+(\\,[0-9][0-9][0-9])*(\\.[0-9]*)?)|(\\.[0-9]+))$',
            'text': 'Invalid number'
        },
        'mail_validator': {
            'regex': '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
            'text': 'Invalid email'
        },
        'password_validator': {
            'regex': '^.{8}.*$',
            'text': 'Minimum 8 Characters'
        }
    };
    showResetEmail = false;
    showResetForm = false;
    showLoginForm = true;
    resetFormToken: string;

    constructor(private _router: Router, private _apiService: ApiService, private _communicationService: CommunicationService,
        private formUtils: FormUtilsService, private _route: ActivatedRoute, private _signInService: SignInService) {
    }

    ngOnInit() {
        this._communicationService.closeSideBar();
        localStorage.clear();
        sessionStorage.clear();
        if (this._router.url !== '/sign-in') {
            this._route.params.subscribe(params => {
                if (params['id'] && params['id'] !== '') {
                    this.resetFormToken = params['id'];
                    this.showLoginForm = false;
                    this.showResetForm = true;
                    this._checkPasswordToken();
                } else {
                    this._router.navigate(['/sign-in']);
                }
            });
        }
    }

    submit() {
        this.showErrorMessage = false;
        if (this.email === '' || this.password === '') {
            this.errorMessage = 'Username and password are required';
        } else {
            this.errorMessage = '';
            this._communicationService.showLoading(true);
            let params = {};
            params['username'] = this.email.toLowerCase().replace('+', '%2B');
            params['password'] = SHA256.hash(this.password);
            params['grant_type'] = 'password';
            this._apiService.authenticate(params)
                .subscribe(data => this.response = data,
                    (err) => {
                        this.errorCallBack(err);
                        this._communicationService.showLoading(false);
                    }, () => {
                        localStorage.setItem('fullname', this.response.cmsName);
                        localStorage.setItem('email', this.response.email);
                        this.callback();
                    });
        }
    }

    private _checkPasswordToken() {
        this._communicationService.showLoading(true);
        this._apiService.sendApi('get', '/cmsUser/checkPasswordToken/' + this.resetFormToken, {}, false, false)
            .subscribe(response => this.checkPasswordTokenResponse = response,
                error => {
                    this._communicationService.showLoading(false);
                    this._communicationService.showAlert('Your reset link has been expired');
                    this._router.navigate(['/sign-in']);
                },
                () => {
                    this._communicationService.showLoading(false);
                }
            );
    }

    private _filterSideMenuLink() {
        this.sideMenuLinks = {};
        for (let section of this.sideMenus) {
            if (section.children && section.children.length > 0) {
                for (let child of section.children) {
                    this.sideMenuLinks[child.link] = child;
                }
            } else {
                this.sideMenuLinks[section.link] = section;
            }
        }
        return this.sideMenuLinks;
    }

    callback(): void {
        const tokenInfo = {
            'access_token': this.response.access_token,
            'expires_in': this.response.expires_in,
            'refresh_token': this.response.refresh_token,
            'refresh_token_header': this.response.refresh_token_header
        };
        const userRole = this.response.profiles[0].name;

        localStorage.setItem('token', JSON.stringify(tokenInfo));
        localStorage.setItem('userRole', userRole);
        let sideMenuArray = [];
        let addedSection = [];
        this._signInService.getSideMenu().subscribe(response => this.originalSavedSideMenu = response,
            (err) => {
                this._communicationService.showLoading(false);
            },
            () => {
                for (let section of this.originalSavedSideMenu) {
                    if (addedSection.indexOf(section.tab_abrev) > -1 || section.canRead === false) {
                        continue;
                    }
                    let obj = {
                        section_identifier: section.section_id,
                        state: section.isParent ? '' : section.link,
                        link: section.isParent ? section.link : section.link,
                        name: section.section_name,
                        hidden: section.menuHidden,
                        type: section.isParent ? 'sub' : 'link',
                        icon: section.icon_name,
                        selected: '',
                        manageFields: section.manageFields
                    };

                    if (section.isParent) {
                        let children = [];
                        let index = 1;
                        for (let sub_section of section.children) {
                            if (sub_section.canRead === false) {
                                continue;
                            }
                            let objChildren = {
                                state: sub_section.link,
                                link: sub_section.link,
                                name: sub_section.section_name,
                                hidden: sub_section.menuHidden,
                                icon: sub_section.icon_name,
                                tooltip: sub_section.section_name,
                                selected: ''
                            };
                            children.push(objChildren);
                            index++;
                        }
                        obj['children'] = children;
                    }
                    if (!section.isParent || (section.isParent && obj['children'].length > 0)) {
                        sideMenuArray.push(obj);
                        addedSection.push(section.link);
                    }
                }
                this.sideMenus = sideMenuArray;
                let params = {};
                if (this.sideMenus[0].children && this.sideMenus[0].children.length > 0) {
                    this.sideMenus[0].selected = 'selected';
                    this.sideMenus[0].children[0].selected = 'selected';
                    params = {
                        state: this.sideMenus[0].state,
                        chilstate: this.sideMenus[0].children[0].state,
                        url: this.sideMenus[0].state != '' ? this.sideMenus[0].state + '/' + this.sideMenus[0].children[0].state : this.sideMenus[0].children[0].state,
                        previousUrl: this._router.url
                    };
                } else {
                    this.sideMenus[0].selected = 'selected';
                    params = {
                        state: this.sideMenus[0].state,
                        url: this.sideMenus[0].state,
                        previousUrl: this._router.url
                    };
                }
                let sideMenusLinks = this._filterSideMenuLink();

                sessionStorage.setItem('side-menu-params', JSON.stringify(this.sideMenus));
                sessionStorage.setItem('side-menu-params-links', JSON.stringify(sideMenusLinks));
                const routing = this._router.config;
                let skip = false;
                for (let section in sideMenusLinks) {
                    for (const route of routing) {
                        if (route.path === section) {
                            skip = true;
                            break;
                        }
                    }
                    if (!skip) {
                        this._router.config.push({ path: section, component: PageViewComponent });
                    }
                }
                let routingParam = '/' + params['url'];
                sessionStorage.setItem('routing-params', JSON.stringify(params));
                this._communicationService.initializeApp();
                this._router.navigate([routingParam]);
            });
    }

    errorCallBack(error: any): void {
        sessionStorage.clear();
        this.loading = false;
        if (error.status === 401) {
            this.showErrorMessage = true;
            this.errorMessage = 'Incorrect username or password';
        } else {
            this.showErrorMessage = false;
            this._communicationService.showError(error.status);
        }
    }

    submitReset(): void {
        let params = this.formUtils.getGroupFields(this.resetEmail);
        params.email = params.email.toLowerCase();

        if (this.resetEmail.validateGroup(true, false)) {
            this._communicationService.showLoading(true);

            this._apiService.sendApi('put', '/cmsUser/sendResetOtp', params, false, false)
                .subscribe(response => this.responseReset = response,
                    error => {
                        this._communicationService.showLoading(false);
                        this._resetErrorCallback(error);
                    },
                    () => {
                        this._communicationService.showLoading(false);
                        this.email = params.email;
                        this.errorMessage = '';
                        this._resetCallback();
                    }
                );
        }
    }

    private _resetCallback(): void {
        this._communicationService.showAlert('A verification link was sent to your email');
        this.showResetEmail = false;
        this.showLoginForm = true;
    }

    private _resetErrorCallback(error): void {
        switch (error.status) {
            default:
                break;
        }
        this._communicationService.showError(error.status);
    }

    submitResetForm(): void {
        let params = this.formUtils.getGroupFields(this.resetForm);
        if (this.resetForm.validateGroup(true, false)) {
            if (params['password'] != params['confirm_password']) {
                this.errorMessage = "Password and Confirm Password do not match";
                this.showErrorMessage = true;
            } else {
                this.showErrorMessage = false;
                this._communicationService.showLoading(true);
                params['password'] = SHA256.hash(params['password']);
                params['token'] = this.resetFormToken;
                delete params['confirm_password'];
                this._apiService.sendApi('put', '/cmsUser/resetPassword', params, false, false)
                    .subscribe(response => this.responseResetForm = response,
                        error => {
                            this._communicationService.showLoading(false);
                            this._submitResetFormErrorCallback(error);
                        },
                        () => {
                            this._communicationService.showLoading(false);
                            this._submitResetFormCallback();
                        }
                    );
            }
        }
    }

    private _submitResetFormCallback(): void {
        this._communicationService.showAlert('Your password has been changed successfully');
        this.showResetForm = false;
        this.showLoginForm = true;
        this._router.navigate(['/sign-in']);
    }

    private _submitResetFormErrorCallback(error): void {
        switch (error.status) {
            case 401:
                this._communicationService.showAlert('Your reset link has been expired');
                break;
            default:
                this._communicationService.showAlert('Some errors occurred');
                break;
        }
    }

    forgotPassword() {
        this.showResetEmail = true;
        this.showLoginForm = false;
        if (this.email && this.email != '') {
            this.resetFields[0]['value'] = this.email;
        } else {
            this.resetFields[0]['value'] = ''
        }
    }
}
