angular.module('app.services', [])
    .factory("settings", [function () {
        // Central settings object containing the settings. Its initialized by querying the settings

        // if settings found in local storage have a version smaller
        // minCompatibleSettingsVersion they will be cleared.
        // REMEMBER: increase minCompatibleSettingsversion and settings-version in the
        // settings-Object if you change the settings object!
        var minCompatibleSettingsVersion = 2;
        var settings = {
          "settings-version": 2,
           "reconnect": false,
           "duration": 5,
           "volume": 50,
           "volumeProfiles": [
             { name: "Home",    volume: 40 },
             { name: "Office",  volume: 70 },
             { name: "Outdoor", volume: 90 }
           ],
           "currentVolumeProfile": false,
           "mute": false,
           "volBeforeMute": 50
        };

        var storedSettingsVersion = JSON.parse(localStorage.getItem("settings-version"))
        if (storedSettingsVersion == null || storedSettingsVersion < minCompatibleSettingsVersion) {
          localStorage.clear();
          console.log("Settings stored are incompatible with the current app version and",
              "were therefore deleted.");
        }
        // Function to set settings into Localstorage
        function setSetting(name, value) {
          // Save to local storage as stringified objects. so parsing of e.g. boolean is
          // much easier
          localStorage.setItem(name, JSON.stringify(value));
        }

        // Function to query settings by name
        // TODO: Use settings setter to persist directly on set from view!?!
        // see https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Functions/set
        function getSetting(name) {
            var ret = localStorage.getItem(name);
            // Set Default-Value
            try {
              if (ret == null) {
                throw("wrong setting");
              } else {
                ret = JSON.parse(ret);
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
   .factory("dataStorage", ['$q', 'Loki', function($q, Loki) {
		var _db;
		var _time;
		var _xaxis;
		var _yaxis;
		var _zaxis;
		var _tupel;
	
		// Initialize Database with autosave on. Loki is smart enough to just save something if anything has changed.
		// we should use the graph-measure-interval to save data. maybe 1sec is too fast, maybe too slow.
		function initDB() {
			var adapter = new LokiCordovaFSAdapter({"prefix": "loki"});  
			_db = new Loki('GraphHistoryDB',
					{
						autosave: true,
						autosaveInterval: 1000, // 1 second
						adapter: adapter
					});
					
			// Load collection. If collection does not exist, add it
			// Better: Only 1 collection with tupels					
			_time = _db.getCollection('accelerometer-time');
			if (!_time) {
				_time = _db.addCollection('accelerometer-time');
			}			
			_xaxis = _db.getCollection('accelerometer-x');
			if (!_xaxis) {
				_xaxis = _db.addCollection('accelerometer-x');
			}
			_yaxis = _db.getCollection('accelerometer-y');
			if (!_yaxis) {
				_yaxis = _db.addCollection('accelerometer-y');
			}
			_zaxis = _db.getCollection('accelerometer-z');
			if (!_zaxis) {
				_zaxis = _db.addCollection('accelerometer-z');
			}
		};
		
		function storeData(type, data)		// This fits to the usage of storeData in the controller. We just add a single date to the database
		{
			// Dirty fix to avoid database access without initialized data
			// Better: initialize before you use it
			//		   But you need to do it in device-Read/plattform-readyState
			//		   But the Adapter needs cordova in plattform-ready which is not availalbe in plattform-ready
			//		   Dirty fix: https://github.com/driftyco/ionic-view-issues/issues/52#issuecomment-99250866
			if(_db == null)
				initDB();
			
			if(type === "accelerometer-time")
				_time.insert({time:"12"});
			if(type === "accelerometer-x")
				_xaxis.insert(data);
			if(type === "accelerometer-y")
				_yaxis.insert(data);
			if(type === "accelerometer-z")
				_zaxis.insert(data);
		}
		
		function storeData_BETTER(type, data)	// This is a improved version of store Data. We should store the data as a tuple (time, x, y, z)
		{										// Get the data as a object with: data.time, data.x, data.y, data.z
			if(_db == null)
				initDB();
			
			_tupel.insert(data);
		}
		
		// this fits to the retrieveData(type) of the graph-controller. you get the complete data of one datatype. we should prefere to use the better way (see below)
		function retrieveData(type) {

			if(_db == null)
				initDB();
		
			return $q(function (resolve, reject) {
				
				var options = {};	// Here you can specifiy how you want the data back. Maybe you have a date and dont want it as string but as date-object. you can specify this here
				
				_db.loadDatabase(options, function () {
					var ret;
					
					if(type === "accelerometer-time")
					{
						ret = _time;
					}
					if(type === "accelerometer-x")
					{
						ret = _xaxis;
					}
					if(type === "accelerometer-y")
					{
						ret = _yaxis;
					}
					if(type === "accelerometer-z")
					{
						ret = _zaxis;
					}
					resolve(ret.data);
				});
			});
		};
		
		// Retrieve complete object in form of a json-object
		function retrieveData_BETTER() {

			if(_db == null)
				initDB();
			
			return $q(function (resolve, reject) {
				
				_db.loadDatabase(options, function () {
					
					_tupel = _db.getCollection('accelerometer-time');

					if (!_tupel) {
						_tupel = _db.addCollection('accelerometer-time');
					}
					
					resolve(_tupel.data);
				});
			});
		};

		return {
			storeData: storeData,
			retrieveData: retrieveData
		}
    }]);
