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
	public listInversionesVigente: Array<string>;
	public listInversionesDiarioAux: Array<string>;
	public listInversionesDiario = new Array();
	public rLength: number;
	public r2Length: number;
	public idInversionesDiario: number;
	public inversionEditaNombre: string;
	public inversionEditaID: number;
	public mensaje1: string;
	public mensaje2: string;

	public cierreFechaApertura: string;
	public cierreMonto: string;
	public cierreGanancia: string;
	public cierreTotal: string;
	public cierreDetalle: string;
	public fechaP: string;

  	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  	ngOnInit() {
  		this.getInversionesVigentes();
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

	getInversionesVigentes(){
		let me = this;
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getInversiones", personaActualID)
	    me.listInversionesVigente = [];
		for (var i = 0; i < result.length; i++) {
			if (result[i].VIGENTE == 0){
				me.listInversionesVigente.push(result[i]);
			}				
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
		var inversionesVaciaList = [];
		for (var i = 0; i < me.rLength; i++) {			
			let inversionesID = me.listInversiones[i]['ID'];
			me.listInversiones[i]['consumo'] = [];
			me.listInversionesDiario.push(me.listInversiones[i]);
			inversionesVaciaList.push(true);
			for (var j = 0; j < me.r2Length; j++) {
				let inversionesIdDiario = me.listInversionesDiarioAux[j]['ID_INVERSION'];
				if (inversionesID == inversionesIdDiario) {
					inversionesVaciaList.pop();
					inversionesVaciaList.push(false);
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
		var cantInversiones = me.rLength;
		for (var i = 0; i < cantInversiones; i++){
			var esVacia = inversionesVaciaList[i];
			if (esVacia) {
				me.listInversionesDiario.splice(i,1);
				inversionesVaciaList.splice(i,1);
				cantInversiones = cantInversiones -1;
				i--
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
		if ((fecha == "") || (monto == "") || (ganancia == "") || (+monto < 1) || (+ganancia < 1)) {
			if (fecha == "") {
				(<HTMLInputElement>document.getElementById('submitFecha')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('fechaError')).style.visibility="visible";
			}
			if (monto == "") {
				(<HTMLInputElement>document.getElementById('submitMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoError')).style.visibility="visible";
				me.mensaje1 = "*Obligatorio";
			}
			if ((+monto < 1) && (monto != "")) {
				(<HTMLInputElement>document.getElementById('submitMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoError')).style.visibility="visible";
				me.mensaje1 = "Monto no puede ser 0";
			}
			if (ganancia == "") {
				(<HTMLInputElement>document.getElementById('submitGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="visible";
				me.mensaje2 = "*Obligatorio";
			}
			if ((+ganancia < 1) && (ganancia != "")) {
				(<HTMLInputElement>document.getElementById('submitGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="visible";
				me.mensaje2 = "Ganancia no puede ser 0";
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

	public blankInputFecha() {
		(<HTMLInputElement>document.getElementById('submitFecha')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('fechaError')).style.visibility="hidden";
	}

	public blankInputMonto() {
		(<HTMLInputElement>document.getElementById('submitMonto')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('montoError')).style.visibility="hidden";
	}

	public blankInputGanancia() {
		(<HTMLInputElement>document.getElementById('submitGanancia')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('gananciaError')).style.visibility="hidden";
	}

	public blankEditFecha() {
		(<HTMLInputElement>document.getElementById('editFecha')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('fechaEditError')).style.visibility="hidden";
	}

	public blankEditMonto() {
		(<HTMLInputElement>document.getElementById('editMonto')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('montoEditError')).style.visibility="hidden";
	}

	public blankEditGanancia() {
		(<HTMLInputElement>document.getElementById('editGanancia')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('gananciaEditError')).style.visibility="hidden";
	}

	public blankPagado() {
		(<HTMLInputElement>document.getElementById('pagadoFecha')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('fechaPagado')).style.visibility="hidden";
	}

	public habilitaFormInsert() {
		(<HTMLInputElement>document.getElementById('formNuevoI')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
	}

	public closeInsertI() {
		this.blankInputFecha();
		this.blankInputMonto();
		this.blankInputGanancia();
		this.blankEditFecha();
		this.blankEditMonto();
		this.blankEditGanancia();
		this.blankPagado();
		(<HTMLInputElement>document.getElementById('formNuevoI')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formEditI')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formPagado')).style.display = "none";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "block";
	}

	public habilitaFormEdit(event) {
		(<HTMLInputElement>document.getElementById('formEditI')).style.display = "block";
		(<HTMLInputElement>document.getElementById('formPagado')).style.display = "none";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
		let me = this;
		me.idInversionesDiario = event.target.id;
		let result = me.ipc.sendSync("getUnInversionDiario", me.idInversionesDiario);
		//me.ipc.send("getUnInversionDiario", me.idInversionesDiario)
	    //me.ipc.on("resultSentUnInversionDiario", function (evt, result) {
	    	let idInv = result[0].ID_INVERSION;
			let inver = me.listInversiones.findIndex(inv => inv['ID'] === idInv);
			me.inversionEditaNombre = me.listInversiones[inver]['NOMBRE'];
			me.inversionEditaID = idInv;
			//(<HTMLSelectElement>document.getElementById('editInversion')).selectedIndex = inver;
	    	//(<HTMLSelectElement>document.getElementById('editInversion')).selectedIndex = result[0].ID_INVERSION -1;
	    	(<HTMLInputElement>document.getElementById('editMonto')).value = result[0].MONTO;
			(<HTMLInputElement>document.getElementById('editGanancia')).value = result[0].GANANCIA;
			(<HTMLInputElement>document.getElementById('editDetalle')).value = result[0].DETALLE;
			(<HTMLInputElement>document.getElementById('editFecha')).value = result[0].FECHA;
			(<HTMLInputElement>document.querySelector('input[type="date"]')).value = result[0].FECHA;
	    //});		
		me.ref.detectChanges();
	}

	public updateI(event) {
		let me = this;
		var inversion = (<HTMLInputElement>document.getElementById('editInversion')).value;
		var fecha = (<HTMLInputElement>document.getElementById('editFecha')).value;
		var monto = (<HTMLInputElement>document.getElementById('editMonto')).value;
		var ganancia = (<HTMLInputElement>document.getElementById('editGanancia')).value;
		var detalle = (<HTMLInputElement>document.getElementById('editDetalle')).value;
		if (inversion == "") {
			inversion = String(me.inversionEditaID);
		}
		if ((fecha == "") || (monto == "") || (ganancia == "") || (+monto < 1) || (+ganancia < 1)) {
			if (fecha == "") {
				(<HTMLInputElement>document.getElementById('editFecha')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('fechaEditError')).style.visibility="visible";
			}
			if (monto == "") {
				(<HTMLInputElement>document.getElementById('editMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoEditError')).style.visibility="visible";
				me.mensaje1 = "*Obligatorio";
			}
			if ((+monto < 1) && (monto != "")) {
				(<HTMLInputElement>document.getElementById('editMonto')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('montoEditError')).style.visibility="visible";
				me.mensaje1 = "Monto no puede ser 0";
			}
			if (ganancia == "") {
				(<HTMLInputElement>document.getElementById('editGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaEditError')).style.visibility="visible";
				me.mensaje2 = "*Obligatorio";
			}
			if ((+ganancia < 1) && (ganancia != "")) {
				(<HTMLInputElement>document.getElementById('editGanancia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('gananciaEditError')).style.visibility="visible";
				me.mensaje2 = "Ganancia no puede ser 0";
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

  	public habilitaPagado(event) {
		(<HTMLInputElement>document.getElementById('formPagado')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formNuevoI')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formEditI')).style.display = "none";
		let me = this;
		me.idInversionesDiario = event.target.id;
		let result = me.ipc.sendSync("getUnInversionDiario", me.idInversionesDiario);
    	let idInv = result[0].ID_INVERSION;
		let inver = me.listInversiones.findIndex(inv => inv['ID'] === idInv);
		me.inversionEditaNombre = me.listInversiones[inver]['NOMBRE'];
		me.inversionEditaID = idInv;

		me.cierreFechaApertura = result[0].FECHA;
		me.cierreMonto = result[0].MONTO;
		me.cierreGanancia = result[0].GANANCIA;
		me.cierreTotal = String(+result[0].MONTO + +result[0].GANANCIA);
		me.cierreDetalle = result[0].DETALLE;
		me.ref.detectChanges();
	}

	public pagado(event) {
		let me = this;
		
		me.fechaP = (<HTMLInputElement>document.getElementById('pagadoFecha')).value;

		if (me.fechaP == "") {
			(<HTMLInputElement>document.getElementById('pagadoFecha')).style.borderColor="red"; 
			(<HTMLInputElement>document.getElementById('fechaPagado')).style.visibility="visible";		
		} else {
			(<HTMLInputElement>document.getElementById('pagadoFecha')).value = "";			
			me.ipc.send("setUnEstado", me.idInversionesDiario, me.fechaP);
			me.closeInsertI();
		}	    
	    this.getInversionDiario();
  		this.getInversionDiarioFinal();
	}

	public noPagado(event) {
		let me = this;
		var id = event.target.id;
		let fin = "0";
		me.ipc.send("setUnEstado", id, fin);
	    this.getInversionDiario();
		this.getInversionDiarioFinal();
  	}

}
