import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NgSelectizeModule} from 'ng-selectize';
import { ColorPickerModule } from 'ngx-color-picker';

import {FormComponent} from './form.component';
import {DateComponent} from './date/date.component';
import {TextComponent} from './text/text.component';
import {CheckboxComponent} from './checkbox/checkbox.component';
import {SelectComponent} from './select/select.component';
import {PasswordComponent} from './password/password.component';
import {NumberComponent} from './number/number.component';
import {TimeComponent} from './time/time.component';
import {FileComponent} from './file/file.component';
import {ResultComponent} from './result/result.component';
import {SharedModulesModule} from '../shared/shared-modules.module';
import {GroupModule} from './group/group.module';
import {
    MatInputModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSelectModule,
    MatOptionModule, MatProgressBarModule
} from '@angular/material';
import {ToggleComponent} from './toggle/toggle.component';
import {MatSlideToggleModule} from '@angular/material';
import {AutoCompleteComponent} from './auto-complete/auto-complete.component';
import {ChipSelectComponent} from './chip-select/chip-select.component';
import {CommunicationService} from '../communication/communication.service';
import {ApiService} from '../api/api.service';
import {MatIconModule} from '@angular/material/icon';
import {EditorModule} from 'primeng/editor';
import {EditorComponent} from './editor/editor.component';
import {ImageComponent} from './image/image.component';
import {Ng2FlatpickrModule} from 'ng2-flatpickr';
import {DatepickerComponent} from './datepicker/datepicker.component';
import {TextAreaComponent} from './textArea/textArea.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import {GalleryComponent} from './gallery/gallery.component';
import {Ng4GeoautocompleteModule} from 'ng4-geoautocomplete';
import {GeoLocationsComponent} from './geo-locations/geo-locations.component';
import {PhoneNumberComponent} from './phone-number/phone-number.component';
import {MultiselectComponent} from "./multiselect/multiselect.component";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import {VideoComponent} from './video/video.component';
import {ChipInputComponent} from "./chip-input/chip-input.component";
import {ColorPickerComponent} from "./colorPicker/colorPicker.component";
import {SeatSelectorComponent} from "./seat-selector/seat-selector.component";
import {SeatChartComponent} from "./seat-selector/seat-chart/seat-chart.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectizeModule,
        SharedModulesModule,
        GroupModule,
        // NoConflictStyleCompatibilityMode,
        // CompatibilityModule,
        MatInputModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        EditorModule,
        Ng2FlatpickrModule,
        MatProgressBarModule,
        NgxMaterialTimepickerModule,
        Ng4GeoautocompleteModule.forRoot(),
        AngularMultiSelectModule,
        ColorPickerModule,
        FlexLayoutModule,
        MatExpansionModule
    ],
    declarations: [
        FormComponent,
        DateComponent,
        TextComponent,
        ColorPickerComponent,
        TextAreaComponent,
        ToggleComponent,
        CheckboxComponent,
        SelectComponent,
        PasswordComponent,
        NumberComponent,
        PhoneNumberComponent,
        ImageComponent,
        TimeComponent,
        FileComponent,
        ResultComponent,
        AutoCompleteComponent,
        ChipSelectComponent,
        EditorComponent,
        ImageComponent,
        DatepickerComponent,
        GalleryComponent,
        GeoLocationsComponent,
        MultiselectComponent,
        VideoComponent,
        ChipInputComponent,
        SeatSelectorComponent,
        SeatChartComponent
    ],
    exports: [
        CommonModule,
        FormComponent,
        DateComponent,
        TextComponent,
        ColorPickerComponent,
        TextAreaComponent,
        ToggleComponent,
        CheckboxComponent,
        SelectComponent,
        PasswordComponent,
        NumberComponent,
        PhoneNumberComponent,
        TimeComponent,
        FileComponent,
        ResultComponent,
        ImageComponent,
        GalleryComponent,
        GeoLocationsComponent,
        // NoConflictStyleCompatibilityMode,
        // CompatibilityModule,
        MatInputModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
        AutoCompleteComponent,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        ChipSelectComponent,
        MatChipsModule,
        MatSelectModule,
        MatOptionModule,
        MatIconModule,
        EditorModule,
        Ng2FlatpickrModule,
        Ng4GeoautocompleteModule,
        MultiselectComponent,
        AngularMultiSelectModule,
        VideoComponent,
        ChipInputComponent,
        ColorPickerModule,
        SeatSelectorComponent,
        SeatChartComponent,
        FlexLayoutModule,
        MatExpansionModule
    ],
    providers: [ApiService, CommunicationService]
})
export class FormModule {
}
