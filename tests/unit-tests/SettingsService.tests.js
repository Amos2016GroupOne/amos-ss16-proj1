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

  beforeEach(function () {
    // Unfortunately spying or mocking local storage does not work properly in all browsers.
    // So we do not mock it but clear it before every test.
    localStorage.clear();
  });

  var s;

  // Load the App Module as a mock.
  // This will also make all app intern services available per inject()
  beforeEach(module('app'));

  // Disable template caching
  beforeEach(module(function($provide, $urlRouterProvider) {
    $provide.value('$ionicTemplateCache', function(){} );
    $urlRouterProvider.deferIntercept();
  }));


  // Get the real Settings service.
  beforeEach(inject(function(_settings_) {
    s = _settings_;
  }));

  it('should set and persist settings', function() {
    expect(s.getSetting('foo')).toBe(undefined);
    s.setSetting('foo',{bar:42});
    expect(JSON.stringify(s.getSetting('foo'))).toBe(JSON.stringify({bar:42}));
    expect(s.getSetting('volume')).toBe(50);
  });

  it('should set and persist settings even if local settings are deleted.', function() {
    //s.settings = {};  REM: does not delete it but links it to a new copy!
    // so delete it manually:
    deleteProperties(s.settings);
    s.settings.volume = 42;
    expect(s.getSetting('volume')).toBe(50);

    s.settings.volume = 42;
    s.persistSettings();
    deleteProperties(s.settings);
    expect(s.getSetting('volume')).toBe(42);
  });

  //it('should restore default settings when localStorage version is outdated', function() {

  //});

});
