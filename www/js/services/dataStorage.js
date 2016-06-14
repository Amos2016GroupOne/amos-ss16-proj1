angular.module('app.services')
.factory("dataStorage", [ function($cordovaSQLite) {
    //TODO Use LokiDB with LokiCordovaFSAdapter
    var dataStorage = {};

    var db = null;

    function initDB()
    {
        db = $cordovaSQLite.openDB("my.db");
        $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS graph (id integer primary key, time text, x integer, y integer, z integer)");
    }

    function initDataStorage()
    {
        if(dataStorage["accelerometer-x"] === undefined)
            dataStorage["accelerometer-x"] = [];
        if(dataStorage["accelerometer-y"] === undefined)
            dataStorage["accelerometer-y"] = [];
        if(dataStorage["accelerometer-z"] === undefined)
            dataStorage["accelerometer-z"] = [];
        if(dataStorage["accelerometer-time"] === undefined)
            dataStorage["accelerometer-time"] = [];

        var query = "SELECT time, x, y, z FROM tblTodoLists ORDER BY id ASC";
        $cordovaSQLite.execute(db, query).then(function(res) {
            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    dataStorage["accelerometer-x"].push(res.rows.item(i).x);
                    dataStorage["accelerometer-y"].push(res.rows.item(i).y);
                    dataStorage["accelerometer-z"].push(res.rows.item(i).z);
                    dataStorage["accelerometer-time"].push(res.rows.item(i).time);
                }
            }
        }, function (err) {
            console.error(err);
        });
    }

    // This function stores data in the database.
    // The current implementation is just a stub
    function storeData(type, data)
    {
        if(dataStorage[type] === undefined)
        {
            dataStorage[type] = [];
        }
        dataStorage[type].push(data);
    }

    function storeData_graph(time, x, y, z)
    {
        if(db == null)
        {
            initDB();
            initDataStorage();
        }

        dataStorage["accelerometer-x"].push(x);
        dataStorage["accelerometer-y"].push(y);
        dataStorage["accelerometer-z"].push(z);
        dataStorage["accelerometer-time"].push(time);

        // Save data persistent
        var query = "INSERT INTO graph (time, x, y, z) VALUES (?,?,?,?)";
        $cordovaSQLite.execute(db, query, [time, x, y, z]).then(function(res) {
            console.log("INSERT ID -> " + res.insertId);
        }, function (err) {
            console.error(err);
        });
    }

    function swapData(time, x, y, z)
    {
        dataStorage["accelerometer-x"] = x;
        dataStorage["accelerometer-y"] = y;
        dataStorage["accelerometer-z"] = z;
        dataStorage["accelerometer-time"] = time;
    }


    function retrieveData(type)
    {
        if(dataStorage[type] == undefined)
        {
            dataStorage[type] = [];
        }
        return dataStorage[type];
    }

    return {
        storeData_graph: storeData_graph,
        storeData: storeData,
        retrieveData: retrieveData,
        swapData : swapData
    }
}]);
