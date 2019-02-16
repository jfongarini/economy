import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  	title = 'economia';
  	public ipc = electron.ipcRenderer;
	public nombre: string;
	public anno: number;
	public mesActNum: number;
	public mesActNom: string;
	public meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
              "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

	constructor(private ref: ChangeDetectorRef) { }	

	getPersona(){
		let me = this;
	    me.ipc.send("getPersona")
	    me.ipc.on("resultSent", function (evt, result) {
			me.nombre = result[0].NOMBRE;
			me.mesActNum = result[0].MES;
			me.mesActNom = me.meses[me.mesActNum -1];
			me.anno = result[0].ANNO;
			me.ref.detectChanges()
	    });
	}

	ngOnInit() {
		this.getPersona();
	}

	public updateNombre() {
//		let me = this;
//		let nombre = this.persona.NOMBRE.toString();
//		let id = this.persona.ID;
//	    this.ipc.send("updateNombre", id, nombre);
//	    this.getPersona();
	}
}
