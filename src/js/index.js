app.controller('index', function ($scope, $http) {

  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('./database1.sqlite3');

  //OBTENER LISTA
  $scope.getAll = function () {
    db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
      console.log(row.id + ": " + row.info);
      //  msg = "<p>Found rows: " + row.id + ": " + row.info + "</p>";
      //  document.querySelector('#status').innerHTML += msg;
      $scope.resultado = row.id + ": " + row.info;

    });
  };

var $scope.res = db.exec("SELECT * FROM lorem");



  //INIT        

  $scope.getAll();


db.close();

});
