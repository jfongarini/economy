import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { Chart } from 'chart.js';
declare var electron: any;
declare var require: any;

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements OnInit {
	public ipc = electron.ipcRenderer;
	public persona = this._appComponent.getPersonaActual();
	public list: Array<string>;
	public resumenG = new Array();
	public resumenTotalG = new Array();
	public resumenI = new Array();
	public resumenTotalI = new Array();
	public resumenV = new Array();
	public resumenTotalV = new Array();

	public diarioLength: number;
	public categoriaLength: number;
	public listDiario: Array<string>;
	public listCategoria: Array<string>;

	public listInversiones: Array<string>;
	public listInversionesDiario: Array<string>;
	public inversionesLength: number;
	public inversionesDiarioLength: number;

	public total: number;

	constructor(private ref: ChangeDetectorRef, private _appComponent: AppComponent) { }

  	async ngOnInit() {

	    await this.generarTotales();
	    await this.getCategorias();
	    await this.getDiario();
	    await this.getInversiones();
	    await this.getInversionDiario();	    
	    await this.generarResumenDiario();
	    await this.generarResumenInver();
	    await this.refactorList();
	    await this.generarGraficoAnualIGR();

 	}

  getCompara():string {
    let me = this;
    let personaActualMes = String(this.persona[2]);
    let mes = "";
    let personaActualMesInt = +personaActualMes;
    if (personaActualMesInt < 10) {
      mes = 'm0'+personaActualMes;
    } else {
      mes = 'm'+personaActualMes;
    }    
    let ingresoSuma = 0;
    let gastoSuma = 0;
    let inversionSuma = 0;
    gastoSuma = me.resumenTotalG[mes];    
    ingresoSuma = me.resumenTotalI[mes];   
    inversionSuma = me.resumenTotalV[mes];
    me.total = ingresoSuma + inversionSuma + gastoSuma;
    return String(me.total);
  }

  getAnnoValidoDiario(fecha):boolean {
    let estado = false;
    var splitted = fecha.split("/",3);
    let personaActualAnno = String(this.persona[4]);
    let fechaAnno = splitted[2];
    if (fechaAnno == personaActualAnno) {
      estado = true;
    } 
    return estado;
  }

  getAnnoValidoInver(fecha):boolean {
    let estado = false;
    var splitted = fecha.split("-",3);
    let personaActualAnno = String(this.persona[4]);
    let fechaAnno = splitted[0];
    if (fechaAnno == personaActualAnno) {
      estado = true;
    } 
    return estado;
  }

  generarTotales(){
    let me = this;
    me.resumenTotalI = [];
    me.resumenTotalG = [];
    me.resumenTotalV = [];
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
          let fechaValida = me.getAnnoValidoDiario(sendFecha);
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
          let fechaValida = me.getAnnoValidoInver(sendFecha);
          if (fechaValida) {
            let splitted = sendFecha.split("-",3);
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
              me.resumenV[i][mes] = me.resumenV[i][mes] + +me.listInversionesDiario[j]['MONTO'];
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

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

	generarMesCero(indice,lista){
		let k = ''
		for (var i = 0; i < 12; i++) {
			let j = i+1;
			if (j < 10) {
				k = '0'+j;
			} else {
				k = String(j);
			}
			let mes = 'm'+k;
			let estadoMes = this.getSafe(() => lista[indice][mes]);
			if (estadoMes == undefined) {
				lista[indice][mes] = 0;
			}                
		}
	}

	getDiferenciaTotales(lista,listaI,listaG){
		let k = ''
		for (var i = 0; i < 12; i++) {
			let j = i+1;
			if (j < 10) {
				k = '0'+j;
			} else {
				k = String(j);
			}
			let mes = 'm'+k;
			var dif = listaI[mes] - listaG[mes];
			lista.push(dif);                
		}
	}

	getArregloColumnaBar(arr){
		arr.push('Enero');  
		arr.push('Febrero');
		arr.push('Marzo');
		arr.push('Abril');  
		arr.push('Mayo');  
		arr.push('Junio');
		arr.push('Julio');
		arr.push('Agosto'); 
		arr.push('Septiembre');  
		arr.push('Octubre');
		arr.push('Noviembre');
		arr.push('Diciembre'); 
	}

	getArregloDataBar(arr,indice,lista){
		arr.push(lista[indice].m01);
		arr.push(lista[indice].m02);
		arr.push(lista[indice].m03);
		arr.push(lista[indice].m04);
		arr.push(lista[indice].m05);
		arr.push(lista[indice].m06);
		arr.push(lista[indice].m07);
		arr.push(lista[indice].m08);
		arr.push(lista[indice].m09);
		arr.push(lista[indice].m10);
		arr.push(lista[indice].m11);
		arr.push(lista[indice].m12);
	}

	getTotalArregloDataBar(arr,lista){
		arr.push(lista.m01);
		arr.push(lista.m02);
		arr.push(lista.m03);
		arr.push(lista.m04);
		arr.push(lista.m05);
		arr.push(lista.m06);
		arr.push(lista.m07);
		arr.push(lista.m08);
		arr.push(lista.m09);
		arr.push(lista.m10);
		arr.push(lista.m11);
		arr.push(lista.m12);
	}


 	//Grafico Anual - Ingresos, Gastos, Remanente - Lineal (1)
 	generarGraficoAnualIGR(){
 		var me = this;
 		var arregloColumnaBar = [] ;
		//var arregloLabelBarI = [] ;
		var arregloDataBarI = [] ;
		//var arregloLabelBarG = [] ;
		var arregloDataBarG = [] ;
		var arregloDataBarDif = [];

 		var canvas1 = (<HTMLCanvasElement>document.getElementById('chart'))
		var ctx1 = canvas1.getContext('2d');

		var color11 = 'rgba(41,41,97,0.1)'; //azul
		var color14 = 'rgba(41,41,97,0.4)';
		var color21 = 'rgba(255,99,132,0.1)'; //rojo
		var color24 = 'rgba(255,99,132,0.4)';
		var color31 = 'rgba(70,191,189,0.1)';
		var color34 = 'rgba(70,191,189,0.4)';
		var color41 = 'rgba(162,183,58,0.1)'; // verde
		var color44 = 'rgba(162,183,58,0.4)';
		var tipos = 'line';                         
		var options = { scales: { yAxes: [{ ticks: { beginAtZero: true, min: 0 } }] } }; 

		this.getArregloColumnaBar(arregloColumnaBar);

		for (var key in me.resumenTotalI) {
			//this.generarMesCero(key,me.resumenTotalI);
			this.getTotalArregloDataBar(arregloDataBarI,me.resumenTotalI);
    		//arregloLabelBarI.push('Ingresos');
		}

		for (var key in me.resumenTotalG) {
			//this.generarMesCero(key,me.resumenTotalG);
			this.getTotalArregloDataBar(arregloDataBarG,me.resumenTotalG);
    		//arregloLabelBarG.push('Gastos');
		}

		this.getDiferenciaTotales(arregloDataBarDif,me.resumenTotalI,me.resumenTotalG);


	        
		var data1 = { 
			labels: arregloColumnaBar, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: color11, 
				borderColor: color14, 
				borderWidth: 2, 
				hoverBackgroundColor: color14, 
				hoverBorderColor: color14, 
				data: arregloDataBarI
			},{
				label: 'Gastos', 
				backgroundColor: color21, 
				borderColor: color24, 
				borderWidth: 2, 
				hoverBackgroundColor: color24, 
				hoverBorderColor: color24, 
				data: arregloDataBarG
			},{
				label: 'Diferencia', 
				backgroundColor: color31, 
				borderColor: color34, 
				borderWidth: 2, 
				hoverBackgroundColor: color34, 
				hoverBorderColor: color34, 
				data: arregloDataBarDif
			}]
		}; 
	  	//var chart = new Chart(ctx1, opts)
	  	var chart = new Chart(ctx1, { type: tipos, data: data1, options: options	});
 	}


 	//Grafico Anual y Mensual - Ingresos y Gastos por categoria - Torta (4)	
	//Grafico Anual - Inversiones - Gastos, Ingresos - Barra (1)

}
