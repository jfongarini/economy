import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { DiarioComponent } from './diario/diario.component';

const routes: Routes = [
    {path: 'home',component: MainComponent},
    {path: 'diario',component: DiarioComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }