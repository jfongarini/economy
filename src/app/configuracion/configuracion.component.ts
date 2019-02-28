import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public persona = this._appComponent.getPersonaActual();
	public listG: Array<string>;
	public listI: Array<string>;
	public tarjetas: Array<string>;
	public inversiones: Array<string>;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

	getCategorias(){
		let me = this;
		let personaActualID = this.persona[0];
	    me.ipc.send("getCategorias", personaActualID)
	    me.ipc.on("resultSentCategorias", function (evt, result) {
			me.listG = [];
			me.listI = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i].GI == 'G') {
					me.listG.push(result[i]);
				} else {
					me.listI.push(result[i]);
				}				
			}
			me.ref.detectChanges()
	    });
	}

	getTarjetas(){
		let me = this;		
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getTarjeta", personaActualID)
		me.tarjetas = [];			
		for (var i = 0; i < result.length; i++) {		
			me.tarjetas.push(result[i]);									
		}
		me.ref.detectChanges()
	}

	getInversiones(){
		let me = this;		
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getInversiones", personaActualID)
		me.inversiones = [];			
		for (var i = 0; i < result.length; i++) {		
			me.inversiones.push(result[i]);									
		}
		me.ref.detectChanges()
	}


	ngOnInit() {
		this.getCategorias();
		this.getTarjetas();
		this.getInversiones();
	}

	public blankInputCategoriaIngreso() {
		(<HTMLInputElement>document.getElementById('submitI')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('submitIerror')).style.visibility="hidden";
	}

	public blankInputCategoriaGasto() {
		(<HTMLInputElement>document.getElementById('submitG')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('submitGerror')).style.visibility="hidden";
	}

	public blankInputTarjeta() {
		(<HTMLInputElement>document.getElementById('submitT')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('submitTerror')).style.visibility="hidden";
	}

	public blankInputInversion() {
		(<HTMLInputElement>document.getElementById('submitV')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('submitVerror')).style.visibility="hidden";
	}
 
	public insertCategoriaGasto() {
		event.preventDefault();
		let personaActualID = this.persona[0];
		var res = (<HTMLInputElement>document.getElementById('submitG')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitG')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitGerror')).style.visibility="visible";
		} else {
			this.blankInputCategoriaGasto();
			let me = this;
		    me.ipc.send("insertCategoriaGasto", personaActualID, res);
		    this.getCategorias();
		}
	}

	public insertCategoriaIngreso() {
		event.preventDefault();
		let personaActualID = this.persona[0];
		var res = (<HTMLInputElement>document.getElementById('submitI')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitI')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitIerror')).style.visibility="visible";
		} else {
			this.blankInputCategoriaIngreso();
			let me = this;
		    me.ipc.send("insertCategoriaIngreso", personaActualID, res);
		    this.getCategorias();
		}
	}

	public removeCategoria(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteCategoria", id);
	    this.getCategorias();
	}

	public insertTarjeta() {
		event.preventDefault();
		let personaActualID = this.persona[0];
		var res = (<HTMLInputElement>document.getElementById('submitT')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitT')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitTerror')).style.visibility="visible";
		} else {
			this.blankInputTarjeta();
			let me = this;
		    me.ipc.send("insertTarjeta", personaActualID, res);
		    this.getTarjetas();
		}
	}

	public removeTarjeta(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteTarjeta", id);
	    this.getTarjetas();
	}


	public insertInversion() {
		event.preventDefault();
		let personaActualID = this.persona[0];
		var res = (<HTMLInputElement>document.getElementById('submitV')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitV')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitVerror')).style.visibility="visible";
		} else {
			this.blankInputInversion();
			let me = this;
		    me.ipc.send("insertInversion", personaActualID, res);
		    this.getInversiones();
		}
	}

	public removeInversion(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteInversion", id);
	    this.getInversiones();
	}

}