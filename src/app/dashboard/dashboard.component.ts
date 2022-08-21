import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    @Input() public data;
    @Input() public attributesObject;

    constructor(private _router: Router) {
    }

    ngOnInit() {}

    routeToSection(section) {
        this._router.navigate([section]);
    }
}
