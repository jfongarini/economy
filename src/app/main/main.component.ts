import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare let electron: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public ipc = electron.ipcRenderer;
  public persona = this._appComponent.getPersonaActual();
  public list: Array<string>;
  public compara: boolean;
  public mensaje: string;
  public resumen: new Array();
  public categoriaPrimaria: new Array();
  public categoriaSecundaria: new Array();
  public meses: new Array();

  public diarioLength: number;
  public listDiario: Array<string>;
  public listDiarioG: Array<string>;
  public listDiarioI: Array<string>;
  public listCategoria: Array<string>;

  constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  ngOnInit() {
    this.compara = false;
    this.mensaje = "";
    this.getCategorias();
    this.getDiario();
    this.generarResumen();
  }

  checkComparacion(){
    var saldo = +(<HTMLInputElement>document.getElementById('submitSaldo')).value;
    var billetera = +(<HTMLInputElement>document.getElementById('submitBilletera')).value;
    var banco = +(<HTMLInputElement>document.getElementById('submitBanco')).value;
    var saldoReal = billetera + banco;

    if (saldo == saldoReal){
      this.compara = true;
      (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="hidden";
    } else {
      this.compara = false;
      if (saldo > saldoReal) {
        (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="visible";
        this.mensaje = "El saldo disponible es mayor al saldo real";
      } else {
        (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="visible";
        this.mensaje = "El saldo real es mayor al saldo disponible";
      }
    }
  }

  getAnnoValido(fecha):boolean {
    let estado = false;
    var splitted = fecha.split("/",3);
    let personaActualAnno = String(this.persona[4]);
    let fechaAnno = splitted[2];
    if (fechaAnno == personaActualAnno)) {
      estado = true;
    } 
    return estado;
  }

  getCategorias(){
    let me = this;
    let personaActualID = this.persona[0];
      me.ipc.send("getCategorias", personaActualID)
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
    let personaActualID = this.persona[0];    
      me.ipc.send("getDiario", personaActualID)
      me.ipc.on("resultSentDiario", function (evt, result) {
        me.diarioLength = result.length;
        for (var i = 0; i < me.diarioLength; i++) {
          me.listDiario.push(result[i]);
        }
        me.ref.detectChanges()
      });
  }

  generarResumen(){
    let me = this;
    me.resumen[0]['ingresos'] = [];  
    me.resumen[1]['gastos'] = [];
    me.resumen[2]['inversiones'] = [];
    let valido = false;
    for (var i = 0; i < me.diarioLength; i++) {   
      let sendFecha = me.listDiario.FECHA;
      let fechaValida = me.getFecha(sendFecha);
      if (fechaValida) {
        let idCat = me.listDiario[i].ID_CATEGORIA;
        let giCat = me.listCategoria[idCat-1]['GI'];
        let nombreCat =  me.listCategoria[idCat-1]['NOMBRE'];
        var splitted = fecha.split("/",3);
        let mesCat = splitted[1];
        let mes = "";
        if (mesCat < 10) {
          mes = 'm0'+mesCat;
        } else {
          mes = 'm'+mesCat;
        }
        
      }
    }
  }
}
