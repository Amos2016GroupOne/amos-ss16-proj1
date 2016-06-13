The app now uses the __[cordova-plugin-globalization](https://github.com/apache/cordova-plugin-globalization/)__ plugin:

- obtains information and performs operations specific to the user's locale, language, and timezone
- via navigator.globalization.getPreferredLanguage you get the clients currently set language 
- via navigator.globalization.getLocaleName you get the clients currently set locale
	(locale controls how numbers, dates, and times are displayed for a region)
- android only has an option for language, which also sets locale, but you can set them independently on some other platforms

The actual translation is done via the new AngularJS module __[angular-translate](http://angular-translate.github.io/)__:

- Components (filters/directives) to translate your contents
- Asynchronous loading of i18n data
- Pluralization support using __[MessageFormat.js](https://github.com/SlexAxton/messageformat.js/)__
- Expandability through easy to use interfaces
- very good documentation
- definition of namespaces
- also offers support for Right-to-Left Languages, with non latin letters like arabic (see eg. __[here](https://www.sitepoint.com/multilingual-support-for-angularjs/)__)

The setup is very easy. After including the module, you write this:

    app.config(['$translateProvider', function ($translateProvider) {
      $translateProvider.translations('ar', {
        'TITLE': 'مرحبا',
      });
     
      $translateProvider.translations('de', {
        'TITLE': 'Hallo',
      });
     
      $translateProvider.preferredLanguage('en');
    }]);

And then in your html you use the key and let angular know that you want this translated:

	<h1>{{ 'TITLE' | translate }}</h1>

using translation in your controller works the following way. 

  $translate(['HEADLINE', 'PARAGRAPH']).then(function (translations) {
    $scope.headline = translations.HEADLINE;
    $scope.paragraph = translations.PARAGRAPH;
  });

$translate service behaves asynchronous and returns a promise, since it could be that there's some asynchronous loading going on.
This means that there are translation tables loaded in the background. These might be in a local json file or a file on a server.

When you need the translation instantly you can also call $translate.instant('HEADLINE').
This returns a translation instantly from the internal state of loaded translation.

$translate service should not be used to often because you don't want to bind your apps controllers and services too hard to your translated content.
It is important to know that translations translated through a directive $translate call, don't get updated when changing the language at runtime.

You can fix that by simply wrapping your $translate call into a $translateChangeSuccess callback on $rootScope. For example:

	app.controller('Ctrl', ['$scope', '$translate', '$rootScope', function ($scope, $translate, $rootScope) {
	  $rootScope.$on('$translateChangeSuccess', function () {
		$translate('HEADLINE').then(function (translation) {
		  $scope.headline = translation;
		});
	  });
	}]);

