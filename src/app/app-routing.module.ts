import {RouterModule, Routes} from '@angular/router';
import {SignInComponent} from "./sign-in/sign-in.component";
import {AdminLayoutComponent} from "./admin-layout/admin-layout.component";
import {PageViewComponent} from "./pageview/pageview.component";
import {AuthGuard} from "./pageview/pageview-guard.service";

const AppRoutes: Routes = [
    {path: 'admin-layout', component: AdminLayoutComponent},
    {path: 'page-view', component: PageViewComponent, canActivate: [AuthGuard]},
    {path: 'sign-in', component: SignInComponent},
    {path: 'reset/:id', component: SignInComponent},
    {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
];

export const AppRoutingModule = RouterModule.forRoot(AppRoutes, {useHash: true});
