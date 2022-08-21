import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppComponent} from "./app.component";
import {AppRoutingModule} from "./app-routing.module";
import {FormUtilsService} from "./form-utils/form-utils.service";
import {DatePipe} from "@angular/common";
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AdminLayoutModule} from "./admin-layout/admin-layout.module";
import {LoadingModule} from "./loading/loading.module";
import {CommunicationService} from "./communication/communication.service";
import {TopBarModule} from "./top-bar/top-bar.module";
import {SignInModule} from "./sign-in/sign-in.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BrowserModule} from "@angular/platform-browser";
import {SidebarModule} from 'ng-sidebar';
import {SharedService} from "./shared/shared.service";
import {ChangePasswordModule} from "./change-password/change-password.module";
import {ApiService} from "./api/api.service";
import {HttpClientModule} from '@angular/common/http';
import {SharedModule} from "./shared/shared.module";
import {MatDialogModule} from '@angular/material/dialog';

import {FormModule} from './form/form.module';
import {ErrorInterceptor} from "./shared/httpInterceptor/error-interceptor.service";
import {VideoDialogComponent} from "./video-dialog/video-dialog.component";


@NgModule({
    declarations: [
        AppComponent,
        VideoDialogComponent
    ],
    imports: [
        BrowserModule,
        SidebarModule.forRoot(),
        // FormsModule,
        // HttpModule,
        AppRoutingModule,
        // ReactiveFormsModule,
        // CompatibilityModule,
        AdminLayoutModule,
        // BrowserAnimationsModule,
        // NoConflictStyleCompatibilityMode,
        LoadingModule,
        SignInModule,
        TopBarModule,
        ChangePasswordModule,
        HttpClientModule,
        SharedModule,
        FormModule,
        MatDialogModule
    ],
    exports: [VideoDialogComponent],
    providers: [
        DatePipe,
        FormUtilsService,
        CommunicationService,
        ApiService,
        HttpClientModule,
        SharedService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
