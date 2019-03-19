const ipc = require('electron').ipcRenderer;
const electron = require('electron');

function closeInsertDiario(id) {
        ipc.sendSync('loginok', id)
    }