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
  	public listPersonas: Array<any>;
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
	    //me.ipc.send("getPersona")
	    //me.ipc.on("resultSentPersona", function (evt, result) {
	    	let result = me.ipc.sendSync("getPersona"); 
	    	me.personaId = result[0].ID;
			me.personaNombre = result[0].NOMBRE;
			me.personaMesActNum = result[0].MES;
			me.personaMesActNom = me.meses[me.personaMesActNum -1];
			me.personaAnno = result[0].ANNO;
			me.ref.detectChanges()
	    //});
	}

	gelAllPersona(){
		let me = this;
		let result = me.ipc.sendSync("getPersonaAll"); 
		me.listPersonas = result;
	}

	async ngOnInit() {
		await this.gelAllPersona();
		await this.getPersona();
	}

	public enterApp(event) {
		let me = this;
		let id = event.currentTarget.id;
        me.ipc.send('loginok', id)
        me.getPersona();
        (<HTMLInputElement>document.getElementById('modal01')).style.display = "none";
        //(<HTMLDivElement>document.getElementById('modal01')).classList.remove("modal-on");
        (<HTMLDivElement>document.getElementById('main-main-app-id')).classList.remove("blur");
        (<HTMLDivElement>document.getElementById('menu')).classList.remove("blur");
        //(<HTMLDivElement>document.getElementById('principal')).style.filter = "none";
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

		(<HTMLDivElement>document.getElementById('principal')).style.paddingTop = "40px";
		(<HTMLUListElement>document.getElementById('menu')).style.marginTop = "36px";
		(<HTMLInputElement>document.getElementById('desp-main-div')).style.display = "none";

	}

	getPersonaActual(): any {
		let me = this;
		me.persona = [];
		me.persona.push(me.personaId);
		me.persona.push(me.personaNombre);
		me.persona.push(me.personaMesActNum);
		me.persona.push(me.personaMesActNom);
		me.persona.push(me.personaAnno); 

		return me.persona;
	}
}
