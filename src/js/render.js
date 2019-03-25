const ipc = require('electron').ipcRenderer;
const electron = require('electron');

function enterApp(id) {
        ipc.sendSync('loginok', id)
    }