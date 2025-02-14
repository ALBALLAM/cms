import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SignInComponent} from "./sign-in.component";

const routes: Routes = [
	{ path: '', component: SignInComponent }
];

export const signInRouting: ModuleWithProviders = RouterModule.forChild(routes);
