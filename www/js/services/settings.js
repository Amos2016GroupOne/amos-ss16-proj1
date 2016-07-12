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
.factory("settings", [function () {
    // Central settings object containing the settings. Its initialized by querying the settings

    // If settings found in local storage have a version smaller
    // minCompatibleSettingsVersion they will be cleared.
    // REMEMBER: increase minCompatibleSettingsversion and settings-version in the
    // settings-Object if you change the settings object!
    var minCompatibleSettingsVersion = 8;
    var settings = {
        "settings-version": 8,
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
        "language": "system",   //initial setting is "system" so the app will choose the system language in app.js
        "locale": "en-us",
        "start-with-tour": true
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
        settings[name] = value;
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
