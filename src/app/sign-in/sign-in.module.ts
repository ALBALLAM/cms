import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SignInComponent} from './sign-in.component';
import {SharedModulesModule} from '../shared/shared-modules.module';
import {FormsModule} from '@angular/forms';
import {signInRouting} from './sign-in.routing';
import {MatInputModule} from '@angular/material';
import {MatFormFieldModule} from '@angular/material/form-field';
import {SharedFormsModulesModule} from '../shared/shared-forms-modules.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModulesModule,
    SharedFormsModulesModule,
    FormsModule,
    signInRouting,
    MatInputModule,
    MatFormFieldModule
  ],
  declarations: [SignInComponent],
  providers: [],
  exports: [SignInComponent]
})

export class SignInModule {
}
