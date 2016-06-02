cordova-plugin-globalization (source: https://github.com/apache/cordova-plugin-globalization)


This plugin obtains information and performs operations specific to the user's locale, language, and timezone.
Note the difference between locale and language: locale controls how numbers, dates, and times are displayed for a region, 
while language determines what language text appears as, independently of locale settings. Often developers use locale to set both settings,
but there is no reason a user couldn't set her language to "English" but locale to "French", so that text is displayed in English but dates, times, etc.,
are displayed as they are in France. Unfortunately, most mobile platforms currently do not make a distinction between these settings.

Supported Platforms are:

    Amazon Fire OS
    Android
    BlackBerry 10
    Firefox OS
    iOS
    Windows Phone 8
    Windows
    Browser

via navigator.globalization.getPreferredLanguage you get the client's current language.
