import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
declare var electron: any;

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public list: Array<string>;

	constructor(private ref: ChangeDetectorRef) { }


  ngOnInit() {
  	    let me = this;
	    me.ipc.send("mainWindowLoaded")
	    console.log(5);
	    me.ipc.on("resultSent", function (evt, result) {
	      me.list = [];
	      for (var i = 0; i < result.length; i++) {
	        me.list.push(result[i].NOMBRE.toString());
	      }
	      me.ref.detectChanges()
	    });
  }

  start() {
    console.log(123);
  }



}