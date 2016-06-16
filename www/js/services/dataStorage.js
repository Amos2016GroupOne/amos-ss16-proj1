/*
 * Projectname: amos-ss16-proj1
 *
 * Copyright (c) 2016 de.fau.cs.osr.amos2016.gruppe1
 *
 * This file is part of the AMOS Project 2016 @ FAU
 * (Friedrich-Alexander University Erlangen-Nürnberg)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 *
 */


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
