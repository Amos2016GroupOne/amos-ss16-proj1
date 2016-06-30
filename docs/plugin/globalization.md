Globalization

Description:
This plugin obtains information and performs operations specific to the user's locale, language, and timezone. Note the difference between locale and language: locale controls how numbers, dates, and times are displayed for a region, while language determines what language text appears as, independently of locale settings.

Installation:
cordova plugin add cordova-plugin-globalization

How to use:
// Get it in your Controller
module.controller('MyCtrl', function($cordovaGlobalization) {
  $cordovaGlobalization.getPreferredLanguage().then(
    function(result) {
      // result
    },
    function(error) {
      // error
  });

  $cordovaGlobalization.getLocaleName().then(
    function(result) {
      // result
    },
    function(error) {
      // error
  });

.....

Why we chose it:
Part of ngCordova
