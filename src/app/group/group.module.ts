import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GroupComponent} from './group.component';
import {GroupItemComponent} from './group-item/group-item.component';
import {GroupDirective} from './group.directive';
import {GroupService} from "./group.service";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [GroupComponent, GroupItemComponent, GroupDirective],
	exports: [GroupComponent],
	providers: [GroupService],
	entryComponents: [
		GroupItemComponent
	]
})
export class GroupModule {
}
