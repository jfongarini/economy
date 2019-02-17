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
  	public personaId: number;
	public personaNombre: string;
	public personaAnno: number;
	public personaMesActNum: number;
	public personaMesActNom: string;
	public persona: Array<any>;
	public meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
              "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

	constructor(private ref: ChangeDetectorRef) { }	

	getPersona(){
		let me = this;
	    me.ipc.send("getPersona")
	    me.ipc.on("resultSentPersona", function (evt, result) {
	    	me.personaId = result[0].ID;
			me.personaNombre = result[0].NOMBRE;
			me.personaMesActNum = result[0].MES;
			me.personaMesActNom = me.meses[me.personaMesActNum -1];
			me.personaAnno = result[0].ANNO;
			me.ref.detectChanges()
	    });
	}

	ngOnInit() {
		this.getPersona();
	}

	public updatePersona() {
		let me = this;
		var nombreU = (<HTMLInputElement>document.getElementById('submitNombre')).value;
		var mesU = (<HTMLInputElement>document.getElementById('submitMes')).value;
		var annoU = (<HTMLInputElement>document.getElementById('submitAnno')).value;
		var nombreSend = "";
		var mesSend = 0;
		var annoSend = 0;

		if (nombreU == "") {
			nombreSend = me.personaNombre;
		} else {
			nombreSend = nombreU;
		}

		if (mesU == "") {
			mesSend = me.personaMesActNum;
		} else {
			mesSend = +mesU;
		}

		if (annoU == "") {
			annoSend = me.personaAnno;
		} else {
			annoSend = +annoU;
		}

		me.ipc.send("updatePersona", me.personaId, nombreSend, mesSend, annoSend);
		this.getPersona();

		(<HTMLInputElement>document.getElementById('desp-main-div')).style.display = "none";

	}

	getPersonaActual(): any {
		this.persona = [];
		this.persona.push(this.personaId);
		this.persona.push(this.personaNombre);
		this.persona.push(this.personaMesActNum);
		this.persona.push(this.personaMesActNom);
		this.persona.push(this.personaAnno); 

		return this.persona;
	}
}
