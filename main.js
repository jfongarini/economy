const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
// let child
var personaLogin = 1;
let knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, './db/', 'database.sqlite3')    
  } ,
  "useNullAsDefault": true,
  "debug": false
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 1000, height: 600, show: false, autoHideMenuBar: true, icon: __dirname + '/icons/icono2.ico', webPreferences:{
        nodeIntegration: true
      } })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './dist/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.once("ready-to-show", () => { mainWindow.show() })

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
  
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  //child = new BrowserWindow({parent: win,width:450,height:143,frame:false})
//   child = new BrowserWindow({parent: mainWindow, modal: true, show: false})
//     child.loadURL(url.format({
//         //pathname:path.join(__dirname,'./dist/login.html'),
//         pathname:path.join(__dirname,'./dist/login.html'),
//         protocol:'file',
//         slashes:true
//     }))

//     child.once('ready-to-show', () => {
//   child.show()
// })

//     child.openDevTools()

   
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }

})

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

//INTERACCION BASE DE DATOS

///////////////////////////////////////////

//-- Common

getPersonaAll();
inicio();

function inicio(){

  getPersona();
  getSaldo();
  getCategorias();
  getDiario();
  getTarjeta();
  getTarjetaConsumo();
  getInversiones();
  getInversionDiario();
  getDiarioCategoria();

}

///////////////////////////////////////////

//-- Main

ipcMain.on('loginok', (event, arg) => {
  
  personaLogin = arg;
  //mainWindow.once("ready-to-show", () => { mainWindow.show() })
  //child.close()
  //inicio();
  if (personaLogin != 1) {
    inicio();
    //mainWindow.reload()
  }
  //mainWindow.show()  
  
  })

function getPersonaAll() {
  //ipcMain.on("getPersona", function () {
  ipcMain.on("getPersonaAll", (event) => {
    let result = knex('Persona').where('VIGENTE', 0)
    result.then(function (rows) {
      //mainWindow.webContents.send("resultSentPersona", rows);
      event.returnValue = rows;
    })
  });
}



function getPersona() {
  //ipcMain.on("getPersona", function () {
  //console.log('--------------');
  //console.log(personaLogin);
  //console.log('--------------');
  ipcMain.on("getPersona", (event) => {
    let result = knex('Persona').where('ID', personaLogin)
    result.then(function (rows) {
      //mainWindow.webContents.send("resultSentPersona", rows);
      event.returnValue = rows;
    })
  });
}

ipcMain.on('updatePersona', (event, id, nombre, mes, anno, imagen) => {
  knex('Persona').where('ID', id).update({ NOMBRE: nombre, MES: mes, ANNO: anno, IMAGEN: imagen })
  .then( function (result) {
  })
});

function getSaldo() {
  ipcMain.on("getSaldo", (event, arg) => {
    let result = knex('Saldo').where('ID_PERSONA', arg)
    result.then(function (rows) {
      event.returnValue = rows;
    })
  });
}

ipcMain.on('updateSaldo', (event, id, saldo) => {
  knex('Saldo').where('ID', id).update({ SALDO: saldo })
  .then( function (result) {
  })
});

ipcMain.on('insertSaldo', (event, id, fecha, saldo) => {
  knex('Saldo').insert({ID_PERSONA: id, FECHA: fecha, SALDO: saldo})
  .then( function (result) {
  })
});
///////////////////////////////////////////

//-- Configuracion

function getCategorias() {

  ipcMain.on("getCategorias", (event, arg) => {
    let result = knex('Categoria').where('ID_PERSONA', arg)
    result.then(function (rows) {
  //mainWindow.webContents.send("resultSentCategorias", rows);
      event.returnValue = rows;
    })
  });

}

ipcMain.on('insertCategoriaGasto', (event, id, arg) => {
  knex('Categoria').insert({ID_PERSONA: id, NOMBRE: arg, GI: 'G', VIGENTE: 0})
  .then( function (result) {
  })
});

ipcMain.on('insertCategoriaIngreso', (event, id, arg) => {
  knex('Categoria').insert({ID_PERSONA: id, NOMBRE: arg, GI: 'I', VIGENTE: 0})
  .then( function (result) {
  })
});

