import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    // NoConflictStyleCompatibilityMode, CompatibilityModule,
    MatCheckboxModule
} from '@angular/material';


import {TableComponent} from './table.component';
import {FormModule} from "../form/form.module";
import {FormUtilsService} from "../form-utils/form-utils.service";
import {SharedFormsModulesModule} from "../shared/shared-forms-modules.module";
import {WidgetFormModule} from "../widget-form/widget-form.module";
import {CalendarModule} from 'primeng/calendar';

@NgModule({
    declarations: [
        TableComponent
    ],
    imports: [
        FormModule,
        ReactiveFormsModule,
        CommonModule,
        SharedFormsModulesModule,
        MatButtonModule,
        MatMenuModule,
        MatToolbarModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        // NoConflictStyleCompatibilityMode,
        // CompatibilityModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        FormModule,
        WidgetFormModule,
        CalendarModule
    ],
    providers: [FormUtilsService],
    exports: [TableComponent, FormModule, WidgetFormModule]
})
export class TableModule {
}
