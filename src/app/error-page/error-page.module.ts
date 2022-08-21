import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorPageComponent} from "./error-page.component";
import {PopupModule} from "../popup/popup.module";

@NgModule({
	imports: [
		CommonModule,
	  	PopupModule
	],
	declarations: [ErrorPageComponent],
	exports: [ErrorPageComponent],
})
export class ErrorPageModule {
}
