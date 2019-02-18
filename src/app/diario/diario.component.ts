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
		if (dia < 10) {
			dia = '0'+dia
		}
		dia = String(dia);
		return dia+'/'+personaActualMes+'/'+personaActualAnno
	}

	getCategorias(){
		let me = this;
	    me.ipc.send("getCategorias")
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
					} else {
						me.listDiarioI.push(result[i]);
					}
				}		
			}
			me.ref.detectChanges()
	    });
	}

	ngOnInit() {
		this.getCategorias();
		this.getDiario();
	}
 
	public insertDiario(event) {
		let me = this;
		event.preventDefault();
		var dia = (<HTMLInputElement>document.getElementById('submitDia')).value;
		var importe = (<HTMLInputElement>document.getElementById('submitImporte')).value;
		var grupo = (<HTMLInputElement>document.getElementById('submitGrupo')).value;
		var detalle = (<HTMLInputElement>document.getElementById('submitDetalle')).value;
		var fecha = me.setFecha(dia);
		(<HTMLInputElement>document.getElementById('submitDia')).value = "";
		(<HTMLInputElement>document.getElementById('submitImporte')).value = "";
		(<HTMLInputElement>document.getElementById('submitDetalle')).value = "";
		console.log(fecha);
	    //me.ipc.send("insertDiario", fecha, importe, grupo, detalle);
	    this.getDiario();

  alert("I am an alert box!");

/*
  if(dia2.checkValidity()) {
  	console.log('hola');
  } else {
    alert((<HTMLInputElement>document.getElementById('submitDia')).validationMessage);
  }+*/


	}

	public updateDiario(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteCategoria", id);
	    this.getDiario();
	}

	public removeDiario(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteCategoria", id);
	    this.getDiario();
	}

}
