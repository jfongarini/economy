import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppComponent } from '../app.component';
declare var electron: any;
declare var require: any;

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
  public resumenG = new Array();
  public resumenI = new Array();
  public resumenV = new Array();
  public meses = new Array();

  public diarioLength: number;
  public categoriaLength: number;
  public listDiario: Array<string>;
  public listDiarioG: Array<string>;
  public listDiarioI: Array<string>;
  public listCategoria: Array<string>;

  constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  async ngOnInit() {
    this.compara = false;
    this.mensaje = "";
    await this.getCategorias();
    await this.getDiario();
    await this.generarResumen();
    await this.refactorList();
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
    if (fechaAnno == personaActualAnno) {
      estado = true;
    } 
    return estado;
  }

  getCategorias(){
    let me = this;
    let personaActualID = this.persona[0];
    let result = me.ipc.sendSync("getCategorias", personaActualID);
      //me.ipc.send("getCategorias", personaActualID)
      //me.ipc.on("resultSentCategorias", function (evt, result) {
        me.listCategoria = [];
        me.categoriaLength = result.length;
        for (var i = 0; i < me.categoriaLength; i++) {       
          me.listCategoria.push(result[i]);       
        }
        me.ref.detectChanges()
      //});
  }

  getDiario(){
    let me = this;
    let personaActualID = this.persona[0];  
    let result = me.ipc.sendSync("getDiario", personaActualID);  
    //me.ipc.send("getDiario", personaActualID)
    //me.ipc.on("resultSentDiario", function (evt, result) {
      me.listDiario = [];
      me.diarioLength = result.length;
      for (var i = 0; i < me.diarioLength; i++) {
        me.listDiario.push(result[i]);
      }
      me.ref.detectChanges()
   // });
  }

  getUnDiario(diarioCategoria){
    let me = this;
    let personaActualID = this.persona[0];    
    let result = me.ipc.sendSync("getDiarioCategoria", personaActualID, diarioCategoria)
    me.listDiario = [];
    me.diarioLength = result.length;
    for (var i = 0; i < me.diarioLength; i++) {
      me.listDiario.push(result[i]);
    }
    me.ref.detectChanges()
  }

  async generarResumen(){
    let me = this;
    let valido = false;
    for (var i = 0; i < me.categoriaLength; i++) { 
      let suma = 0;
      let idCat = me.listCategoria[i]['ID'];
      let giCat = me.listCategoria[i]['GI'];
      let nombreCat =  me.listCategoria[i]['NOMBRE'];
     // this.getUnDiario(idCat);
      for (var j = 0; j < me.diarioLength; j++) { 
        let idDiarioCat = me.listDiario[j]['ID_CATEGORIA'];
        if (idDiarioCat == idCat) {
          let sendFecha = me.listDiario[j]['FECHA'];
          let fechaValida = me.getAnnoValido(sendFecha);
          if (fechaValida) {
            let splitted = sendFecha.split("/",3);
            let mesCat = splitted[1];
            let mes = 'm'+mesCat;
            if (giCat == 'G') {

              let estadoCate = this.getSafe(() => me.resumenG[i]);
              if (estadoCate == undefined) {
                me.resumenG[i] = [];
              }
              let estadoNombre = this.getSafe(() => me.resumenG[i]['nombre']);
              if (estadoNombre == undefined) {
                me.resumenG[i]['nombre'] = nombreCat;
              }  
              let estadoMes = this.getSafe(() => me.resumenG[i][mes]);
              if (estadoMes == undefined) {
                me.resumenG[i][mes] = 0;
              }            
              me.resumenG[i][mes] = me.resumenG[i][mes] + +me.listDiario[j]['MONTO'];
            } else {
              let estadoCate = this.getSafe(() => me.resumenI[i]);
              if (estadoCate == undefined) {
                me.resumenI[i] = [];
              }
              let estadoNombre = this.getSafe(() => me.resumenI[i]['nombre']);
              if (estadoNombre == undefined) {
                me.resumenI[i]['nombre'] = nombreCat;
              }  
              let estadoMes = this.getSafe(() => me.resumenI[i][mes]);
              if (estadoMes == undefined) {
                me.resumenI[i][mes] = 0;
              }            
              me.resumenI[i][mes] = me.resumenI[i][mes] + +me.listDiario[j]['MONTO'];
            }
          }
        }
      }
    }
  }

  getSafe(fn) {
      try {
          return fn();
      } catch (e) {
          return undefined;
      }
  }

  refactorList(){
    let me = this;
    for (var i = 0; i < me.resumenI.length; i++) {
      let position = this.getSafe(() => me.resumenI[i]);
      if (position == undefined) {        
        me.resumenI.splice(i,1);
        i--
      }      
    };
    for (var i = 0; i < me.resumenG.length; i++) {
      let position = this.getSafe(() => me.resumenG[i]);
      if (position == undefined) {        
        me.resumenG.splice(i,1);
        i--
      }
    };
  }
}
