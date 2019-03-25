import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-inversiones',
  templateUrl: './inversiones.component.html',
  styleUrls: ['./inversiones.component.css']
})
export class InversionesComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public persona = this._appComponent.getPersonaActual();
	public listInversiones: Array<string>;
	public listInversionesDiarioAux: Array<string>;
	public listInversionesDiario = new Array();
	public rLength: number;
	public r2Length: number;
	public idInversionesDiario: number;

  	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  	ngOnInit() {
  		this.getInversiones();
  		this.getInversionDiario();
  		this.getInversionDiarioFinal();
  	}

  	getInversiones(){
		let me = this;		
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getInversiones", personaActualID)
		me.listInversiones = [];			
		me.rLength = result.length; 
		for (var i = 0; i < me.rLength; i++) {		
			me.listInversiones.push(result[i]);									
		}
		me.ref.detectChanges()
	}

	getInversionDiario(){
		let me = this;		
	    let result2 = me.ipc.sendSync("getInversionDiario")
    	me.r2Length = result2.length;   	
    	me.listInversionesDiarioAux = [];
		for (var j = 0; j < me.r2Length; j++) {					
			me.listInversionesDiarioAux.push(result2[j]);		
		}
		me.ref.detectChanges()								    
	}

	getInversionDiarioFinal(){
		let me = this;		
		me.listInversionesDiario = [];
		for (var i = 0; i < me.rLength; i++) {			
			let inversionesID = me.listInversiones[i]['ID'];
			me.listInversiones[i]['consumo'] = [];
			me.listInversionesDiario.push(me.listInversiones[i]);
			for (var j = 0; j < me.r2Length; j++) {
				let inversionesIdDiario = me.listInversionesDiarioAux[j]['ID_INVERSION'];
				if (inversionesID == inversionesIdDiario) {
					let fecha = me.listInversionesDiarioAux[j]['FECHA'];
					let splitted = fecha.split("-",3);
					let fechaAnno = +splitted[0];
					let personaActualAnno = this.persona[4];
					if (fechaAnno == personaActualAnno) {
						me.listInversionesDiario[i]['consumo'].push(me.listInversionesDiarioAux[j]);						
					}
				}
			}
		}  
	}

	public insertI() {
		let me = this;
		var inversion = (<HTMLInputElement>document.getElementById('submitInversion')).value;
		var fecha = (<HTMLInputElement>document.getElementById('submitFecha')).value;
		var monto = (<HTMLInputElement>document.getElementById('submitMonto')).value;
		var ganancia = (<HTMLInputElement>document.getElementById('submitGanancia')).value;
		var detalle = (<HTMLInputElement>document.getElementById('submitDetalle')).value;
//		var fCuota = (<HTMLInputElement>document.querySelector('input[type="month"]')).value;
		if ((fecha == "") || (monto == "") || (ganancia == "")) {
			if (fecha == "") {
				(<HTMLInputElement>document.getElementById('submitFecha')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('fechaError')).style.visibility="visible";
			}
			if (monto == "") {
				(<HTMLInputElement>document.getElementById('submitMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoError')).style.visibility="visible";
			}
			if (ganancia == "") {
				(<HTMLInputElement>document.getElementById('submitGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('submitFecha')).value = "";
			(<HTMLInputElement>document.getElementById('submitMonto')).value = "";
			(<HTMLInputElement>document.getElementById('submitGanancia')).value = "";
			(<HTMLInputElement>document.getElementById('submitDetalle')).value = "";
			me.ipc.send("insertInversionDiario", inversion, monto, fecha, detalle, ganancia);
			me.closeInsertI();
		}	    
	    this.getInversionDiario();
  		this.getInversionDiarioFinal();

	}

	public blankInputMonto() {
		(<HTMLInputElement>document.getElementById('submitMonto')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('montoError')).style.visibility="hidden";
	}

	public blankInputGanancia() {
		(<HTMLInputElement>document.getElementById('submitGanancia')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="hidden";
	}

	public habilitaFormInsert() {
		(<HTMLInputElement>document.getElementById('formNuevoI')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
	}

	public closeInsertI() {
		this.blankInputMonto();
		this.blankInputGanancia();
		(<HTMLInputElement>document.getElementById('formNuevoI')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formEditI')).style.display = "none";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "block";
	}

	public habilitaFormEdit(event) {
		(<HTMLInputElement>document.getElementById('formEditI')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
		let me = this;
		me.idInversionesDiario = event.target.id;
		let result = me.ipc.sendSync("getUnInversionDiario", me.idInversionesDiario);
		//me.ipc.send("getUnInversionDiario", me.idInversionesDiario)
	    //me.ipc.on("resultSentUnInversionDiario", function (evt, result) {
	    	let idInv = result[0].ID_INVERSION;
			let inver = me.listInversiones.findIndex(inv => inv['ID'] === idInv);
			(<HTMLSelectElement>document.getElementById('editInversion')).selectedIndex = inver;
	    	//(<HTMLSelectElement>document.getElementById('editInversion')).selectedIndex = result[0].ID_INVERSION -1;
	    	(<HTMLInputElement>document.getElementById('editMonto')).value = result[0].MONTO;
			(<HTMLInputElement>document.getElementById('editGanancia')).value = result[0].GANANCIA;
			(<HTMLInputElement>document.getElementById('editDetalle')).value = result[0].DETALLE;
			(<HTMLInputElement>document.getElementById('editFecha')).value = result[0].FECHA;
			(<HTMLInputElement>document.querySelector('input[type="date"]')).value = result[0].FECHA;
	    //});		
	}

	public updateI(event) {
		let me = this;
		var inversion = (<HTMLInputElement>document.getElementById('editInversion')).value;
		var fecha = (<HTMLInputElement>document.getElementById('editFecha')).value;
		var monto = (<HTMLInputElement>document.getElementById('editMonto')).value;
		var ganancia = (<HTMLInputElement>document.getElementById('editGanancia')).value;
		var detalle = (<HTMLInputElement>document.getElementById('editDetalle')).value;
		if ((fecha == "") || (monto == "") || (ganancia == "")) {
			if (fecha == "") {
				(<HTMLInputElement>document.getElementById('editFecha')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('fechaError')).style.visibility="visible";
			}
			if (monto == "") {
				(<HTMLInputElement>document.getElementById('editMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoError')).style.visibility="visible";
			}
			if (ganancia == "") {
				(<HTMLInputElement>document.getElementById('editGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('editFecha')).value = "";
			(<HTMLInputElement>document.getElementById('editMonto')).value = "";
			(<HTMLInputElement>document.getElementById('editGanancia')).value = "";
			(<HTMLInputElement>document.getElementById('editDetalle')).value = "";
			me.ipc.send("updateInversionDiario", me.idInversionesDiario, inversion, monto, fecha, detalle, ganancia);
			me.closeInsertI();
		}	    
	    this.getInversionDiario();
  		this.getInversionDiarioFinal();
	}

	public removeI(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("removeInversionDiario", id);
	    this.getInversionDiario();
  		this.getInversionDiarioFinal();
	}

	public pagado(event) {
		let me = this;
		var id = event.target.id;
		let result = me.ipc.sendSync("getUnEstado", id);
		let estado = result[0].FINALIZADO;
		let fin = 0;
		if (estado == 0) {
			fin = 1;
		}
		me.ipc.send("setUnEstado", id, fin);
	    this.getInversionDiario();
  		this.getInversionDiarioFinal();
  	}
}
