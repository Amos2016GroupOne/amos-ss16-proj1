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


// Helperfunctions and useful mock object definitions

function deleteProperties(obj) {
    for (p in obj) {
      delete obj[p];
    }
}

var MockFactory = {
  createNewSettingsMock: function() {
    return {
      getSetting: function(s){
        return this.settings[s];
      },
      setSetting: function(s, val){
        this.settings[s] = val;
      },
      persistSettings: function(){
      },
      settings: {
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
      }
    };
  },
  createNewDBMeterMock: function() {
    return {
      intervalID: -1,
      callCounter: 0,
      start: function(cb) {
        console.log("setting interval");
        var that = this;
        this.intervalID = setInterval(function(dB) {
          that.callCounter++;
          cb(dB);
        }, 100, Math.random()*99+1);
      },
      stop: function(cb) {
        console.log("unsetting interval");
        clearInterval(this.intervalID);
        this.intervalID = -1;
        cb();
      },
      isListening: function(cb) {
        cb(this.intervalID != -1);
      }
    };
  }
};



