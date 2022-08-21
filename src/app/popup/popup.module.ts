import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PopupComponent} from "./popup.component";
import {FormModule} from '../form/form.module';


@NgModule({
	imports: [
		CommonModule,
        FormModule
	],
	declarations: [PopupComponent],
	exports: [PopupComponent]
})
export class PopupModule {
}
