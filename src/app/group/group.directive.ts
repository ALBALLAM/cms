import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
	selector: '[appGroup]'
})
export class GroupDirective {

	constructor(public viewContainerRef: ViewContainerRef) {
	}
}

