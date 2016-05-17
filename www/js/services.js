angular.module('app.services', [])
    .factory("settings", [function () {

        // Central settings object containing the settings. Its initialized by querying the settings
        var settings = {
           "reconnect": false,
           "duration": 5,
           "volume": 50,
           "volumeProfiles": [
             { name: "Standard Profile", volume: 50 }
           ],
           "currentVolumeProfile": ""
         };

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

    }]);
