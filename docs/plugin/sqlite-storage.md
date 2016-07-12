SQLite-Storage

Source: https://github.com/brodysoft/Cordova-SQLitePlugin.git

Install the Plugin:
cordova plugin add https://github.com/litehelpers/Cordova-sqlite-storage.git

Include it in your Controller:
.controller('TagCtrl', function($scope, $cordovaSQLite)


Angular Issue:
It was not possible to use a native cordova Plugin within a service.
So you cannot provide the openDB, createDB, queryDB methods in a service.
We used rootScope for a workaround.

iOS Issue:
We need to specify a location where to store the data, but only in IOS.
  Why?
  From A User´s iCloud Storage is Limited:
    DO store the following in iCloud:
        [other items omitted]
        Change log files for a SQLite database (a SQLite database’s store file must never be stored in iCloud)
    DO NOT store the following in iCloud:
        [items omitted]

  So:
    Use the location or iosDatabaseLocation option in sqlitePlugin.openDatabase() to store the database in a subdirectory that is NOT backed up to iCloud

  Options to choose:
    default: Library/LocalDatabase subdirectory - NOT visible to iTunes and NOT backed up by iCloud
    Library: Library subdirectory - backed up by iCloud, NOT visible to iTunes
    Documents: Documents subdirectory - visible to iTunes and backed up by iCloud

Browser Issue:
If you use firefox you get the error "openDatabase is not defined". That is because you are trying to open a SQL storage but firefox has no such feature
and has no plans to implement it. The easiest fix is to just use chromium. This is was defined in our project with "ionic serve -f chromium-browser", 
which specifies that everytime you run "ionic serve" it is run in chromium.


Example Usage:
 
 // Open/Create a Database called my.db
 // You need to specify a iosDatabaseLocation
 var db = $cordovaSQLite.openDB({name: "my.db", iosDatabaseLocation: 'default'});

  $scope.execute = function() {
    var query = "INSERT INTO test_table (data, data_num) VALUES (?,?)";
    $cordovaSQLite.execute(db, query, ["test", 100]).then(function(res) {
      console.log("insertId: " + res.insertId);
    }, function (err) {
      console.error(err);
    });
  };


What did we change:
nothing

Why we chose it:
Included in ngCordova.
But, we first tried to use http://lokijs.org/#/ with an adapter for persistent storage.
Advantage: Have a fast in-memory-database for use.
Adapter: Have a wide range of choices how you want to store the data persistent.
Problem was: It did not run with our project setup. Even the default example threw errors.
But it is worth a look!

