import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PageViewComponent} from './pageview.component';
import {SharedFormsModulesModule} from "../shared/shared-forms-modules.module";
import {TableModule} from "../table/table.module";
import {AuthGuard} from "./pageview-guard.service";
import {DashboardComponent} from "../dashboard/dashboard.component";
import {WidgetCardModule} from "../widget-cards/widget-card.module";
import {MatrixComponent} from "../matrix/matrix.component";
import {KpiComponent} from "../kpi/kpi.component";
import {BookTicketsDashboardComponent} from "../bookTicketsDashboard/bookTicketsDashboard.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FormModule} from "../form/form.module";

@NgModule({
    imports: [
        CommonModule,
        TableModule,
        SharedFormsModulesModule,
        WidgetCardModule,
        FormModule,
        FormsModule,
        ReactiveFormsModule],
    declarations: [PageViewComponent, DashboardComponent, MatrixComponent, KpiComponent, BookTicketsDashboardComponent],
    providers: [AuthGuard],
    exports: [PageViewComponent, SharedFormsModulesModule]
})
export class PageViewModule {
}
