import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TopBarComponent} from "./top-bar.component";
import {PopupModule} from "../popup/popup.module";
import {MatMenuModule, MatProgressBarModule} from "@angular/material";
import {MatIconModule} from '@angular/material/icon';

@NgModule({
	imports: [
		CommonModule,
		MatMenuModule,
		PopupModule,
		MatIconModule,
		MatProgressBarModule
	],
	declarations: [
		TopBarComponent
	],
	providers: [],
	exports: [TopBarComponent]
})
export class TopBarModule {
}
