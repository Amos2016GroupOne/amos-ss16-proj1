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
        cb();
      }
    };
  }
};



