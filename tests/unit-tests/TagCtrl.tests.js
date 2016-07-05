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


describe('settings service:', function() {
var controller,
  LogMock,
  settingsMock,
  $scope;
  beforeEach(function () {
    // Unfortunately spying or mocking local storage does not work properly in all browsers.
    // So we do not mock it but clear it before every test.
    localStorage.clear();
  });

  var s;

  // Load the App Module as a mock.
  // This will also make all app intern services available per inject()
  beforeEach(module('app'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_, _dataStorage_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    dataStorage = _dataStorage_;
  }));

  beforeEach(inject(function($rootScope, $controller) {

    $scope = $rootScope.$new();
    $cordovaBluetoothLE = {};
    $cordovaBluetoothLE.encodedStringToBytes = function(obj) 
    {
      return obj;
    }
    controller = $controller('TagCtrl',{
      '$scope': $scope,
      '$cordovaBluetoothLE': $cordovaBluetoothLE
    });

  }));

  function almostEqual(a, b, eps)
  {
    if(Math.abs(a-b) < eps)
    {
      return true;
    }
    return false;
  }

  it('should store accelerometer data', function() {
      var value = 0.6;
      value = value * (32768/2);
      // Turn it into an integer
      value = value|0;
      var bytes = new Int8Array(18);
      // Write the int into the byte array
      for(i = 0; i < 9; i++)
      {
        bytes[i*2] = value & 0xff;
        bytes[i*2+1] = (value >> 8) & 0xff;
      }

       value = 0.6;

      var obj = { 
        value: bytes
      }

      var device = {
        address: "null"
      }

      $scope.currentDevice1 = device;


      $scope.onAccelerometerData(obj, device);
      // The value should be stored in the dataStorage and be almost equal to the value passed (limited precision can change the value slightly)
      expect(almostEqual(value, dataStorage.retrieveData("accelerometer-z")[0], 0.01)).toBeTruthy();

  });

   it('should store barometer data', function() {
      var value = 23.3;
      value = value * (100);
      // Turn it into an integer
      value = value|0;
      var bytes = new Int8Array(18);
      // Write the int into the byte array
      var i = 0;
      bytes[i*3] = value & 0xff;
      bytes[i*3+1] = (value >> 8) & 0xff;
      bytes[i*3+2] = (value >> 16) & 0xff;

      value /= 100;
      
      var value2 = 46.6;
      value2 *= 100;

      i = 1;
      bytes[i*3] = value2 & 0xff;
      bytes[i*3+1] = (value2 >> 8) & 0xff;
      bytes[i*3+2] = (value2 >> 16) & 0xff;
      value2 /=100;

      var obj = { 
        value: bytes
      }

      var device = {
        address: "null"
      }

      $scope.currentDevice1 = device;


      $scope.onBarometerData(obj, device);
      // The value should be stored in the dataStorage and be almost equal to the value passed (limited precision can change the value slightly)
      expect($scope.barometer.temperatureDev1).toBe(value + "°C");

      expect($scope.barometer.pressureDev1).toBe(value2 + "hPa");

  });



});
