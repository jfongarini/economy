var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./database1.sqlite3');
 
db.serialize(function() {
  //db.run("CREATE TABLE lorem (info TEXT)");
 
  //var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  //for (var i = 0; i < 10; i++) {
  //    stmt.run("Ipsum " + i);
  //}
  //stmt.finalize();
 
  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
    console.log(row.id + ": " + row.info);    
  //  msg = "<p>Found rows: " + row.id + ": " + row.info + "</p>";
  //  document.querySelector('#status').innerHTML += msg;
    resultado = row.id + ": " + row.info;

  });  
});
var res = db.exec("SELECT * FROM lorem");

module.exports = res;

db.close();
