import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WidgetFormComponent} from './widget-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormModule} from '../form/form.module';
import {DatatableModule} from "../datatable/datatable.module";
import {VideoDialogComponent} from "../video-dialog/video-dialog.component";

@NgModule({
    imports: [CommonModule, FormModule, FormsModule, ReactiveFormsModule, DatatableModule],
    declarations: [WidgetFormComponent],
    exports: [WidgetFormComponent, DatatableModule],
    entryComponents: [VideoDialogComponent]
})
export class WidgetFormModule {
}
