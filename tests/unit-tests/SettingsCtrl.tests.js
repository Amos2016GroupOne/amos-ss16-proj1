describe('SettingsCtrl:', function() {
  var controller,
  LogMock,
  settingsMock,
  $scope;

  // Load the App Module as a mock.
  // This will also make all app intern services available per inject()
  beforeEach(module('app'));

  // Disable template caching
  beforeEach(module(function($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function(){} );
    $urlRouterProvider.deferIntercept();
  }));


  // Instantiate the Controller and Mocks
  beforeEach(inject(function() {
    settingsMock = {
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

  }));

  // Using angular-mocks inject() for having all the provieders ($...) available!
  beforeEach(inject(function($rootScope, $controller) {
    LogMock = { };

    $scope = $rootScope.$new();
    controller = $controller('SettingsCtrl',{
      '$scope': $scope,
      'Log': LogMock,
      'settings': settingsMock
    });

  }));

  // for easy muting:
  function muteHelper(mute) {
    $scope.settings.mute = mute;
    $scope.muteToggle();
  }

  // for easy volume set:
  function setVolume(vol) {
    $scope.settings.volume = vol;
    $scope.changedVolume();
  }

  describe('Muting', function() {

    it('should set volume to 0', function() {
      muteHelper(true);
      expect($scope.settings.volume).toBe(0);
    });

    it('should restore volume profile', function() {
      $scope.settings.currentVolumeProfile = JSON.stringify($scope.settings.volumeProfiles[1]);
      $scope.changeVolumeProfile();
      var old = $scope.settings.volume;
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      muteHelper(false);
      expect($scope.settings.volume).toBe(old);
      expect($scope.settings.currentVolumeProfile).toBe(JSON.stringify($scope.settings.volumeProfiles[1]));
    });

    it('should unmute on volumeChange', function() {
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      setVolume(55);
      expect($scope.settings.mute).toBe(false);
    });

    it('should restore volume before on unmute', function() {
      setVolume(55);
      expect($scope.settings.volume).toBe(55);
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      muteHelper(false);
      expect($scope.settings.mute).toBe(false);
      expect($scope.settings.volume).toBe(55);
    });

  });

  describe('VolumeHardButtons', function() {

    it('should unmute', function(){
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      $scope.$emit('volumeupbutton');
      expect($scope.settings.mute).toBe(false);
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      $scope.$emit('volumedownbutton');
      expect($scope.settings.mute).toBe(false);
    });

    it('should change the volume in the right direction', function() {
      var old = $scope.settings.volume;
      $scope.$emit('volumeupbutton');
      expect($scope.settings.volume).toBeGreaterThan(old);
      old = $scope.settings.volume;
      $scope.$emit('volumedownbutton');
      expect($scope.settings.volume).toBeLessThan(old);
    });

    it('should be capped', function() {
      setVolume(0);
      $scope.$emit('volumedownbutton');
      expect($scope.settings.volume).toBe(0);

      setVolume(100);
      $scope.$emit('volumeupbutton');
      expect($scope.settings.volume).toBe(100);
    });

  });

});
