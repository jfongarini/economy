import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
	public listTarjetaVigente: Array<string>;
	public listTarjetaConsumoAux: Array<string>;
	public listTarjetaConsumo = new Array();
	public tarjetaEditaNombre: string;
	public tarjetaEditaID: number;
	public rLength: number;
	public r2Length: number;
	public valido: boolean;
	public idTC: number;
	public mensaje1: string;
	public mensaje2: string;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  	ngOnInit() {
  		this.getTarjeta();
  		this.getTarjetasVigentes();
  		this.getTarjetaConsumo();
  		this.getTarjetaConsumoFinal();
  	}

	getTarjeta(){
		let me = this;		
		let personaActualID = this.persona[0];
		me.listTarjeta = [];
	    let result = me.ipc.sendSync("getTarjeta", personaActualID)
		me.listTarjeta = [];			
		me.rLength = result.length; 
		for (var i = 0; i < me.rLength; i++) {		
			me.listTarjeta.push(result[i]);									
		}
		me.ref.detectChanges()
	}

	getTarjetasVigentes(){
		let me = this;
		let personaActualID = this.persona[0];
	    let result = me.ipc.sendSync("getTarjeta", personaActualID)
	    me.listTarjetaVigente = [];
		for (var i = 0; i < result.length; i++) {
			if (result[i].VIGENTE == 0){
				me.listTarjetaVigente.push(result[i]);
			}				
		}
		me.ref.detectChanges()
	}

	getTarjetaConsumo(){
		let me = this;		
	    let result2 = me.ipc.sendSync("getTarjetaConsumo")
    	me.r2Length = result2.length;   	
    	me.listTarjetaConsumoAux = [];
		for (var j = 0; j < me.r2Length; j++) {					
			me.listTarjetaConsumoAux.push(result2[j]);		
		}
		me.ref.detectChanges()								    
	}

	sumarGasto(i,j){
		let l = j;
		let me = this;			
		let auxMes = "";
		for (var k = 1; k <= 13; k++) {	
			let gastos = 0;
			if (k < 10) {
				auxMes = 'm0'+k;
			} else {
				auxMes = 'm'+String(k);
			}
			let estadoMes = this.getSafe(() => me.listTarjetaConsumoAux[l]['meses'][auxMes]);
			let esNan = isNaN(me.listTarjeta[i]['gasto'][auxMes]);
			if (esNan){
				me.listTarjeta[i]['gasto'][auxMes] = 0;
			}
			if (estadoMes != undefined) { 				
				if (auxMes == 'm13') {
					let valor = me.listTarjetaConsumoAux[l]['meses']['m12'];
					let cantCuotas = me.listTarjetaConsumoAux[l]['meses'][auxMes];
					if (valor) {
						gastos = gastos + (+valor * +cantCuotas);
					}
				} else {
					let valor = me.listTarjetaConsumoAux[l]['meses'][auxMes];
					if (valor) {
						gastos = gastos + valor;
					}
				}
				me.listTarjeta[i]['gasto'][auxMes] = me.listTarjeta[i]['gasto'][auxMes] + gastos;
			}		
		}
	}

	getSafe(fn) {
	    try {
	        return fn();
	    } catch (e) {
	        return undefined;
	    }
	}

	resolverMeses(i,j){
		let me = this;	
		me.listTarjetaConsumoAux[j]['meses'] = [];		
		let fecha = me.listTarjetaConsumoAux[j]['F_PRI_CUOTA']
		let cantCuotas = me.listTarjetaConsumoAux[j]['CUOTAS']
		let splitted = fecha.split("-",2);
		let fechaMes = +splitted[1];
		let fechaAnno = +splitted[0];
		let personaActualAnno = this.persona[4];
		if (fechaAnno != personaActualAnno) {
			let sumaFecha = fechaMes + cantCuotas;
			let sumaAnno = (personaActualAnno - fechaAnno) * 12;
			if (sumaFecha <= sumaAnno){
				me.valido = false;
			} else {
				cantCuotas = sumaFecha - sumaAnno -1;
				fechaMes = 1;
				fechaAnno = personaActualAnno;
			}
		} 
		if (me.valido){
			let auxMes = "";
			let cantCuotasTotal = fechaMes + cantCuotas -1;
			let pasado12 = 0;
			for (var k = fechaMes; k <= cantCuotasTotal; k++) {
				if (k < 10) {
					auxMes = 'm0'+k;
				} else {
					auxMes = 'm'+String(k);
				}
				if (k > 12) {
					pasado12++;
				} else {
					me.listTarjetaConsumoAux[j]['meses'][auxMes] = me.listTarjetaConsumoAux[j]['MONTO'];
				}				
			}
			if (pasado12 > 0){
				me.listTarjetaConsumoAux[j]['meses']['m13'] = "+" + pasado12;
			}
		}
		
	}

	getTarjetaConsumoFinal(){
		let me = this;		
		me.listTarjetaConsumo = [];
		var tarjetaVaciaList = [];
		for (var i = 0; i < me.rLength; i++) {			
			let tarjetaID = me.listTarjeta[i]['ID'];
			me.listTarjeta[i]['consumo'] = [];
			me.listTarjeta[i]['gasto'] = [];
			me.listTarjetaConsumo.push(me.listTarjeta[i]);
			tarjetaVaciaList.push(true);
			for (var j = 0; j < me.r2Length; j++) {
				let tarjetaIDConsumo = me.listTarjetaConsumoAux[j]['ID_TARJETA'];
				if (tarjetaID == tarjetaIDConsumo) {
					tarjetaVaciaList.pop();
					tarjetaVaciaList.push(false);
					me.valido = true;
					this.resolverMeses(i,j);
					this.sumarGasto(i,j);	
					if (me.valido){
						me.listTarjetaConsumo[i]['consumo'].push(me.listTarjetaConsumoAux[j]);	
					} 
				}
			}
		}  
		var cantTarjetas = me.rLength;
		for (var i = 0; i < cantTarjetas; i++){
			var esVacia = tarjetaVaciaList[i];
			if (esVacia) {
				me.listTarjetaConsumo.splice(i,1);
				tarjetaVaciaList.splice(i,1);
				cantTarjetas = cantTarjetas -1;
				i--
			}
		}
	}

	public insertTC() {
		let me = this;
		var tarjeta = (<HTMLInputElement>document.getElementById('submitTarjeta')).value;
		var nombreConsumo = (<HTMLInputElement>document.getElementById('submitNombreConsumo')).value;
		var importe = (<HTMLInputElement>document.getElementById('submitImporte')).value;
		var cantCuota = (<HTMLInputElement>document.getElementById('submitCuotas')).value;
		var fCuota = (<HTMLInputElement>document.querySelector('input[type="month"]')).value;
		if ((nombreConsumo == "") || (importe == "") || (cantCuota == "") || (fCuota == "") || (+cantCuota < 1) || (+importe < 0.1)) {
			if (nombreConsumo == "") {
				(<HTMLInputElement>document.getElementById('submitNombreConsumo')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('nombreConsumoError')).style.visibility="visible";
			}
			if (importe == "") {
				(<HTMLInputElement>document.getElementById('submitImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('importeError')).style.visibility="visible";
				me.mensaje1 = "*Obligatorio";
			}
			if ((+importe < 1) && (importe != "")) {
				(<HTMLInputElement>document.getElementById('submitImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('importeError')).style.visibility="visible";
				me.mensaje1 = "Valor no puede ser 0";
			}
			if (cantCuota == "") {
				(<HTMLInputElement>document.getElementById('submitCuotas')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('cuotasError')).style.visibility="visible";
				me.mensaje2 = "*Obligatorio";
			}
			if ((+cantCuota < 1) && (cantCuota != "")){
				(<HTMLInputElement>document.getElementById('submitCuotas')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('cuotasError')).style.visibility="visible";
				me.mensaje2 = "Cantidad de cuotas no puede ser 0";
			}
			if (fCuota == "") {
				(<HTMLInputElement>document.getElementById('submitMes')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('mesError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('submitNombreConsumo')).value = "";
			(<HTMLInputElement>document.getElementById('submitImporte')).value = "";
			(<HTMLInputElement>document.getElementById('submitCuotas')).value = "";
			(<HTMLInputElement>document.getElementById('submitMes')).value = "";
			me.ipc.send("insertTC", tarjeta, nombreConsumo, importe, cantCuota, fCuota);
			me.closeInsertTC();
		}	    
	    this.getTarjetaConsumo();
  		this.getTarjetaConsumoFinal();

	}

	public blankInputNombreConsumo() {
		(<HTMLInputElement>document.getElementById('submitNombreConsumo')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('nombreConsumoError')).style.visibility="hidden";
	}

	public blankInputImporte() {
		(<HTMLInputElement>document.getElementById('submitImporte')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('importeError')).style.visibility="hidden";
	}

	public blankInputCoutas() {
		(<HTMLInputElement>document.getElementById('submitCuotas')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('cuotasError')).style.visibility="hidden";
	}

	public blankInputMPC() {
		(<HTMLInputElement>document.getElementById('submitMes')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('mesError')).style.visibility="hidden";
	}

	public blankEditNombreConsumo() {
		(<HTMLInputElement>document.getElementById('editNombreConsumo')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('editNombreConsumoError')).style.visibility="hidden";
	}

	public blankEditImporte() {
		(<HTMLInputElement>document.getElementById('editImporte')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('editImporteError')).style.visibility="hidden";
	}

	public blankEditCoutas() {
		(<HTMLInputElement>document.getElementById('editCuotas')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('editCuotasError')).style.visibility="hidden";
	}

	public blankEditMPC() {
		(<HTMLInputElement>document.getElementById('editMes')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('editMesError')).style.visibility="hidden";
	}


	public habilitaFormInsert() {
		(<HTMLInputElement>document.getElementById('formNuevoTC')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
	}

	public closeInsertTC() {
		this.blankInputNombreConsumo();
		this.blankInputCoutas();
		this.blankInputImporte();
		this.blankInputMPC();
		this.blankEditNombreConsumo();
		this.blankEditImporte();
		this.blankEditCoutas();
		this.blankEditMPC();
		(<HTMLInputElement>document.getElementById('formNuevoTC')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formEditTC')).style.display = "none";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "block";
	}

	public habilitaFormEdit(event) {
		(<HTMLInputElement>document.getElementById('formEditTC')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
		//this.getTarjeta();
		let me = this;
		me.idTC = event.target.id;
		let idTarj = 0;
		let tarj = 0;
		let result = me.ipc.sendSync("getUnTC", me.idTC)
		//me.ipc.send("getUnTC", me.idTC)
	    //me.ipc.on("resultSentUnTC", function (evt, result) {
	    	idTarj = result[0].ID_TARJETA;
			//(<HTMLSelectElement>document.getElementById('editTarjeta')).selectedIndex = tarj;
	    	//(<HTMLSelectElement>document.getElementById('editTarjeta')).selectedIndex = result[0].ID_TARJETA -1;
	    	(<HTMLInputElement>document.getElementById('editNombreConsumo')).value = result[0].NOMBRE;
			(<HTMLInputElement>document.getElementById('editImporte')).value = result[0].MONTO;
			(<HTMLInputElement>document.getElementById('editCuotas')).value = result[0].CUOTAS;
			(<HTMLInputElement>document.getElementById('editMes')).value = result[0].F_PRI_CUOTA;
			(<HTMLInputElement>document.querySelector('input[type="month"]')).value = result[0].F_PRI_CUOTA;
			tarj = me.listTarjeta.findIndex(tar => tar['ID'] === idTarj);
	    //});
	   // let tarj = me.listTarjeta.findIndex(tar => tar['ID'] === idTarj);
		me.tarjetaEditaNombre = me.listTarjeta[tarj]['NOMBRE'];
		me.tarjetaEditaID = idTarj;
		me.ref.detectChanges();
	}

	public updateTC(event) {
		let me = this;
		var tarjeta = (<HTMLInputElement>document.getElementById('editTarjeta')).value;
		var nombreConsumo = (<HTMLInputElement>document.getElementById('editNombreConsumo')).value;
		var importe = (<HTMLInputElement>document.getElementById('editImporte')).value;
		var cantCuota = (<HTMLInputElement>document.getElementById('editCuotas')).value;
		var fCuota = (<HTMLInputElement>document.getElementById('editMes')).value;
		if (tarjeta == "") {
			tarjeta = String(me.tarjetaEditaID);
		}
		if ((nombreConsumo == "") || (importe == "") || (cantCuota == "") || (fCuota == "") || (+cantCuota < 1) || (+importe < 1)) {
			if (nombreConsumo == "") {
				(<HTMLInputElement>document.getElementById('editNombreConsumo')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editNombreConsumoError')).style.visibility="visible";
			}
			if (importe == "") {
				(<HTMLInputElement>document.getElementById('editImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editImporteError')).style.visibility="visible";
				me.mensaje1 = "*Obligatorio";
			}
			if ((+importe < 1) && (importe != "")) {
				(<HTMLInputElement>document.getElementById('editImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editImporteError')).style.visibility="visible";
				me.mensaje1 = "Valor no puede ser 0";
			}
			if (cantCuota == "") {
				(<HTMLInputElement>document.getElementById('editCuotas')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editCuotasError')).style.visibility="visible";
				me.mensaje2 = "*Obligatorio";
			}
			if ((+cantCuota < 1) && (cantCuota != "")){
				(<HTMLInputElement>document.getElementById('editCuotas')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editCuotasError')).style.visibility="visible";
				me.mensaje2 = "Cantidad de cuotas no puede ser 0";
			}
			if (fCuota == "") {
				(<HTMLInputElement>document.getElementById('editMes')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('editMesError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('editNombreConsumo')).value = "";
			(<HTMLInputElement>document.getElementById('editImporte')).value = "";
			(<HTMLInputElement>document.getElementById('editCuotas')).value = "";
			(<HTMLInputElement>document.getElementById('editMes')).value = "";
			me.ipc.send("updateTC", me.idTC, tarjeta, nombreConsumo, importe, cantCuota, fCuota);
			me.closeInsertTC();
		}	    
	    this.getTarjetaConsumo();
  		this.getTarjetaConsumoFinal();
	}

	public removeTC(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("removeTC", id);
	    this.getTarjetaConsumo();
  		this.getTarjetaConsumoFinal();
	}

}
