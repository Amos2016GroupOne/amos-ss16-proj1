angular.module('app', [])
    .factory("settings", [function () {
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
    }])