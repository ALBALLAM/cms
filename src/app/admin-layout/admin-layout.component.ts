import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {ActivatedRoute, Router, RouterStateSnapshot} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {SharedService} from "../shared/shared.service";
import {appVersion} from "../globalVariables";


@Component({
    selector: "app-layout",
    templateUrl: "./admin-layout.component.html",
    styleUrls: ["./admin-layout.component.scss"]
})

export class AdminLayoutComponent implements OnInit, OnChanges {


    constructor(private _router: Router, private _state: ActivatedRoute, private _sharedService: SharedService) {
        this.subscription = _sharedService.subjectObservable.subscribe(
            response => {
                let res = JSON.parse(response);
                if (res && res.component == 'sign-in' && res.action == 'initialize') {
                    this.initialRouting();
                }
            });
    }

    @Input() menuItems: any;
    private _opened: boolean = true;
    appVersion = appVersion;
    public openSub: boolean;
    subscription: Subscription;

    private _toggleSidebar() {
        this._opened = !this._opened;
    }


    ngOnInit() {
        if (localStorage.getItem('token') && sessionStorage.getItem('side-menu-params')) {
            this.menuItems = JSON.parse(sessionStorage.getItem('side-menu-params'));
        }

    }

    ngOnChanges() {
        if (sessionStorage.getItem('routing-params')) {
            let routingParams = JSON.parse(sessionStorage.getItem('routing-params'));
            if (routingParams.chilstate) {
                this.changeRouting(routingParams.chilstate);
            } else {
                this.changeRouting(routingParams.state);
            }

        }

    }


    initialRouting() {
        this.menuItems = JSON.parse(sessionStorage.getItem('side-menu-params'));
        var section = this.menuItems[0].state;
        if (section) {
            for (var i = 0; i < this.menuItems.length; i++) {
                if (this.menuItems[i].state == section) {
                    this.openSub = true;
                    this.select(i);
                    if (this.menuItems[i].type == 'sub') {
                        var subsection = this.menuItems[0]['children'][0].state;
                        for (var j = 0; j < this.menuItems[i]['children'].length; j++) {
                            if (this.menuItems[i]['children'][j].state == subsection) {
                                this.setSessionValues(section, subsection, i, j);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    changeRouting(state) {
        this.menuItems = JSON.parse(sessionStorage.getItem('side-menu-params'));
        var section = state;
        if (section) {
            for (var i = 0; i < this.menuItems.length; i++) {
                if (this.menuItems[i].state == section && this.menuItems[i].type == 'link') {
                    this.openSub = true;
                    this.select(i);
                } else if (this.menuItems[i].state == section || this.menuItems[i].state == '') {
                    if (this.menuItems[i].type == 'sub') {

                        for (var j = 0; j < this.menuItems[i]['children'].length; j++) {
                            var subsection = this.menuItems[i]['children'][j].state;

                            if (section.indexOf(subsection) > -1) {
                                this.openSub = true;
                                this.select(i);
                                this.setSessionValues(section, subsection, i, j);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }


    resetDropDown() {
        for (var i = 0; i < this.menuItems.length; i++) {
            if (this.menuItems[i]["children"]) {
                for (var j = 0; j < this.menuItems[i]["children"].length; j++) {
                    this.menuItems[i]["children"][j]["selected"] = "";
                }
            }
        }
    }

    resetStates() {
        for (var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i]["selected"] = "";
        }
    }

    removeSessions() {
        for (let item of this.menuItems) {
            sessionStorage.removeItem(item.state);
            sessionStorage.removeItem(item.state + '-search');
            if (item.children && item.children.length > 0) {
                for (let subItem of item.children) {
                    sessionStorage.removeItem(subItem.state);
                    sessionStorage.removeItem(subItem.state + '-search');
                }
            }
        }
    }

    select(index) {
        this.resetStates();
        if (this.menuItems[index]["selected"] == "selected") {
            this.menuItems[index]["selected"] = "";
        } else {
            this.menuItems[index]["selected"] = "selected";
        }
    }

    setSessionValues(state, childstate, index, subindex) {
        this.resetDropDown();
        if (childstate) {
            this.menuItems[index]["children"][subindex]["selected"] = "selected";
        }
        sessionStorage.setItem('side-menu-params', JSON.stringify(this.menuItems));
    }

}
