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
