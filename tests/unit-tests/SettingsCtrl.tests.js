describe('SettingsCtrl:', function() {
  localStorage.clear();

  var controller,
  LogMock,
  settingsMock,  // Will be filled by a real settings service!
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
  // Using angular-mocks inject() for having all the provieders ($...) available!
  beforeEach(inject(function($rootScope, $controller, settings) {
    LogMock = { };
    settingsMock = settings;

    $scope = $rootScope.$new();
    controller = $controller('SettingsCtrl',{
      '$scope': $scope,
      'Log': LogMock,
      'settings': settingsMock
    });


  }));

  describe('Volume', function() {
    it('should be set to 50 by default', inject(function() {
      // as $scope is a private member of settings, we cannot access it via the controller variable
      expect($scope.settings.volume).toBe(50);
    }));
  });

  describe('VolumeProfile', function() {
    it('changes to home, volume should be set to 40.', inject(function() {
      expect($scope.settings.currentVolumeProfile).toBe(false);

      $scope.settings.currentVolumeProfile = JSON.stringify($scope.settings.volumeProfiles[0]);
      $scope.changeVolumeProfile();

      expect($scope.settings.volume).toBe(40);
    }));
  });

  describe('Muting', function() {
    it('should set volume to 0', function() {
      $scope.settings.mute = true;
      $scope.muteToggle();
      expect($scope.settings.volume).toBe(0);
    });

    it('should restore volume profile', function() {
      $scope.settings.currentVolumeProfile = JSON.stringify($scope.settings.volumeProfiles[1]);
      $scope.changeVolumeProfile();
      $scope.settings.mute = true;
      $scope.muteToggle();
      $scope.settings.mute = false;
      $scope.muteToggle();
      expect($scope.settings.volume).toBe(70);
      expect($scope.settings.currentVolumeProfile).toBe(JSON.stringify($scope.settings.volumeProfiles[1]));
    });

    it('should unmute on volumeChange', function() {
      $scope.settings.mute = true;
      $scope.muteToggle();
      expect($scope.settings.mute).toBe(true);
      $scope.settings.volume = 55;
      $scope.changedVolume();
      expect($scope.settings.mute).toBe(false);
    });

    it('should restore volume before on unmute', function() {
      $scope.settings.volume = 55;
      $scope.changedVolume();
      expect($scope.settings.volume).toBe(55);
      $scope.settings.mute = true;
      $scope.muteToggle();
      expect($scope.settings.mute).toBe(true);
      $scope.settings.mute = false;
      $scope.muteToggle();
      expect($scope.settings.mute).toBe(false);
      expect($scope.settings.volume).toBe(55);
    });

  });

  describe('VolumeHardButtons', function() {
    it('should change the volume in the right direction', function() {
      var old = $scope.settings.volume;
      $scope.$emit('volumeupbutton');
      expect($scope.settings.volume).toBeGreaterThan(old);
      old = $scope.settings.volume;
      $scope.$emit('volumedownbutton');
      expect($scope.settings.volume).toBeLessThan(old);
    });

    it('should be capped', function() {
      $scope.settings.volume = 0;
      $scope.changedVolume();
      $scope.$emit('volumedownbutton');
      expect($scope.settings.volume).toBe(0);

      $scope.settings.volume = 100;
      $scope.changedVolume();
      $scope.$emit('volumeupbutton');
      expect($scope.settings.volume).toBe(100);
    });
  });

});
