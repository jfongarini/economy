const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, './db/', 'database1.sqlite3')    
  } ,
  "useNullAsDefault": true,
  "debug": false
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600, show: false, webPreferences:{
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
  mainWindow.webContents.openDevTools()
  
  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
   
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

//-- Main

function createMonthWindow() {
  // Create the browser window.
  monthWindow = new BrowserWindow({ width: 200, height: 300, show: false, webPreferences:{
        nodeIntegration: true
      } })

  // and load the index.html of the app.
  monthWindow.loadURL(url.format({
    pathname: path.join(__dirname, './src/app/monthWindow.html'),
    protocol: 'file:',
    slashes: true
  }))
   
}

///////////////////////////////////////////

//-- Common

//Separar fecha
function getDay() {}

function getMonth() {}

function getYear() {}

///////////////////////////////////////////

//-- Configuracion

function getCategorias() {

  ipcMain.on("getCategorias", function () {
    let result = knex('Categoria').where('ID_PERSONA', 1)
    result.then(function (rows) {
      mainWindow.webContents.send("resultSent", rows);
    })
  });

}

getCategorias();

ipcMain.on('insertCategoriaGasto', (event, arg) => {
  knex('Categoria').insert({ID_PERSONA: 1, NOMBRE: arg, GI: 'G'})
  .then( function (result) {
  })
});

ipcMain.on('insertCategoriaIngreso', (event, arg) => {
  knex('Categoria').insert({ID_PERSONA: 1, NOMBRE: arg, GI: 'I'})
  .then( function (result) {
  })
});

ipcMain.on('deleteCategoria', (event, arg) => {
  knex('Categoria').where('ID', arg).del()
  .then( function (result) {
  })
});

///////////////////////////////////////////

//-- Diario

function getDiario() {

  ipcMain.on("getDiario", function () {
    let result = knex('Diario').where('ID_PERSONA', 1)
    result.then(function (rows) {
      mainWindow.webContents.send("resultSent", rows);
    })
  });

}

getDiario();

ipcMain.on('insertDiarioGasto', (event, arg) => {
  knex('Diario').insert({ID_PERSONA: 1, NOMBRE: arg, GI: 'G'})
  .then( function (result) {
  })
});

ipcMain.on('insertDiarioIngreso', (event, arg) => {
  knex('Diario').insert({ID_PERSONA: 1, NOMBRE: arg, GI: 'I'})
  .then( function (result) {
  })
});

ipcMain.on('deleteDiario', (event, arg) => {
  knex('Diario').where('ID', arg).del()
  .then( function (result) {
  })
});

ipcMain.on('updateDiario', (event, arg) => {
  knex('Diario').where('ID', arg).del()
  .then( function (result) {
  })
});

///////////////////////////////////////////