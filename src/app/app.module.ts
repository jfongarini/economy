import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';

import { AppRoutingModule } from './app-routing.module';
import { DiarioComponent } from './diario/diario.component';
import { InversionesComponent } from './inversiones/inversiones.component';
import { DiarioInversionesComponent } from './diario-inversiones/diario-inversiones.component';
import { GraficoComponent } from './grafico/grafico.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { TarjetasComponent } from './tarjetas/tarjetas.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DiarioComponent,
    InversionesComponent,
    DiarioInversionesComponent,
    GraficoComponent,
    ConfiguracionComponent,
    TarjetasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
