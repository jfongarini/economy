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
	public resumenTotalVI = new Array();
	public resumenTotalVG = new Array();

	public diarioLength: number;
	public categoriaLength: number;
	public listDiario: Array<string>;
	public listCategoria: Array<string>;

	public listInversiones: Array<string>;
	public listInversionesDiario: Array<string>;
	public inversionesLength: number;
	public inversionesDiarioLength: number;

	public total: number;

	public color11: string;
	public color14: string;
	public color21: string;
	public color24: string;
	public color31: string;
	public color34: string;
	public color41: string;
	public color44: string;
  public colorSet: Array<string>;

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
	    await this.setColores();
	    await this.generarGraficoAnualIGR();
	    await this.generarGraficoInversiones();
	    await this.generarGraficoAnualCatI();
	    await this.generarGraficoAnualCatG();
	    await this.generarGraficoMesCatI();
	    await this.generarGraficoMesCatG();

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
    me.resumenTotalVI = [];
    me.resumenTotalVG = [];
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
      me.resumenTotalVI[mes] = 0;
      me.resumenTotalVG[mes] = 0;
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
            me.resumenTotalVG[mes] = me.resumenTotalVG[mes] - +me.listInversionesDiario[j]['MONTO'];
            me.resumenV[i][mes] = me.resumenV[i][mes] - +me.listInversionesDiario[j]['MONTO'];
            if (estadoFin != 0) {
              let sendFecha = me.listInversionesDiario[j]['FINALIZADO'];
              let splitted = sendFecha.split("-",3);
              let fechaAnno = splitted[0];
              let fechaValida = me.getAnnoValidoInver(fechaAnno);
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
                me.resumenTotalVI[mes] = me.resumenTotalVI[mes] + +me.listInversionesDiario[j]['MONTO'] + +me.listInversionesDiario[j]['GANANCIA'];
                me.resumenV[i][mes] = me.resumenV[i][mes] + +me.listInversionesDiario[j]['MONTO'] + +me.listInversionesDiario[j]['GANANCIA'];
              }
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

	getDiferenciaTotalesInv(lista,listaI,listaG){
		let k = ''
		for (var i = 0; i < 12; i++) {
			let j = i+1;
			if (j < 10) {
				k = '0'+j;
			} else {
				k = String(j);
			}
			let mes = 'm'+k;
			var dif = listaI[mes] + listaG[mes];
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

	getArregloDataPie(arr,indice,lista){
		let k = ''
		var suma = 0;
		for (var i = 0; i < 12; i++) {
			let j = i+1;
			if (j < 10) {
				k = '0'+j;
			} else {
				k = String(j);
			}
			let mes = 'm'+k;
			let estadoMes = this.getSafe(() => lista[indice][mes]);
            if (estadoMes != undefined) {
              suma = suma + lista[indice][mes];
            } 			          
		}
		arr.push(suma);
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

	setColores(){
		var me = this;
		me.color11 = 'rgba(41,41,97,0.1)'; //azul
		me.color14 = 'rgba(41,41,97,0.4)';
		me.color21 = 'rgba(255,99,132,0.1)'; //rojo
		me.color24 = 'rgba(255,99,132,0.4)';
		me.color31 = 'rgba(70,191,189,0.1)';
		me.color34 = 'rgba(70,191,189,0.4)';
		me.color41 = 'rgba(162,183,58,0.1)'; // verde
		me.color44 = 'rgba(162,183,58,0.4)';
    me.colorSet = [
                    'rgba(237,187,153,0.4)',
                    'rgba(171,235,198,0.4)',
                    'rgba(249,231,159,0.4)',
                    'rgba(210,180,222,0.4)',
                    'rgba(245,183,177,0.4)',
                    'rgba(230,176,170,0.4)',
                    'rgba(174,214,241,0.4)',
                    'rgba(169,223,191,0.4)',
                    'rgba(250,215,160,0.4)',
                    'rgba(215,189,226,0.4)',
                    'rgba(245,203,167,0.4)',
                    'rgba(169,204,227,0.4)'
                  ];
	}
		


 	//Grafico Anual - Ingresos, Gastos, Remanente - Lineal (1)
 	generarGraficoAnualIGR(){
 		var me = this;
 		var arregloColumnaBar1 = [] ;
		//var arregloLabelBarI = [] ;
		var arregloDataBarI1 = [] ;
		//var arregloLabelBarG = [] ;
		var arregloDataBarG1 = [] ;
		var arregloDataBarDif1 = [];

 		var canvas1 = (<HTMLCanvasElement>document.getElementById('resumen'))
		var ctx1 = canvas1.getContext('2d');


		var tipos = 'bar';                         
		var options = { scales: { yAxes: [{ ticks: { beginAtZero: true} }] } }; 

		this.getArregloColumnaBar(arregloColumnaBar1);

		for (var key in me.resumenTotalI) {
			//this.generarMesCero(key,me.resumenTotalI);
			this.getTotalArregloDataBar(arregloDataBarI1,me.resumenTotalI);
    		//arregloLabelBarI.push('Ingresos');
		}

		for (var key in me.resumenTotalG) {
			//this.generarMesCero(key,me.resumenTotalG);
			this.getTotalArregloDataBar(arregloDataBarG1,me.resumenTotalG);
    		//arregloLabelBarG.push('Gastos');
		}

		this.getDiferenciaTotales(arregloDataBarDif1,me.resumenTotalI,me.resumenTotalG);


	        
		var data1 = { 
			labels: arregloColumnaBar1, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.color11, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarI1
			},{
				label: 'Gastos', 
				backgroundColor: me.color21, 
				borderColor: me.color24, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color24, 
				hoverBorderColor: me.color24, 
				data: arregloDataBarG1
			},{
				label: 'Diferencia', 
				backgroundColor: me.color41, 
				borderColor: me.color44, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color44, 
				hoverBorderColor: me.color44, 
				data: arregloDataBarDif1
			}]
		}; 
	  	//var chart = new Chart(ctx1, opts)
	  	var resumen = new Chart(ctx1, { type: tipos, data: data1, options: options	});
 	}

	//Grafico Anual - Inversiones - Gastos, Ingresos - Barra (1)


	

	generarGraficoInversiones(){
 		var me = this;
 		var arregloColumnaBar2 = [] ;
		var arregloDataBarI2 = [] ;
		var arregloDataBarG2 = [] ;
		var arregloDataBarDif2 = [];

 		var canvas2 = (<HTMLCanvasElement>document.getElementById('inversiones'))
		var ctx2 = canvas2.getContext('2d');

		var tipos = 'line';                         
		var options = { scales: { yAxes: [{ ticks: { beginAtZero: true } }] } }; 

		this.getArregloColumnaBar(arregloColumnaBar2);

		for (var key in me.resumenTotalVI) {
			this.getTotalArregloDataBar(arregloDataBarI2,me.resumenTotalVI);
		}

		for (var key in me.resumenTotalVG) {
			this.getTotalArregloDataBar(arregloDataBarG2,me.resumenTotalVG);
		}

		this.getDiferenciaTotalesInv(arregloDataBarDif2,me.resumenTotalVG,me.resumenTotalVI);


	        
		var data1 = { 
			labels: arregloColumnaBar2, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.color11, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarI2
			},{
				label: 'Gastos', 
				backgroundColor: me.color21, 
				borderColor: me.color24, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color24, 
				hoverBorderColor: me.color24, 
				data: arregloDataBarG2
			},{
				label: 'Diferencia', 
				backgroundColor: me.color41, 
				borderColor: me.color44, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color44, 
				hoverBorderColor: me.color44, 
				data: arregloDataBarDif2
			}]
		}; 
	  	var inversiones = new Chart(ctx2, { type: tipos, data: data1, options: options	});
 	}	

	//Grafico Anual y Mensual - Ingresos y Gastos por categoria - Torta (4)	

	generarGraficoAnualCatG(){
 		var me = this;
 		var arregloColumnaBar3 = [] ;
		var arregloDataBarI3 = [] ;
		var arregloDataBarG3 = [] ;

 		var canvas3 = (<HTMLCanvasElement>document.getElementById('anualCatG'))
		var ctx3 = canvas3.getContext('2d');


		var tipos = 'pie';                         
		var options = { }; 

		for (var j = 0; j < me.resumenG.length; j++) { 
        	arregloColumnaBar3.push(me.resumenG[j]['nombre']);
        }

		for (var key in me.resumenG) {
			this.getArregloDataPie(arregloDataBarG3,key,me.resumenG);
		}
	        
		var data1 = { 
			labels: arregloColumnaBar3, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.colorSet, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarG3
			}]
		}; 

	  	var anualCatG = new Chart(ctx3, { type: tipos, data: data1, options: options	});
 	}

 	generarGraficoAnualCatI(){
 		var me = this;
 		var arregloColumnaBar3 = [] ;
		var arregloDataBarI3 = [] ;
		var arregloDataBarG3 = [] ;

 		var canvas3 = (<HTMLCanvasElement>document.getElementById('anualCatI'))
		var ctx3 = canvas3.getContext('2d');


		var tipos = 'pie';                         
		var options = { }; 

		for (var j = 0; j < me.resumenI.length; j++) { 
        	arregloColumnaBar3.push(me.resumenI[j]['nombre']);
        }

		for (var key in me.resumenI) {
			this.getArregloDataPie(arregloDataBarG3,key,me.resumenI);
		}
	        
		var data1 = { 
			labels: arregloColumnaBar3, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.colorSet, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarG3
			}]
		}; 

	  	var anualCatI = new Chart(ctx3, { type: tipos, data: data1, options: options	});
 	}

	generarGraficoMesCatI(){
		var me = this;
 		var arregloColumnaBar3 = [] ;
		var arregloDataBarI3 = [] ;
		var arregloDataBarG3 = [] ;

 		var canvas3 = (<HTMLCanvasElement>document.getElementById('mesCatI'))
		var ctx3 = canvas3.getContext('2d');


		var tipos = 'pie';                         
		var options = { }; 

		let personaActualMesNum = this.persona[2];
		let mes = ''
		if (personaActualMesNum < 10) {
			mes = 'm0'+ String(personaActualMesNum);
		} else {
			mes = 'm' + String(personaActualMesNum);
		}

		for (var j = 0; j < me.resumenI.length; j++) { 
			let estadoMes = this.getSafe(() => me.resumenI[j][mes]);
            if (estadoMes != undefined) {
              arregloColumnaBar3.push(me.resumenI[j]['nombre']);
            }         	
        }

		for (var j = 0; j < me.resumenI.length; j++) {
			let estadoMes = this.getSafe(() => me.resumenI[j][mes]);
            if (estadoMes != undefined) {
              arregloDataBarG3.push(me.resumenI[j][mes]);
            }
		}
	        
		var data1 = { 
			labels: arregloColumnaBar3, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.colorSet, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarG3
			}]
		}; 

	  	var mesCatI = new Chart(ctx3, { type: tipos, data: data1, options: options	});
	}

	generarGraficoMesCatG(){
		var me = this;
 		var arregloColumnaBar3 = [] ;
		var arregloDataBarI3 = [] ;
		var arregloDataBarG3 = [] ;

 		var canvas3 = (<HTMLCanvasElement>document.getElementById('mesCatG'))
		var ctx3 = canvas3.getContext('2d');


		var tipos = 'pie';                         
		var options = { }; 

		let personaActualMesNum = this.persona[2];
		let mes = ''
		if (personaActualMesNum < 10) {
			mes = 'm0'+ String(personaActualMesNum);
		} else {
			mes = 'm' + String(personaActualMesNum);
		}

		for (var j = 0; j < me.resumenG.length; j++) { 
			let estadoMes = this.getSafe(() => me.resumenG[j][mes]);
            if (estadoMes != undefined) {
              arregloColumnaBar3.push(me.resumenG[j]['nombre']);
            }         	
        }

		for (var j = 0; j < me.resumenG.length; j++) {
			let estadoMes = this.getSafe(() => me.resumenG[j][mes]);
            if (estadoMes != undefined) {
              arregloDataBarG3.push(me.resumenG[j][mes]);
            }
		}
	        
		var data1 = { 
			labels: arregloColumnaBar3, 
			datasets: [{ 
				label: 'Ingresos', 
				backgroundColor: me.colorSet, 
				borderColor: me.color14, 
				borderWidth: 2, 
				hoverBackgroundColor: me.color14, 
				hoverBorderColor: me.color14, 
				data: arregloDataBarG3
			}]
		}; 

	  	var mesCatG = new Chart(ctx3, { type: tipos, data: data1, options: options	});
	}
}
