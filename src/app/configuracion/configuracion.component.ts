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
	public idUptate: number;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

	getCategorias(){
		let me = this;
		let personaActualID = this.persona[0];
	    //me.ipc.send("getCategorias", personaActualID)
	    //me.ipc.on("resultSentCategorias", function (evt, result) {
	    let result = me.ipc.sendSync("getCategorias", personaActualID)
			me.listG = [];
			me.listI = [];
			for (var i = 0; i < result.length; i++) {
				if (result[i].VIGENTE == 0){
					if (result[i].GI == 'G') {
						me.listG.push(result[i]);
					} else {
						me.listI.push(result[i]);
				}
				}				
			}
			me.ref.detectChanges()
	    //});
	}

	getTarjetas(){
		let me = this;		
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getTarjeta", personaActualID)
		me.tarjetas = [];			
		for (var i = 0; i < result.length; i++) {	
			if (result[i].VIGENTE == 0){	
				me.tarjetas.push(result[i]);									
			}
		}
		me.ref.detectChanges()
	}

	getInversiones(){
		let me = this;		
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getInversiones", personaActualID)
		me.inversiones = [];			
		for (var i = 0; i < result.length; i++) {		
			if (result[i].VIGENTE == 0){
				me.inversiones.push(result[i]);	
			}								
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
		    (<HTMLInputElement>document.getElementById('submitG')).value = "";
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
		    (<HTMLInputElement>document.getElementById('submitI')).value = "";
		    this.getCategorias();
		}
	}

	public removeCategoriaI(event) {
		var id = event.target.id;
		let me = this;
		let categoria = me.listI.find(cate => cate['ID'] === +id);
		let nombre = categoria['NOMBRE'];
	    me.ipc.send("deleteCategoria", id, nombre);
	    this.getCategorias();
	}

	public removeCategoriaG(event) {
		var id = event.target.id;
		let me = this;
		let categoria = me.listG.find(cate => cate['ID'] === +id);
		let nombre = categoria['NOMBRE'];
	    me.ipc.send("deleteCategoria", id, nombre);
	    this.getCategorias();
	}

	public preUpdateCategoriaI(event) {
		let me = this;
		var id = event.target.id;
		me.idUptate = id;
		let categoria = me.listI.find(cate => cate['ID'] === +id);
		let nombre = categoria['NOMBRE'];
		(<HTMLInputElement>document.getElementById('submitI')).value = nombre;	
		(<HTMLInputElement>document.getElementById('nuevoBotonCI')).style.display="none";	
		(<HTMLInputElement>document.getElementById('editBotonCI')).style.display="inline-block";		
	}

	public updateCategoriaI() {
		let me = this;
		var id = me.idUptate;
		var res = (<HTMLInputElement>document.getElementById('submitI')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitI')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitIerror')).style.visibility="visible";
		} else {
			this.blankInputCategoriaIngreso();
		    me.ipc.send("updateCategoria", id, res);
		    this.getCategorias();
		    (<HTMLInputElement>document.getElementById('editBotonCI')).style.display="none";
			(<HTMLInputElement>document.getElementById('nuevoBotonCI')).style.display="inline-block";
			(<HTMLInputElement>document.getElementById('submitI')).value = "";
		}
	}

	public preUpdateCategoriaG(event) {
		let me = this;
		var id = event.target.id;
		me.idUptate = id;
		let categoria = me.listG.find(cate => cate['ID'] === +id);
		let nombre = categoria['NOMBRE'];
		(<HTMLInputElement>document.getElementById('submitG')).value = nombre;	
		(<HTMLInputElement>document.getElementById('nuevoBotonCG')).style.display="none";	
		(<HTMLInputElement>document.getElementById('editBotonCG')).style.display="inline-block";		
	}

	public updateCategoriaG() {
		let me = this;
		var id = me.idUptate;
		var res = (<HTMLInputElement>document.getElementById('submitG')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitG')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitGerror')).style.visibility="visible";
		} else {
			this.blankInputCategoriaIngreso();
		    me.ipc.send("updateCategoria", id, res);
		    this.getCategorias();
		    (<HTMLInputElement>document.getElementById('editBotonCG')).style.display="none";
			(<HTMLInputElement>document.getElementById('nuevoBotonCG')).style.display="inline-block";
			(<HTMLInputElement>document.getElementById('submitG')).value = "";
		}
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
		    (<HTMLInputElement>document.getElementById('submitT')).value = "";
		    this.getTarjetas();
		}
	}

	public removeTarjeta(event) {
		var id = event.target.id;
		let me = this;
		let tarj = me.tarjetas.find(tar => tar['ID'] === +id);
		let nombre = tarj['NOMBRE'];
	    me.ipc.send("deleteTarjeta", id, nombre);
	    this.getTarjetas();
	}

	public preUpdateTarjeta(event) {
		let me = this;
		var id = event.target.id;
		me.idUptate = id;
		let tarj = me.tarjetas.find(tar => tar['ID'] === +id);
		let nombre = tarj['NOMBRE'];
		(<HTMLInputElement>document.getElementById('submitT')).value = nombre;	
		(<HTMLInputElement>document.getElementById('nuevoBotonT')).style.display="none";	
		(<HTMLInputElement>document.getElementById('editBotonT')).style.display="inline-block";		
	}

	public updateTarjeta() {
		let me = this;
		var id = me.idUptate;
		var res = (<HTMLInputElement>document.getElementById('submitT')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitT')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitTerror')).style.visibility="visible";
		} else {
			this.blankInputTarjeta();
		    me.ipc.send("updateTarjeta", id, res);
		    this.getTarjetas();
		    (<HTMLInputElement>document.getElementById('editBotonT')).style.display="none";
			(<HTMLInputElement>document.getElementById('nuevoBotonT')).style.display="inline-block";
			(<HTMLInputElement>document.getElementById('submitT')).value = "";
		}
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
		    (<HTMLInputElement>document.getElementById('submitV')).value = "";
		    this.getInversiones();
		}
	}

	public removeInversion(event) {
		var id = event.target.id;
		let me = this;
		let inver = me.inversiones.find(inv => inv['ID'] === +id);
		let nombre = inver['NOMBRE'];
	    me.ipc.send("deleteInversion", id, nombre);
	    this.getInversiones();
	}

	public preUpdateInversion(event) {
		let me = this;
		var id = event.target.id;
		me.idUptate = id;
		let inver = me.inversiones.find(inv => inv['ID'] === +id);
		let nombre = inver['NOMBRE'];
		(<HTMLInputElement>document.getElementById('submitV')).value = nombre;	
		(<HTMLInputElement>document.getElementById('nuevoBotonV')).style.display="none";	
		(<HTMLInputElement>document.getElementById('editBotonV')).style.display="inline-block";		
	}

	public updateInversion() {
		let me = this;
		var id = me.idUptate;
		var res = (<HTMLInputElement>document.getElementById('submitV')).value;
		if (res == ""){
			(<HTMLInputElement>document.getElementById('submitV')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('submitVerror')).style.visibility="visible";
		} else {
			this.blankInputInversion();
		    me.ipc.send("updateInversion", id, res);
		    this.getInversiones();
		    (<HTMLInputElement>document.getElementById('editBotonV')).style.display="none";
			(<HTMLInputElement>document.getElementById('nuevoBotonV')).style.display="inline-block";
			(<HTMLInputElement>document.getElementById('submitV')).value = "";
		}
	}


}