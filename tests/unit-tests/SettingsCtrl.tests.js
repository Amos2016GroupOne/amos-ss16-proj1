var DBMeter = null;
describe('SettingsCtrl:', function() {
  var controller,
  LogMock,
  settingsMock,
  $scope;


  // Load the App Module as a mock.
  // This will also make all app intern services available per inject()
  beforeEach(module('app', function ($provide, $translateProvider) {

	  //use a custom Loader for angular-translate. Otherwise some test will fail with
	  //"Error: Unexpected request: GET en-us.json"
	  //why this has to be done is explained in detail here:
	  //https://angular-translate.github.io/docs/#/guide/22_unit-testing-with-angular-translate
      $translateProvider.translations('en-us', {
		"LANGUAGE": "language",
		"PROMPT_TURN_ON_BLUETOOTH": "BLE Remote would like to turn on Bluetooth"
	  });
	  $translateProvider.translations('de-de', {
	    "LANGUAGE": "Sprache",
		"PROMPT_TURN_ON_BLUETOOTH": "BLE Remote möchte Bluetooth aktivieren"
	  });

  }));

  // Disable template caching
  beforeEach(module(function($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function(){} );
    $urlRouterProvider.deferIntercept();
  }));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_,  _$timeout_, _$translate_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
	$timeout = _$timeout_;
	$translate = _$translate_;
  }));

  // Instantiate the Controller and Mocks
  // Using angular-mocks inject() for having all the providers ($...) available!
  beforeEach(inject(function($rootScope, $controller) {
    DBMeter = MockFactory.createNewDBMeterMock();

    settingsMock = MockFactory.createNewSettingsMock();
    LogMock = { };

    $scope = $rootScope.$new();
    controller = $controller('SettingsCtrl',{
      '$scope': $scope,
      // '$ionicPlatform':  - not specified, so it will take the original ionicPlatform
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

  // for easy decibel set:
  function setListenDecibel(val) {
    $scope.settings.isListeningDecibel = val;
    $scope.decibelToggle();
  }

  function setLanguage(lang) {
	$scope.settings.language = lang;
	$scope.changeLanguage();
  }

  describe('Translation', function(){
	
	it('should translate html expression to currently set language', function(){
	    setLanguage('en-us');
		// Compile a piece of HTML containing the translate filter
		var element = $compile("<div>{{ 'LANGUAGE' | translate }}</div>")($rootScope);
		// fire all the watches, so the scope expression {{ 'LANGUAGE' | translate }} will be evaluated
		$rootScope.$digest();
		// Check that the compiled element contains the templated content
		expect(element.html()).toContain("language");
		setLanguage('de-de');
		var element = $compile("<div>{{ 'LANGUAGE' | translate }}</div>")($rootScope);
		$rootScope.$digest();
		expect(element.html()).toContain("Sprache");
	});

	it('should translate notification text instantly to currently set language', function(){
		setLanguage('en-us');
		expect($translate.instant('PROMPT_TURN_ON_BLUETOOTH')).toBe('BLE Remote would like to turn on Bluetooth');
		setLanguage('de-de');
		expect($translate.instant('PROMPT_TURN_ON_BLUETOOTH')).toBe('BLE Remote möchte Bluetooth aktivieren');
	});

	it('should translate notifications text asynchronously to currently set language', function(){
		setLanguage('en-us');
		var translationString;
		$translate('PROMPT_TURN_ON_BLUETOOTH').then(function (translation) {
            translationString = translation;
		});
		$rootScope.$digest();
		expect(translationString).toBe('BLE Remote would like to turn on Bluetooth');
		setLanguage('de-de');
		$translate('PROMPT_TURN_ON_BLUETOOTH').then(function (translation) {
            translationString = translation;
		});
		$rootScope.$digest();
		expect(translationString).toBe('BLE Remote möchte Bluetooth aktivieren');
	});

  });

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

	it('should deselect volume profiles', function() {
		muteHelper(false);
		$scope.settings.currentVolumeProfile = JSON.stringify($scope.settings.volumeProfiles[1]);
		$scope.changeVolumeProfile();
		//when muting now no profile should be selected anymore
		muteHelper(true);
		for(var i = 0; i<$scope.settings.volumeProfiles.length; i++){
			JSON.stringify($scope.settings.volumeProfiles[1])
			expect($scope.settings.currentVolumeProfile).not.toBe(JSON.stringify($scope.settings.volumeProfiles[i]));
		}
	});

	it('should reselect volume profiles', function() {
		muteHelper(false);
		$scope.settings.currentVolumeProfile = JSON.stringify($scope.settings.volumeProfiles[1]);
		$scope.changeVolumeProfile();
		muteHelper(true);
		//when unmuting now the profile should be selected again
		muteHelper(false);
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

  describe('Decibel Measurement', function() {

    beforeEach(function() {
      jasmine.clock().install();
      setListenDecibel(true);
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('should start the measurements', function() {
      jasmine.clock().tick(101);  // wait a bit...
      expect($scope.decibel).toBeGreaterThan(0);
      expect(typeof $scope.decibel).toEqual('string');
    });

    it('should run the measurements', function() {
      var old = DBMeter.callCounter;
      jasmine.clock().tick(101);
      expect(DBMeter.callCounter).toBeGreaterThan(old);
    });

    it('should stop the measurements', function() {
      old = DBMeter.callCounter;
      setListenDecibel(false);
      jasmine.clock().tick(102);  // to ensure it has stopped it somehow...
      expect(DBMeter.callCounter).toEqual(old);
    });

  });

});
