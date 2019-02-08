const electron = require('electron')
const ipcRenderer = electron.ipcRenderer
var app = angular.module('economia', []);

app.controller('configuracion', function($scope) {


  $scope.alert = function(){
  console.log(1234);
  };
});