ipcMain.on('deleteCategoria', (event, id, nombre) => {
  let nombreAux = '*' +nombre
  knex('Categoria').where('ID', id).update({NOMBRE: nombreAux, VIGENTE: 1})
  .then( function (result) {
  })
});

ipcMain.on('updateCategoria', (event, id, nombre) => {
  knex('Categoria').where('ID', id).update({NOMBRE: nombre})
  .then( function (result) {
  })
});

ipcMain.on('insertTarjeta', (event, id, arg) => {
  knex('Tarjeta').insert({ID_PERSONA: id, NOMBRE: arg, VIGENTE: 0})
  .then( function (result) {
  })
});

ipcMain.on('deleteTarjeta', (event, id, nombre) => {
  let nombreAux = '*' +nombre
  knex('Tarjeta').where('ID', id).update({NOMBRE: nombreAux, VIGENTE: 1})
  .then( function (result) {
  })
});

ipcMain.on('updateTarjeta', (event, id, nombre) => {
  knex('Tarjeta').where('ID', id).update({NOMBRE: nombre})
  .then( function (result) {
  })
});

ipcMain.on('insertInversion', (event, id, arg) => {
  knex('Inversion').insert({ID_PERSONA: id, NOMBRE: arg, VIGENTE: 0})
  .then( function (result) {
  })
});

ipcMain.on('deleteInversion', (event, id, nombre) => {
  let nombreAux = '*' +nombre
  knex('Inversion').where('ID', id).update({NOMBRE: nombreAux, VIGENTE: 1})
  .then( function (result) {
  })
});

ipcMain.on('updateInversion', (event, id, nombre) => {
  knex('Inversion').where('ID', id).update({NOMBRE: nombre})
  .then( function (result) {
  })
});

///////////////////////////////////////////

//-- Diario

function getDiario() {
  ipcMain.on("getDiario", (event, arg) => {
    let result = knex('Diario').where('ID_PERSONA', arg).orderBy('FECHA')
    result.then(function (rows) {
      //mainWindow.webContents.send("resultSentDiario", rows);
      event.returnValue = rows;
    })
  });

}

function getTarjeta() {
  ipcMain.on("getTarjeta", (event, arg) => {
    let result = knex('Tarjeta').where('ID_PERSONA', arg)
    result.then(function (rows) {
      event.returnValue = rows;
    })
    
  });
}

ipcMain.on("getUnDiario", (event, id) => {
  let result = knex('Diario').where('ID', id)
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnDiario", rows);
    event.returnValue = rows;
  })
});

ipcMain.on('insertDiario', (event, personaActualID, fecha, importe, grupo, detalle) => {
  knex('Diario').insert({ID_PERSONA: personaActualID, ID_CATEGORIA: grupo, FECHA: fecha, MONTO: importe, DETALLE: detalle})
  .then( function (result) {
  })
});

ipcMain.on('removeDiario', (event, arg) => {
  knex('Diario').where('ID', arg).del()
  .then( function (result) {
  })
});

ipcMain.on('updateDiario', (event, id, fecha, importe, grupo, detalle) => {
  knex('Diario').where('ID', id).update({ID_CATEGORIA: grupo, FECHA: fecha, MONTO: importe, DETALLE: detalle})
  .then( function (result) {
  })
});

ipcMain.on("searchDiarioGrupo", (event, arg, grupo) => {
  let result = knex('Diario').where('ID_PERSONA', arg).andWhere('ID_CATEGORIA', grupo)
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnDiario", rows);
    event.returnValue = rows;
  })
});

ipcMain.on("searchDiarioDetalle", (event, arg, detalle) => {
  let result = knex('Diario').where('ID_PERSONA', arg).andWhere('DETALLE', 'like', '%'+detalle+'%')
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnDiario", rows);
    event.returnValue = rows;
  })
});

ipcMain.on("searchDiarioGD", (event, arg, grupo, detalle) => {
  let result = knex('Diario').where('ID_PERSONA', arg).andWhere('ID_CATEGORIA', grupo).andWhere('DETALLE', 'like', '%'+detalle+'%')
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnDiario", rows);
    event.returnValue = rows;
  })
});

///////////////////////////////////////////

//-- Tarjeta

