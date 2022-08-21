import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TooltipModule} from "ngx-bootstrap";
@NgModule({
	imports: [
		CommonModule,
		TooltipModule.forRoot()
	],
	declarations: [],
	exports: [
		CommonModule,
		TooltipModule,
	]
})

export class SharedModulesModule {
}
