import {NgModule} from '@angular/core';
import {AdminLayoutComponent} from "./admin-layout.component";
import {CommonModule} from "@angular/common";
import {SidebarModule} from "ng-sidebar";
import {AdminLayoutRouting} from "./admin-layout-routing.module";
import {PageViewModule} from "../pageview/pageview.module";
import {MatSidenavModule} from "@angular/material";
import {TableModule} from "../table/table.module";
import {TopBarModule} from "../top-bar/top-bar.module";
import {LoadingModule} from "../loading/loading.module";

@NgModule({
    declarations: [
        AdminLayoutComponent
    ],
    imports: [
        CommonModule,
        AdminLayoutRouting,
        PageViewModule,
        TableModule,
        SidebarModule.forRoot(),
        MatSidenavModule,
        TopBarModule,
        LoadingModule
    ],
    exports: [AdminLayoutComponent]
})
export class AdminLayoutModule {
}
