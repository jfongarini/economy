import { Component, OnInit, ChangeDetectorRef } from '@angular/core';



(function() {
    var module = angular.module('app-configuracion');

    module.controller('ConfiguracionController', function($scope) {
            $scope.var1 = 'var1';
            $scope.lista = '';
            $scope.addCategoria = function() {
                $scope.var2 = 'var2';
                console.log($scope.var2);
                console.log($scope.lista);
            };
        }
    );
})();