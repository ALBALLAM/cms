import {
	Component, ComponentFactoryResolver, Input, OnChanges, OnInit,
	ViewChild
} from '@angular/core';
import {GroupDirective} from "./group.directive";
import {GroupItemComponent} from "./group-item/group-item.component";
import {Field} from "../form/form.interface";
import {GroupService} from "./group.service";

@Component({
	selector: 'app-group',
	templateUrl: './group.component.html',
	styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit, OnChanges {
	@ViewChild(GroupDirective) GroupDirective: GroupDirective;
	@Input() element: Field;
	@Input() change: boolean = false;
	subscription: any;
	subscriptionData: any;

	constructor(private componentFactoryResolver: ComponentFactoryResolver, private _groupService: GroupService) {
		this.subscription = this._groupService.getData().subscribe(
			response => {
				this.subscriptionData = response;
				this._subscriptionCallback();
			});
	}

	ngOnInit() {
		this._loadComponent();
	}

	ngOnChanges() {
		if (this.change == true) {
			this._loadComponent();
		}
	}

	private _loadComponent(): void {
		this.change = false;
		this.element.change = false;
		if (typeof (this.element.value) === "object") {
			if (this.element && this.element.value != '' && this.element.value.length > 0) {
				let componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupItemComponent);
				let viewContainerRef = this.GroupDirective.viewContainerRef;
				viewContainerRef.clear();

				for (let index in this.element.value) {
					let componentRef = viewContainerRef.createComponent(componentFactory);
					(<GroupItemComponent>componentRef.instance).element = this.element;
					(<GroupItemComponent>componentRef.instance).data = this.element.value[index];
					(<GroupItemComponent>componentRef.instance).index = parseInt(index);
				}
			} else {
				let viewContainerRef = this.GroupDirective.viewContainerRef;
				viewContainerRef.clear();
			}
		} else {
			this.element.value = [];
			let viewContainerRef = this.GroupDirective.viewContainerRef;
			viewContainerRef.clear();
		}
	}

	private _removeComponent(index): void {
		this.element.value.splice(index, 1);
		this.element["changed"] = true;
		this._loadComponent();
		this._groupService.notifyRemove({
			id: this.element.identifier,
			value: this.element.value,
			type: this.element.type,
			action: 'remove'
		});
	}

	private _subscriptionCallback(): void {
		if (typeof (this.subscriptionData) == 'object' &&
			this.subscriptionData.action == 'removeGroup' &&
			this.subscriptionData.identifier == this.element.identifier
		) {
			this._removeComponent(this.subscriptionData.index);
		}
	}
}
