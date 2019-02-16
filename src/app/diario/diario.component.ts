import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var electron: any;
declare var require: any;


@Component({
  selector: 'app-diario',
  templateUrl: './diario.component.html',
  styleUrls: ['./diario.component.css']
})
export class DiarioComponent implements OnInit {

public ipc = electron.ipcRenderer;
	public listG: Array<string>;
	public listI: Array<string>;

	constructor(private ref: ChangeDetectorRef) { }

	getDiario(){
		let me = this;
	    me.ipc.send("getDiario")
	    me.ipc.on("resultSent", function (evt, result) {
			me.listG = [];
			me.listI = [];
			for (var i = 0; i < result.length; i++) {

					me.listI.push(result[i]);
							
			}
			me.ref.detectChanges()
	    });
	}

	ngOnInit() {
		this.getDiario();
	}
 
	public insertCategoriaGasto() {
		event.preventDefault();
		var res = (<HTMLInputElement>document.getElementById('submitG')).value;
		(<HTMLInputElement>document.getElementById('submitG')).value = "";
		let me = this;
	    me.ipc.send("insertCategoriaGasto", res);
	    this.getDiario();
	}

	public insertCategoriaIngreso() {
		event.preventDefault();
		var res = (<HTMLInputElement>document.getElementById('submitI')).value;
		(<HTMLInputElement>document.getElementById('submitI')).value = "";
		let me = this;
	    me.ipc.send("insertCategoriaIngreso", res);
	    this.getDiario();
	}

	public removeCategoria(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteCategoria", id);
	    this.getDiario();
	}

}
