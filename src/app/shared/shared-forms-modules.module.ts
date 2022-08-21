import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormModule} from '../form/form.module';
import {FormsModule} from '@angular/forms';
import {DataTableModule,DropdownModule,MultiSelectModule,InputTextModule,CalendarModule,ButtonModule} from 'primeng/primeng';
import {PopupModule} from '../popup/popup.module';
import {LoadingModule} from '../loading/loading.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MomentModule} from 'angular2-moment';
import { TableModule } from 'primeng/table';

@NgModule({
  imports: [
    CommonModule,
    FormModule,
    FormsModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    PopupModule,
    LoadingModule,
    BrowserAnimationsModule,
    MomentModule,
    TableModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    FormModule,
    FormsModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    InputTextModule,
    CalendarModule,
    ButtonModule,
    PopupModule,
    LoadingModule,
    MomentModule,
    TableModule
  ]
})

export class SharedFormsModulesModule {
}
