var app = angular.module("loginApp", []);
app.controller("loginCtrl", function($scope) {

    const ipc = require('electron').ipcRenderer;
    const electron = require('electron');
    let result = ipc.sendSync("getPersonaAll");
    var listPersonas = [];          
    $scope.listPersonas = result;               

    
});