function getTarjeta() {
  ipcMain.on("getTarjeta", (event, arg) => {
    let result = knex('Tarjeta').where('ID_PERSONA', arg)
    result.then(function (rows) {
      event.returnValue = rows;
    })
    
  });
}

function getTarjetaConsumo() {
  ipcMain.on("getTarjetaConsumo", (event) => {
    let result = knex('TarjetaConsumo')
    result.then(function (rows) {
      event.returnValue = rows;
    })
  });
}

ipcMain.on("getUnTC", (event, id) => {
  let result = knex('TarjetaConsumo').where('ID', id)
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnTC", rows);
    event.returnValue = rows;
  })
});

ipcMain.on('insertTC', (event, tarjeta, nombre, importe, cantCuota, fCuota) => {
  knex('TarjetaConsumo').insert({ID_TARJETA: tarjeta, NOMBRE: nombre, MONTO: importe, CUOTAS: cantCuota, F_PRI_CUOTA: fCuota})
  .then( function (result) {
  })
});

ipcMain.on('removeTC', (event, arg) => {
  knex('TarjetaConsumo').where('ID', arg).del()
  .then( function (result) {
  })
});

ipcMain.on('updateTC', (event, id, tarjeta, nombre, importe, cantCuota, fCuota) => {
  knex('TarjetaConsumo').where('ID', id).update({ID_TARJETA: tarjeta, NOMBRE: nombre, MONTO: importe, CUOTAS: cantCuota, F_PRI_CUOTA: fCuota})
  .then( function (result) {
  })
});

///////////////////////////////////////////

//-- Inversiones

function getInversiones() {
  ipcMain.on("getInversiones", (event, arg) => {
    let result = knex('Inversion').where('ID_PERSONA', arg)
    result.then(function (rows) {
      event.returnValue = rows;
    })
    
  });
}

function getInversionDiario() {
  ipcMain.on("getInversionDiario", (event) => {
    let result = knex('InversionDiario')
    result.then(function (rows) {
      event.returnValue = rows;
    })
  });
}

ipcMain.on("getUnInversionDiario", (event, id) => {
  let result = knex('InversionDiario').where('ID', id)
  result.then(function (rows) {
    //mainWindow.webContents.send("resultSentUnInversionDiario", rows);
    event.returnValue = rows;
  })
});

ipcMain.on('insertInversionDiario', (event, inversion, monto, fecha, detalle, ganancia) => {
  knex('InversionDiario').insert({ID_INVERSION: inversion, MONTO: monto, FECHA: fecha, DETALLE: detalle, GANANCIA: ganancia, FINALIZADO: 0})
  .then( function (result) {
  })
});

ipcMain.on('removeInversionDiario', (event, arg) => {
  knex('InversionDiario').where('ID', arg).del()
  .then( function (result) {
  })
});

ipcMain.on('updateInversionDiario', (event, id, inversion, monto, fecha, detalle, ganancia) => {
  knex('InversionDiario').where('ID', id).update({ID_INVERSION: inversion, MONTO: monto, FECHA: fecha, DETALLE: detalle, GANANCIA: ganancia})
  .then( function (result) {
  })
});

ipcMain.on("getUnEstado", (event, id) => {
  let result = knex('InversionDiario').where('ID', id)
  result.then(function (rows) {
    event.returnValue = rows;
  })
});

ipcMain.on('setUnEstado', (event, id, finalizdo) => {
  knex('InversionDiario').where('ID', id).update({FINALIZADO: finalizdo})
  .then( function (result) {
  })
});
///////////////////////////////////////////



function getDiarioCategoria() {

  ipcMain.on("getDiarioCategoria", (event, id, categoria) => {
    let result = knex('Diario').where('ID_PERSONA', id).andWhere('ID_CATEGORIA', categoria)
    result.then(function (rows) {
      event.returnValue = rows;
    })
  });

}


///////////////////////////////////////////

//-- Login


ipcMain.on('removeLogin', (event, id, vigente) => {
  knex('Persona').where('ID', id).update({VIGENTE: 1})
  .then( function (result) {
  })
});

ipcMain.on('newUsuario', (event, nombre, mes, anno, imagen) => {
  knex('Persona').insert({NOMBRE: nombre, MES: mes, ANNO: anno, IMAGEN: imagen, VIGENTE: 0})
  .then( function (result) {
  })
});
///////////////////////////////////////////