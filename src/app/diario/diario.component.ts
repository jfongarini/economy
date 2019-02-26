import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-diario',
  templateUrl: './diario.component.html',
  styleUrls: ['./diario.component.css']
})
export class DiarioComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public persona = this._appComponent.getPersonaActual();
	public diaDiario: string;
	public listDiarioG: Array<string>;
	public listDiarioI: Array<string>;
	public listCategoria: Array<string>;
	public totalIngreso: number;
	public totalGasto: number;
	public idDiario: number;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

	getFecha(fecha):boolean {
		let estado = false;
		var splitted = fecha.split("/",3);
		let personaActualMes = this.persona[2];
		let personaActualAnno = String(this.persona[4]);
		let fechaMes = splitted[1];
		let fechaAnno = splitted[2];
		if (personaActualMes < 10) {
			personaActualMes = '0'+personaActualMes
		}
		personaActualMes = String(personaActualMes);

		if ((fechaMes == personaActualMes) && (fechaAnno == personaActualAnno)) {
			estado = true;
			this.diaDiario = splitted[0];
		} 
		return estado;
	}

	setFecha(dia): string{
		let personaActualMes = this.persona[2];
		let personaActualAnno = String(this.persona[4]);
		if (personaActualMes < 10) {
			personaActualMes = '0'+personaActualMes
		}
		personaActualMes = String(personaActualMes);
		if (dia.length < 2) { 
			if (dia < 10) {
				dia = '0'+dia
			}
		}
		dia = String(dia);
		return dia+'/'+personaActualMes+'/'+personaActualAnno
	}

	getCategorias(){
		let me = this;
		let personaActualID = this.persona[0];
	    me.ipc.send("getCategorias", personaActualID)
	    me.ipc.on("resultSentCategorias", function (evt, result) {
			me.listCategoria = [];
			for (var i = 0; i < result.length; i++) {				
				me.listCategoria.push(result[i]);				
			}
			me.ref.detectChanges()
	    });
	}

	getDiario(){
		let me = this;
		let sendFecha = "";
		let giCat = "";
		let idCat = 0;
		let fechaValida = false;
		let personaActualID = this.persona[0];		
	    me.ipc.send("getDiario", personaActualID)
	    me.ipc.on("resultSentDiario", function (evt, result) {
			me.listDiarioG = [];
			me.listDiarioI = [];
			me.totalIngreso = 0;
			me.totalGasto = 0;
			for (var i = 0; i < result.length; i++) {
				sendFecha = result[i].FECHA;
				fechaValida = me.getFecha(sendFecha);
				if (fechaValida) {
					idCat = result[i].ID_CATEGORIA;
					giCat = me.listCategoria[idCat-1]['GI'];
					result[i].dia = me.diaDiario; 
					result[i].nombreCategoria = me.listCategoria[idCat-1]['NOMBRE'];
					if (giCat == 'G') {
						me.listDiarioG.push(result[i]);
						me.totalGasto = me.totalGasto + result[i].MONTO;
					} else {
						me.listDiarioI.push(result[i]);
						me.totalIngreso = me.totalIngreso + result[i].MONTO;
					}
				}		
			}
			me.ref.detectChanges()
	    });
	}

	getTotalIngreso():string {		
		let me = this;
		return String(me.totalIngreso);
	}

	getTotalGasto():string {		
		let me = this;
		return String(me.totalGasto);
	}

	ngOnInit() {
		this.getCategorias();
		this.getDiario();
	}
 
	public insertDiario() {
		let me = this;
		var dia = (<HTMLInputElement>document.getElementById('submitDia')).value;
		var importe = (<HTMLInputElement>document.getElementById('submitImporte')).value;
		var grupo = (<HTMLInputElement>document.getElementById('submitGrupo')).value;
		var detalle = (<HTMLInputElement>document.getElementById('submitDetalle')).value;
		var fecha = me.setFecha(dia);
		if ((dia == "") || (importe == "")) {
			if (dia == "") {
				(<HTMLInputElement>document.getElementById('submitDia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('diaError')).style.visibility="visible";
			}
			if (importe == "") {
				(<HTMLInputElement>document.getElementById('submitImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('importeError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('submitDia')).value = "";
			(<HTMLInputElement>document.getElementById('submitImporte')).value = "";
			(<HTMLInputElement>document.getElementById('submitDetalle')).value = "";
			let personaActualID = this.persona[0];
			me.ipc.send("insertDiario", personaActualID, fecha, importe, grupo, detalle);
			me.closeInsertDiario();
		}
	    
	    this.getDiario();

	}

	public blankInputDia() {
		(<HTMLInputElement>document.getElementById('submitDia')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('diaError')).style.visibility="hidden";
	}

	public blankInputImporte() {
		(<HTMLInputElement>document.getElementById('submitImporte')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('importeError')).style.visibility="hidden";
	}

	public habilitaFormInsert() {
		(<HTMLInputElement>document.getElementById('formNuevoDiario')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
	}

	public closeInsertDiario() {
		this.blankInputDia();
		this.blankInputImporte();
		(<HTMLInputElement>document.getElementById('formNuevoDiario')).style.display = "none";
		(<HTMLInputElement>document.getElementById('formEditDiario')).style.display = "none";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "block";
	}

	public habilitaFormEdit(event) {
		(<HTMLInputElement>document.getElementById('formEditDiario')).style.display = "block";
		(<HTMLInputElement>document.getElementById('bottonHabilitaForm')).style.display = "none";
		let me = this;
		me.idDiario = event.target.id;
		me.ipc.send("getUnDiario", me.idDiario)
	    me.ipc.on("resultSentUnDiario", function (evt, result) {
	    	var fecha = result[0].FECHA;
	    	var splitted = fecha.split("/",3);
			var dia = String(splitted[0]);
			(<HTMLInputElement>document.getElementById('editDia')).value = dia;
			(<HTMLInputElement>document.getElementById('editImporte')).value = result[0].MONTO;
			(<HTMLSelectElement>document.getElementById('editGrupo')).selectedIndex = result[0].ID_CATEGORIA -1;
			(<HTMLInputElement>document.getElementById('editDetalle')).value = result[0].DETALLE;
	    });		
	}

	public updateDiario(event) {
		let me = this;
		var dia = (<HTMLInputElement>document.getElementById('editDia')).value;
		var importe = (<HTMLInputElement>document.getElementById('editImporte')).value;
		var grupo = (<HTMLInputElement>document.getElementById('editGrupo')).value;
		var detalle = (<HTMLInputElement>document.getElementById('editDetalle')).value;
		var fecha = me.setFecha(dia);
		if ((dia == "") || (importe == "")) {
			if (dia == "") {
				(<HTMLInputElement>document.getElementById('editDia')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('diaError')).style.visibility="visible";
			}
			if (importe == "") {
				(<HTMLInputElement>document.getElementById('editImporte')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('importeError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('editDia')).value = "";
			(<HTMLInputElement>document.getElementById('editImporte')).value = "";
			(<HTMLInputElement>document.getElementById('editDetalle')).value = "";
			me.ipc.send("updateDiario", me.idDiario, fecha, importe, grupo, detalle);
			me.closeInsertDiario();
		}
	    
	    this.getDiario();
	}

	public removeDiario(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("removeDiario", id);
	    this.getDiario();
	}

}
