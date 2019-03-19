import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-diario-inversiones',
  templateUrl: './diario-inversiones.component.html',
  styleUrls: ['./diario-inversiones.component.css']
})
export class DiarioInversionesComponent implements OnInit {

	public ipc = electron.ipcRenderer;
	public listPersonas: Array<string>;

	constructor(private ref: ChangeDetectorRef) { }

	ngOnInit() {
		let me = this;
		let result = me.ipc.sendSync("getPersonaAll");
        me.listPersonas = [];
        for (var i = 0; i < result.length; i++) {           
            me.listPersonas.push(result[i]);               
        }        

             

        
	}

	closeInsertDiario(event) {
		let me = this;
        me.ipc.sendSync('entry-accepted', 'ping')
            }   


        
}
