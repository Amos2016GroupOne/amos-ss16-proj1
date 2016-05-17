angular.module('app.services', [])
    .factory("settings", [function () {

        var settings = {
            reconnect: getSetting("reconnect"),
            duration: getSetting("duration")
        };

        function parseBool(val) { return val === true || val === "true" }

        // Redundant - should access tabCtrl.getSetting
        function getSetting(name) {
            var ret = localStorage.getItem(name);
            // Setze Default-Wert
            if (ret == null) {
                if (name == "reconnect")
                    ret = false;
                else if (name == "duration")
                    ret = 5;

                localStorage.setItem(name, ret);
            }
            if (name == "reconnect")
                ret = parseBool(ret);

            return ret;
        }

        function setSetting(name, value) {
            localStorage.setItem(name, value);
        }


        function persistSettings() {
            setSetting("reconnect", settings.reconnect);
            setSetting("duration", settings.duration);

        }



        return {
            getSetting: getSetting,
            setSetting: setSetting,
            persistSettings: persistSettings,
            settings: settings
        }

    }]);