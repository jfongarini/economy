import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public listG: Array<string>;
	public listI: Array<string>;

	constructor(private ref: ChangeDetectorRef) { }

	getCategorias(){
		let me = this;
	    me.ipc.send("getCategorias")
	    me.ipc.on("resultSent", function (evt, result) {
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

	ngOnInit() {
		this.getCategorias();
	}
 
	public insertCategoriaGasto() {
		event.preventDefault();
		var res = (<HTMLInputElement>document.getElementById('submitG')).value;
		(<HTMLInputElement>document.getElementById('submitG')).value = "";
		let me = this;
	    me.ipc.send("insertCategoriaGasto", res);
	    this.getCategorias();
	}

	public insertCategoriaIngreso() {
		event.preventDefault();
		var res = (<HTMLInputElement>document.getElementById('submitI')).value;
		(<HTMLInputElement>document.getElementById('submitI')).value = "";
		let me = this;
	    me.ipc.send("insertCategoriaIngreso", res);
	    this.getCategorias();
	}

	public removeCategoria(event) {
		var id = event.target.id;
		let me = this;
	    me.ipc.send("deleteCategoria", id);
	    this.getCategorias();
	}

}