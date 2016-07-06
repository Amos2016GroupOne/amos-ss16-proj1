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
	$provide.factory('customLoader', function ($q) {
		return function () {
			var deferred = $q.defer();
			deferred.resolve({});
			return deferred.promise;
		};
	});

	$translateProvider.useLoader('customLoader');

	$translateProvider.translations('en-us', {
		"LANGUAGE": "language",
		"PROMPT_TURN_ON_BLUETOOTH": "BLEaring would like to turn on Bluetooth",
		"ONLY_AVAIL_IN_EN_US": "this translation is only available in en-us"
	});
	$translateProvider.translations('de-de', {
		"LANGUAGE": "Sprache",
		"PROMPT_TURN_ON_BLUETOOTH": "BLEaring möchte Bluetooth aktivieren"
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
      //'settings': settingsMock
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

  function setScanDuration(index) {
    $scope.durationSlider.selectedIndex = index;
    $scope.scanDurationChanged();
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
		expect($translate.instant('PROMPT_TURN_ON_BLUETOOTH')).toBe('BLEaring would like to turn on Bluetooth');
		setLanguage('de-de');
		expect($translate.instant('PROMPT_TURN_ON_BLUETOOTH')).toBe('BLEaring möchte Bluetooth aktivieren');
	});

	it('should translate notifications text asynchronously to currently set language', function(){
		setLanguage('en-us');
		var translationString;
		$translate('PROMPT_TURN_ON_BLUETOOTH').then(function (translation) {
            translationString = translation;
		});
		$rootScope.$digest();
		expect(translationString).toBe('BLEaring would like to turn on Bluetooth');
		setLanguage('de-de');
		$translate('PROMPT_TURN_ON_BLUETOOTH').then(function (translation) {
            translationString = translation;
		});
		$rootScope.$digest();
		expect(translationString).toBe('BLEaring möchte Bluetooth aktivieren');
	});

	it('should translate to english if the translation id is not found', function(){
		setLanguage('de-de');
		$translate.fallbackLanguage('en-us');
		expect($translate.instant('ONLY_AVAIL_IN_EN_US')).toBe('this translation is only available in en-us');
	});

	it('should change floating direction to right if changing language to ar-sy', function(){
	    setLanguage('de-de');
	    setLanguage('ar-sy');
	    expect($rootScope.default_float).toBe('right');
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
      $timeout.flush();
      expect($scope.settings.mute).toBe(false);
      muteHelper(true);
      expect($scope.settings.mute).toBe(true);
      $scope.$emit('volumedownbutton');
      $timeout.flush();
      expect($scope.settings.mute).toBe(false);
    });

    it('should change the volume in the right direction', function() {
      var old = $scope.settings.volume;
      $scope.$emit('volumeupbutton');
      $timeout.flush();
      expect($scope.settings.volume).toBeGreaterThan(old);
      old = $scope.settings.volume;
      $scope.$emit('volumedownbutton');
      $timeout.flush();
      expect($scope.settings.volume).toBeLessThan(old);
    });

    it('should be capped', function() {
      setVolume(0);
      $scope.$emit('volumedownbutton');
      $timeout.flush();
      expect($scope.settings.volume).toBe(0);

      setVolume(100);
      $scope.$emit('volumeupbutton');
      $timeout.flush();
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
      $timeout.flush();
      expect($scope.decibel).toBeGreaterThan(0);
      expect(typeof $scope.decibel).toEqual('string');
    });

    it('should run the measurements', function() {
      var old = DBMeter.callCounter;
      jasmine.clock().tick(101);
      $timeout.flush();
      expect(DBMeter.callCounter).toBeGreaterThan(old);
    });

    it('should stop the measurements', function() {
      old = DBMeter.callCounter;
      setListenDecibel(false);
      jasmine.clock().tick(102);  // to ensure it has stopped it somehow...
      $timeout.flush();
      expect(DBMeter.callCounter).toEqual(old);
    });

  });

  describe('Scan Duration', function() {

      it('should set the right scan duration value according to the index of the slider', function(){
          var index = 0;
          setScanDuration(index);
          expect($scope.settings.duration).toBe(1);
          var index = 12;
          setScanDuration(index);
          expect($scope.settings.duration).toBe(60);
          var index = 4;
          setScanDuration(index);
          expect($scope.settings.duration).toBe(20);
      });

      it('should set the right index according to scan duration value the slider shows on app start', function(){
          $scope.settings.duration = 1;
          $scope.durationSlider.selectedIndex = $scope.durationSlider.getInitialIndex();
          expect($scope.durationSlider.selectedIndex).toBe(0);
          $scope.settings.duration = 20;
          $scope.durationSlider.selectedIndex = $scope.durationSlider.getInitialIndex();
          expect($scope.durationSlider.selectedIndex).toBe(4);
          $scope.settings.duration = 60;
          $scope.durationSlider.selectedIndex = $scope.durationSlider.getInitialIndex();
          expect($scope.durationSlider.selectedIndex).toBe(12);
      });

  });

});
