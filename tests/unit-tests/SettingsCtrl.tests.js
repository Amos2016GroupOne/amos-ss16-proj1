describe('LoginController', function() {

  var controller,
      LogMock,
      settingsMock,  // Will be filled by a real settings service!
      $scope;

  // Load the App Module as a mock.
  // This will also make all app intern services available per inject()
  beforeEach(module('app'));

  // Instantiate the Controller and Mocks
  // Using angular-mocks inject() for having all the provieders ($...) available!
  beforeEach(inject(function($rootScope, $controller, settings) {
    LogMock = { };
    settingsMock = settings;


    $scope = $rootScope.$new();
    controller = $controller('SettingsCtrl',{
      $scope: $scope,
      Log: LogMock,
      settings: settings
    });

  }));

  describe('Volume', function() {

    it('should be set to 50 by default', inject(function(settings) {
      expect(settings.settings.volume).toBe(50);
    }));

  });
});
