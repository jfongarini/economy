const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const { remote } = require('electron');
const mainProcess = remote.require('../../dist/main.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, './db/', 'database1.sqlite3')    
  }  
});

function getNombreCategoria2() {
console.log(2);
  ipcRenderer.send("mainWindowLoaded", function () {
    let result = knex.select("NOMBRE").from("Categoria")
    console.log(3);
    console.log(this.result);
    result.then(function (rows) {
      mainWindow.webContents.send("resultSent", rows);
    })
  });
}

console.log(1);
mainProcess.getNombreCategoria3();
console.log(4);