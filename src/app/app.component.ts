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
  	public eliminarID: number;
  	public personaId: number;
	public personaNombre: string;
	public personaImagen: number;
	public personaAnno: number;
	public personaMesActNum: number;
	public personaMesActNom: string;
	public persona: Array<any>;
	public meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
              "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

    public annos = [];

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
			me.personaImagen = result[0].IMAGEN;
			
	    //});
	    (<HTMLImageElement>document.getElementById('imagen')).src = "./assets/icons/" + me.personaImagen + ".png";
	    (<HTMLInputElement>document.getElementById('edit' + String(me.personaImagen))).checked = true;
	    me.ref.detectChanges()
	}

	gelAllPersona(){
		let me = this;
		let result = me.ipc.sendSync("getPersonaAll"); 
		me.listPersonas = result;
	}

	setAnno(){
		let me = this;
		for (var i = 15; i <= 50; i++) {
			me.annos.push('20'+ String(i));
		}
	}

	async ngOnInit() {
		await this.setAnno();
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
		var imagen = 0;

		for (var i = 1; i <= 10; i++){
			if((<HTMLInputElement>document.getElementById('edit' + String(i))).checked){
				imagen = i;
			}
		}

		var nombreSend = "";
		var mesSend = 0;
		var annoSend = 0;
		var imaSend = 0;

		if (nombreU == "") {
			nombreSend = me.personaNombre;
		} else {
			nombreSend = nombreU;
		}

		if (mesU == "") {
			mesSend = me.personaMesActNum;
		} else {
			var nuevoMes = me.meses.indexOf(mesU) + 1;
			mesSend = +nuevoMes;
		}

		if (annoU == "") {
			annoSend = me.personaAnno;
		} else {
			annoSend = +annoU;
		}

		if (imagen == 0) {
			imagen = me.personaImagen;
		} else {
			imaSend = imagen;
		}

		me.ipc.send("updatePersona", me.personaId, nombreSend, mesSend, annoSend, imaSend);
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
		me.persona.push(me.personaImagen); 

		return me.persona;
	}

	public blankInputNombre() {
		(<HTMLInputElement>document.getElementById('newNombre')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('nombreError')).style.visibility="hidden";
	}

	public blankInputAnno() {
		(<HTMLInputElement>document.getElementById('newAnno')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('annoError')).style.visibility="hidden";
	}

	public blankInputMes() {
		(<HTMLInputElement>document.getElementById('newMes')).style.borderColor=""; 
		(<HTMLInputElement>document.getElementById('mesError')).style.visibility="hidden";
	}

	public newLoginFrom() {		
		(<HTMLInputElement>document.getElementById('nuevo-usuario-id')).style.display = "block";
		(<HTMLInputElement>document.getElementById('eliminar-usuario-id')).style.display = "none";
	}


	public newL(event) {
		let me = this;
		var nombre = (<HTMLInputElement>document.getElementById('newNombre')).value;
		var mes = (<HTMLInputElement>document.getElementById('newMes')).value;
		var anno = (<HTMLInputElement>document.getElementById('newAnno')).value;
		var imagen = 0;

		for (var i = 1; i <= 10; i++){
			if((<HTMLInputElement>document.getElementById('new' + String(i))).checked){
				imagen = i;
			}
		}

		if ((nombre == "") || (anno == "") || (mes == "")) {
			if (nombre == "") {
				(<HTMLInputElement>document.getElementById('newNombre')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('nombreError')).style.visibility="visible";
			}
			if (anno == "") {
				(<HTMLInputElement>document.getElementById('newAnno')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('annoError')).style.visibility="visible";
			}
			if (mes == "") {
				(<HTMLInputElement>document.getElementById('newMes')).style.borderColor="red"; 
				(<HTMLInputElement>document.getElementById('mesError')).style.visibility="visible";
			}
		} else {
			(<HTMLInputElement>document.getElementById('newNombre')).value = "";
			(<HTMLInputElement>document.getElementById('newAnno')).value = "";
			(<HTMLInputElement>document.getElementById('newMes')).value = "";
			(<HTMLInputElement>document.getElementById('newImagen')).value = "1";
			(<HTMLInputElement>document.getElementById('new' + String(imagen))).checked = false;
			var nuevoMes = me.meses.indexOf(mes) + 1;
			me.ipc.send("newUsuario", nombre, nuevoMes, anno, imagen);
			me.closeInsertL();
		}	    
	    this.gelAllPersona();
	}

	public previoRemoveL(event) {	
		let me = this;
		me.eliminarID = event.target.id;
		(<HTMLInputElement>document.getElementById('eliminar-usuario-id')).style.display = "block";
		(<HTMLInputElement>document.getElementById('nuevo-usuario-id')).style.display = "none";
		this.gelAllPersona();
	}

	public removeL() {
		let me = this;
	    me.ipc.send("removeLogin", me.eliminarID);
	    me.closeDeleteL();
	    this.gelAllPersona();
	}

	public closeDeleteL() {
		(<HTMLInputElement>document.getElementById('eliminar-usuario-id')).style.display = "none";
	}

	public closeInsertL() {
		this.blankInputNombre();
		this.blankInputAnno();
		this.blankInputMes();
		(<HTMLInputElement>document.getElementById('nuevo-usuario-id')).style.display = "none";
		(<HTMLInputElement>document.getElementById('newNombre')).value = "";
		(<HTMLInputElement>document.getElementById('newAnno')).value = "";
		(<HTMLInputElement>document.getElementById('newMes')).value = "";
		(<HTMLInputElement>document.getElementById('newImagen')).value = "1";
	}
}
