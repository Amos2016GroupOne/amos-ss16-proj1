angular.module('app.services', [])
    .factory("settings", [function () {
        // Central settings object containing the settings. Its initialized by querying the settings

        // If settings found in local storage have a version smaller
        // minCompatibleSettingsVersion they will be cleared.
        // REMEMBER: increase minCompatibleSettingsversion and settings-version in the
        // settings-Object if you change the settings object!
        var minCompatibleSettingsVersion = 6;
        var settings = {
          "settings-version": 6,
           "reconnect": false,
           "duration": 5,
           "volume": 50,
           "volumeProfiles": [
             { name: "HOME",    volume: 40 },
             { name: "OFFICE",  volume: 70 },
             { name: "OUTDOOR", volume: 90 }
           ],
           "currentVolumeProfile": false,
           "mute": false,
           "volBeforeMute": 50,
		   "volProfileBeforeMute": false,
           "isListeningDecibel": true,
		   "language": "system",
		   "locale": "en-us"
         };

        var storedSettingsVersion = angular.fromJson(localStorage.getItem("settings-version"))
        if (storedSettingsVersion == null || storedSettingsVersion < minCompatibleSettingsVersion) {
          localStorage.clear();
          console.log("Settings stored are incompatible with the current app version and",
              "were therefore deleted.");
        }
        // Function to set settings into Localstorage
        function setSetting(name, value) {
          // Save to local storage as stringified objects. so parsing of e.g. boolean is
          // much easier.
          // Use angular.toJson as angular overrides JSON.stringify to automatically
          // include hash properties. We do not want this.
          localStorage.setItem(name, angular.toJson(value));
        }

        // Function to query settings by name
        // TODO: Use settings setter to persist directly on set from view!?!
        // See https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Functions/set
        function getSetting(name) {
            var ret = localStorage.getItem(name);
            // Set Default-Value
            try {
              if (ret == null) {
                throw("wrong setting");
              } else {
                ret = angular.fromJson(ret);
              }
            } catch (err) {
              // Catches wrong settings and parse Errors.
              console.log("could not get setting " + name + " from local storage!");
              ret = settings[name];
              setSetting(name, ret);
            }

            return ret;
        }

        // Initialize settings!
        //settings.getOwnPropertyNames().forEach((item) => {
        for (item in settings) {
          settings[item] = getSetting(item);
        }

        // Persist all settings
        function persistSettings() {
          //settings.getOwnPropertyNames().forEach((item) => {
          for (item in settings) {
            setSetting(item, settings[item]);
          }
        }

        // Return this services interface
        return {
            getSetting: getSetting,
            setSetting: setSetting,
            persistSettings: persistSettings,
            settings: settings
        };

    }])
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
