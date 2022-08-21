import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {WidgetCardsComponent} from '../widget-cards/widget-cards.component';
import {MatProgressBarModule} from '@angular/material';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FormModule} from '../form/form.module';

@NgModule({
    imports: [CommonModule, FormModule,  FormsModule,
        ReactiveFormsModule],
    declarations: [WidgetCardsComponent],
    exports: [WidgetCardsComponent]
})
export class WidgetCardModule {
}
