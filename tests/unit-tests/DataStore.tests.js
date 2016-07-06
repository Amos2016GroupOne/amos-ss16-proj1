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

  var dataStorage;

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
  }));

  it("Should store data", function()
  {
    dataStorage.storeData("testData", "value");

    expect(dataStorage.retrieveData("testData")[0]).toBe("value");
  });



});
