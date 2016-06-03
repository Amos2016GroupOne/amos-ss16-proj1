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

