import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChangePasswordComponent} from "./change-password.component";
import {ReactiveFormsModule} from "@angular/forms";
import {SharedModulesModule} from "../shared/shared-modules.module";
import {SharedFormsModulesModule} from "../shared/shared-forms-modules.module";
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
	imports: [
		CommonModule,
		SharedModulesModule,
		ReactiveFormsModule,
		SharedFormsModulesModule,
    MatDialogModule
	],
	declarations: [ChangePasswordComponent],
	providers: [],
	exports: [ChangePasswordComponent],
	entryComponents: [
		ChangePasswordComponent,
	]
})
export class ChangePasswordModule {
}
