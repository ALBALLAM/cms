import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatCheckboxModule
} from '@angular/material';

import {DatatableComponent} from './datatable.component';
import {FormUtilsService} from "../form-utils/form-utils.service";
import {SharedFormsModulesModule} from "../shared/shared-forms-modules.module";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";

@NgModule({
    declarations: [
        DatatableComponent
    ],
    imports: [
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
        BrowserAnimationsModule,
        MatCheckboxModule,
    ],
    providers: [FormUtilsService],
    exports: [DatatableComponent],
    entryComponents: [VideoDialogComponent]
})
export class DatatableModule {
}
