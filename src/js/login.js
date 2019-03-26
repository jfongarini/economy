var app = angular.module("loginApp", []);
app.controller("loginCtrl", function($scope) {

    const ipc = require('electron').ipcRenderer;
    const electron = require('electron');
    let result = ipc.sendSync("getPersonaAll");
    var listPersonas = [];          
    //$scope.primerLetra = result.NOMBRE.charAt(0);
    //result.primerLetra = $scope.primerLetra;    
    for (var i = 0; i < result.length; i++) {
    	result[i].primerLetra = result[i].NOMBRE.charAt(0);
    }               
    $scope.listPersonas = result;
    
});