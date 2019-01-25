import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';

import { AppRoutingModule } from './app-routing.module';
import { DiarioComponent } from './diario/diario.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    DiarioComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
