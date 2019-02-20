import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-tarjetas',
  templateUrl: './tarjetas.component.html',
  styleUrls: ['./tarjetas.component.css']
})
export class TarjetasComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public persona = this._appComponent.getPersonaActual();
	public listTarjeta: Array<string>;
	public listTarjetaConsumo: Array<string>;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  	ngOnInit() {
  		this.getTarjeta();
  		this.getTarjetaConsumo();
  	}

  	getTarjeta(){
		let me = this;
		let personaActualID = this.persona[0];
	    me.ipc.send("getTarjeta", personaActualID)
	    me.ipc.on("resultSentTarjeta", function (evt, result) {
			me.listTarjeta = [];
			for (var i = 0; i < result.length; i++) {				
				me.listTarjeta.push(result[i]);				
			}
			me.ref.detectChanges()
	    });
	}

	getTarjetaConsumo(){
		let me = this;
		me.listTarjetaConsumo = [];
		for (var i = 0; i < me.listTarjeta.length; i++) {				
			let tarjetalID = me.listTarjeta[i][ID_TARJETA];
		    me.ipc.send("getTarjetaConsumo", tarjetalID)
		    me.ipc.on("resultSentTarjetaConsumo", function (evt, result) {
				for (var i = 0; i < result.length; i++) {				
					me.listTarjetaConsumo.push(result[i]);				
				}
				me.ref.detectChanges()
		    });			
		}
	}
}
