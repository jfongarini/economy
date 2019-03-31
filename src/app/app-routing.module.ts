import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './main/main.component';
import { DiarioComponent } from './diario/diario.component';
import { InversionesComponent } from './inversiones/inversiones.component';
import { DiarioInversionesComponent } from './diario-inversiones/diario-inversiones.component';
import { GraficoComponent } from './grafico/grafico.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { TarjetasComponent } from './tarjetas/tarjetas.component';

const routes: Routes = [
  { path: '', redirectTo: 'diario-inversiones', pathMatch: 'full' },
  { path: 'home', component: MainComponent },
  { path: 'diario', component: DiarioComponent },
  { path: 'inversiones', component: InversionesComponent },
  { path: 'diario-inversiones', component: DiarioInversionesComponent },
  { path: 'grafico', component: GraficoComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: 'tarjetas', component: TarjetasComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
