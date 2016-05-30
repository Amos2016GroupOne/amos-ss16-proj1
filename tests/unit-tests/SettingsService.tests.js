function deleteProperties(obj) {
    for (p in obj) {
      delete obj[p];
    }
}

describe('settings service:', function() {

  beforeEach(function () {
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


  beforeEach(inject(function(_settings_) {
    s = _settings_;
  }));

            //getSetting: getSetting,
            //setSetting: setSetting,
            //persistSettings: persistSettings,
            //settings: settings
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

});
