angular.module('app.services', [])
    .factory("settings", [function () {

        // Parses values into real booleans
        function parseBool(val) { return val === true || val === "true" }

        // Function to query settings by name
        function getSetting(name) {
            var ret = localStorage.getItem(name);
            // Set Default-Value
            if (ret == null) {
                if (name == "reconnect")
                    ret = false;
                else if (name == "duration")
                    ret = 5;
                else if (name == "volume")
                    ret = 50;

                localStorage.setItem(name, ret);
            }
            // Reconnect needs to be stored as a boolean
            if (name == "reconnect")
                ret = parseBool(ret);
            else if (name == "volume")
                ret = parseInt(ret);

            return ret;
        }

        // Central settings object containing the settings. Its initialized by querying the settings
        var settings = {
            reconnect: getSetting("reconnect"),
            duration: getSetting("duration"),
            volume: getSetting("volume")
        };

        // Function to set settings into Localstorage
        function setSetting(name, value) {
            localStorage.setItem(name, value);
        }

        // Persist all settings
        function persistSettings() {
            setSetting("reconnect", settings.reconnect);
            setSetting("duration", settings.duration);
            setSetting("volume", settings.volume);
        }

        // Return this services interface
        return {
            getSetting: getSetting,
            setSetting: setSetting,
            persistSettings: persistSettings,
            settings: settings
        }

    }]);