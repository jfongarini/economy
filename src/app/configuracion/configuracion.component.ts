import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var electron: any;
declare var require: any;

let conf = require('./configuracion');

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public list: Array<string>;

	constructor(private ref: ChangeDetectorRef) { }

	getNombreCategoria(){
		let me = this;
	    me.ipc.send("mainWindowLoaded")
	    me.ipc.on("resultSent", function (evt, result) {
			me.list = [];
			for (var i = 0; i < result.length; i++) {
				me.list.push(result[i].NOMBRE.toString());
			}
			me.ref.detectChanges()
	    });
	}

	ngOnInit() {
		this.getNombreCategoria();
	}

	start() {
		console.log(123);
		console.log(conf.hola);
		console.log(this.list);	
	}

 
	submitForm() {
		var res2 = (<HTMLInputElement>document.getElementById('submit')).value;
		console.log(res2);
		let me = this;
	    me.ipc.send("insert", res2);
	    this.getNombreCategoria();
	}

}