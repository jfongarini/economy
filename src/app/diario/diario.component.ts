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
	public listDiarioG: Array<string>;
	public listDiarioI: Array<string>;
	public listCategoria: Array<string>;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

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
		let giCat = "";
		let idCat = 0;
	    me.ipc.send("getDiario")
	    me.ipc.on("resultSentDiario", function (evt, result) {
			me.listDiarioG = [];
			me.listDiarioI = [];
			for (var i = 0; i < result.length; i++) {
				idCat = result[i].ID_CATEGORIA;
				giCat = me.listCategoria[idCat-1]['GI'];
				result[i].nombreCategoria = me.listCategoria[idCat-1]['NOMBRE'];
				if (giCat == 'G') {
					me.listDiarioG.push(result[i]);
				} else {
					me.listDiarioI.push(result[i]);
				}				
			}
			me.ref.detectChanges()
	    });
	    var prueba = this._appComponent.getPersonaActual();
	    console.log(prueba);
	}

	ngOnInit() {
		this.getCategorias();
		this.getDiario();
	}
 
	public insertDiario() {
		event.preventDefault();
		var res = (<HTMLInputElement>document.getElementById('submitG')).value;
		(<HTMLInputElement>document.getElementById('submitG')).value = "";
		let me = this;
	    me.ipc.send("insertCategoriaGasto", res);
	    this.getDiario();
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
