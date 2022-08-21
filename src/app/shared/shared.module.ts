import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MaterializeModule} from "ng2-materialize";
import {RouterModule} from "@angular/router";
import {SharedService} from "./shared.service";
import {SidebarModule} from "ng-sidebar";
import {ErrorPageModule} from "../error-page/error-page.module";


@NgModule({
  imports: [
    RouterModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterializeModule.forRoot(),
    SidebarModule.forRoot(),
    ErrorPageModule
  ],
  providers: [
    SharedService
  ],
  exports: [
    RouterModule,
    HttpModule,
    FormsModule,
    BrowserAnimationsModule,
    MaterializeModule,
    SidebarModule,
    ErrorPageModule
  ]
})
export class SharedModule {
}
