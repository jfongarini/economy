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
  public resumenTotalG = new Array();
  public resumenI = new Array();
  public resumenTotalI = new Array();
  public resumenV = new Array();
  public resumenTotalV = new Array();
  public meses = new Array();
  public saldos = new Array();
  public listSaldos = new Array();
  public listSaldosAnt = new Array();
  public saldoLength: number;

  public diarioLength: number;
  public categoriaLength: number;
  public listDiario: Array<string>;
  public listCategoria: Array<string>;

  public listInversiones: Array<string>;
  public listInversionesDiario: Array<string>;
  public inversionesLength: number;
  public inversionesDiarioLength: number;
  public total: number;
  public sumaFinal: number;

  constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  async ngOnInit() {
    this.compara = false;
    this.mensaje = "";
    await this.generarTotales();
    await this.getCategorias();
    await this.getDiario();
    await this.getInversiones();
    await this.getInversionDiario();
    
    await this.generarResumenDiario();
    await this.generarResumenInver();
    await this.refactorList();
    await this.getSaldo();
    await this.generarListaSaldos();
    await this.getTotalDisponible();
  }

  checkComparacion(){
    let me = this;
    var saldo = me.sumaFinal;
    var billetera = +(<HTMLInputElement>document.getElementById('submitBilletera')).value;
    var banco = +(<HTMLInputElement>document.getElementById('submitBanco')).value;
    var saldoReal = billetera + banco;

    if (saldo == saldoReal){
      this.compara = true;
      (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="visible";
      (<HTMLInputElement>document.getElementById('saldoError')).style.color="black";
      this.mensaje = "La comparación fue exitosa";
    } else {
      this.compara = false;
      if (saldo > saldoReal) {
        (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="visible";
        (<HTMLInputElement>document.getElementById('saldoError')).style.color="red";
        this.mensaje = "El saldo disponible es mayor al saldo real";
      } else {
        (<HTMLInputElement>document.getElementById('saldoError')).style.visibility="visible";
        (<HTMLInputElement>document.getElementById('saldoError')).style.color="red";
        this.mensaje = "El saldo real es mayor al saldo disponible";
      }
    }
  }

  getSaldo(){
    let me = this;
    let personaActualID = this.persona[0];
    let result = me.ipc.sendSync("getSaldo", personaActualID);
        me.saldos = [];
        me.saldoLength = result.length;
        for (var i = 0; i < me.saldoLength; i++) {       
          me.saldos.push(result[i]);       
        }
        me.ref.detectChanges()
  }

  setSaldo() {
    let me = this;
    let mes = "";
    let mesGuardar = "";

    for (var i = 1; i <= 12; i++) {      
      if (i < 10) {
        mesGuardar = '0'+i;
      } else {
        mesGuardar = String(i);
      }    
      mes = 'm'+mesGuardar;
      let ingresoSuma = 0;
      let gastoSuma = 0;
      let inversionSuma = 0;
      gastoSuma = me.resumenTotalG[mes];    
      ingresoSuma = me.resumenTotalI[mes];   
      inversionSuma = me.resumenTotalV[mes];
      me.total = ingresoSuma + inversionSuma - gastoSuma;

      var mesAnno = mesGuardar + '/' + String(this.persona[4]);
      let saldoActual = me.saldos.find(sal => sal['FECHA'] === mesAnno);
      let estadoSaldo = this.getSafe(() => saldoActual);
      if (estadoSaldo == undefined) {
        let personaActualID = this.persona[0];
        me.ipc.send("insertSaldo", personaActualID, mesAnno, me.total);
      } else {
        me.ipc.send("updateSaldo", saldoActual['ID'], me.total);
      }
    }

    me.total = 0;
    let personaActualAnnoPasado = String(this.persona[4] -1);
    var mes12Anno = '12/' + personaActualAnnoPasado;
    var mes11Anno = '11/' + personaActualAnnoPasado;
    var mesAnno = '13/' + String(this.persona[4]);
    let saldo12AnnoPasado = me.saldos.find(sal => sal['FECHA'] === mes12Anno);
    let saldo11AnnoPasado = me.saldos.find(sal => sal['FECHA'] === mes11Anno);
    let saldoActual = me.saldos.find(sal => sal['FECHA'] === mesAnno);
    let estado12Saldo = this.getSafe(() => saldo12AnnoPasado);
    let estado11Saldo = this.getSafe(() => saldo11AnnoPasado);
    let estadoSaldo = this.getSafe(() => saldoActual);

    if (estado12Saldo != undefined) {     
      me.total = saldo12AnnoPasado['SALDO'];
    }

    if (estado11Saldo != undefined) {    
      me.total = me.total + saldo11AnnoPasado['SALDO'];
    }

    if (estadoSaldo == undefined){
      let personaActualID = this.persona[0];
      me.ipc.send("insertSaldo", personaActualID, mesAnno, me.total);
    } else {
      me.ipc.send("updateSaldo", saldoActual['ID'], me.total);
    }
  }

  getAnnoValido(fecha):boolean {
    let estado = false;
    let personaActualAnno = String(this.persona[4]);
    if (fecha == personaActualAnno) {
      estado = true;
    } 
    return estado;
  }

  generarListaSaldos(){
    this.setSaldo();
    this.getSaldo();
    let me = this;
    
    for (var i = 0; i < me.saldoLength; i++) {
      let fecha = me.saldos[i]['FECHA']
      let splitted = fecha.split("/",2);
      let fechaAnno = splitted[1];
      let valido = this.getAnnoValido(fechaAnno);
      if (valido) {
        let mesSal = splitted[0];
        let mes = 'm'+mesSal;
        me.listSaldos[mes] = me.saldos[i]['SALDO'];                 
      }
    }

    for (var i = 1; i < 13; i++) {
      if (i > 2) {
        let mesAct = "";
        let mesAnt = "";
        if (i <= 10) {
          mesAct = 'm0'+i;
          if (i == 10) {
            mesAnt = 'm09';
          } else {
            mesAnt = 'm0'+ String(i-1);
          }
        } else {
          mesAct = 'm'+i;
          mesAnt = 'm'+ String(i-1);
        } 
        me.listSaldosAnt[mesAct] = me.listSaldosAnt[mesAnt] + me.listSaldos[mesAnt];
      } else {
        if (i == 2) {
          me.listSaldosAnt['m02'] = me.listSaldos['m13'] + me.listSaldos['m01'];
        } else {
          me.listSaldosAnt['m01'] = me.listSaldos['m13'];
        }
        
      }  
    }
  }

  getTotalDisponible():string {
    let me = this;
    let personaActualMes = String(this.persona[2]);
    let mesActual = "";
    let personaActualMesInt = +personaActualMes;

    if (personaActualMesInt < 10) {
      mesActual = 'm0'+personaActualMes;
    } else {
      mesActual = 'm'+personaActualMes;
    }       

    me.sumaFinal = me.listSaldos[mesActual] + me.listSaldosAnt[mesActual];
    return String(me.sumaFinal);

  }

  generarTotales(){
    let me = this;
    me.resumenTotalI = [];
    me.resumenTotalG = [];
    me.resumenTotalV = [];
    me.listSaldos = [];
    let k = ''
    for (var i = 0; i < 12; i++) {
      let j = i+1;
      if (j < 10) {
        k = '0'+j;
      } else {
        k = String(j);
      }
      let mes = 'm'+k;
      me.resumenTotalI[mes] = 0;      
      me.resumenTotalG[mes] = 0;
      me.resumenTotalV[mes] = 0;
      me.listSaldos[mes] = 0; 
    }
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

  generarResumenDiario(){
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
          let splitted = sendFecha.split("/",3);
          let fechaAnno = splitted[2];
          let fechaValida = me.getAnnoValido(fechaAnno);
          if (fechaValida) {
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
              me.resumenTotalG[mes] = me.resumenTotalG[mes] + +me.listDiario[j]['MONTO'];
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
              me.resumenTotalI[mes] = me.resumenTotalI[mes] + +me.listDiario[j]['MONTO'];
            }
          }
        }
      }
    }
  }

  getInversiones(){
    let me = this;    
    let personaActualID = this.persona[0];
    let result = me.ipc.sendSync("getInversiones", personaActualID)
    me.listInversiones = [];      
    me.inversionesLength = result.length; 
    for (var i = 0; i < me.inversionesLength; i++) {    
      me.listInversiones.push(result[i]);                 
    }
    me.ref.detectChanges()
  }

  getInversionDiario(){
    let me = this;    
    let result2 = me.ipc.sendSync("getInversionDiario")
    me.inversionesDiarioLength = result2.length;     
    me.listInversionesDiario = [];
    for (var j = 0; j < me.inversionesDiarioLength; j++) {         
      me.listInversionesDiario.push(result2[j]);   
    }
    me.ref.detectChanges()                    
  }

  generarResumenInver(){
    let me = this;
    let valido = false;
    for (var i = 0; i < me.inversionesLength; i++) { 
      let idInv = me.listInversiones[i]['ID'];
      let nombreInv = me.listInversiones[i]['NOMBRE'];
      for (var j = 0; j < me.inversionesDiarioLength; j++) { 
        let idDiarioInv = me.listInversionesDiario[j]['ID_INVERSION'];
        if (idDiarioInv == idInv) {
          let sendFecha = me.listInversionesDiario[j]['FECHA'];
          let splitted = sendFecha.split("-",3);
          let fechaAnno = splitted[0];
          let fechaValida = me.getAnnoValido(fechaAnno);
          if (fechaValida) {
            let mesInv = splitted[1];
            let mes = 'm'+mesInv;
            let estadoInv = this.getSafe(() => me.resumenV[i]);
            if (estadoInv == undefined) {
              me.resumenV[i] = [];
            }
            let estadoNombre = this.getSafe(() => me.resumenV[i]['nombre']);
            if (estadoNombre == undefined) {
              me.resumenV[i]['nombre'] = nombreInv;
            }  
            let estadoMes = this.getSafe(() => me.resumenV[i][mes]);
            if (estadoMes == undefined) {
              me.resumenV[i][mes] = 0;
            }            
            let estadoFin = me.listInversionesDiario[j]['FINALIZADO'];
            if (estadoFin == 0) {
              me.resumenTotalV[mes] = me.resumenTotalV[mes] - +me.listInversionesDiario[j]['MONTO'];
              me.resumenV[i][mes] = me.resumenV[i][mes] - +me.listInversionesDiario[j]['MONTO'];
            } else {
              me.resumenTotalV[mes] = me.resumenTotalV[mes] + +me.listInversionesDiario[j]['MONTO'] + +me.listInversionesDiario[j]['GANANCIA'];
              me.resumenV[i][mes] = me.resumenV[i][mes] + +me.listInversionesDiario[j]['MONTO'] + +me.listInversionesDiario[j]['GANANCIA'];
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
    for (var i = 0; i < me.resumenV.length; i++) {
      let position = this.getSafe(() => me.resumenV[i]);
      if (position == undefined) {        
        me.resumenV.splice(i,1);
        i--
      }
    };
  }

}

