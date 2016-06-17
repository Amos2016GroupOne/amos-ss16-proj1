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


// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'app.controllers', 'app.services', 'ngCordovaBluetoothLE', 'chart.js', 'rzModule', 'ngCordova', 'pascalprecht.translate'])

    .run(function ($ionicPlatform, $cordovaBluetoothLE, $rootScope, $q, $cordovaGlobalization, Log, settings, availableLanguages, defaultLanguage, $translate) {

		// It sets the language to the system language. Only on the very first run of the app
		setInitialLanguageSetting($rootScope, $q, $cordovaGlobalization, settings, Log, availableLanguages, defaultLanguage)
		.then(
			function(data){
				Log.add("tanslating to: " + settings.settings.language);

				//If there are translation ids, that are available in the en-us translation table, but not in the currently used one
				//angular-translate would return the translation id by default.
				//So we register a fallback language, so angular-translate will return this translation instead of the missing one
				$translate.fallbackLanguage(defaultLanguage);

				// let angular-translate know that from now on this language has to be used
				// this returns a promise so we have to return that again. If we wouldnt return it the then() will probably not wait for it.
				return $translate.use(settings.settings.language)

			}
		).then(function(data){
				//make sure ionic specific stuff is only done after the translation was loaded, so warning popups are localized
				$ionicPlatform.ready(function () {
					// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
					// for form inputs)
					if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
						cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
						cordova.plugins.Keyboard.disableScroll(true);
					}
					if (window.StatusBar) {
						// org.apache.cordova.statusbar required
						StatusBar.styleDefault();
					}

					// Initialize the cordovaBluetoothLE plugin. Prompts the user to enable BT if not already activated
					// this has to be called after the translation is loaded in order to display translated error messages
					Log.add("initializing CordovaBluetoothLE");
					initCordovaBluetoothLE($cordovaBluetoothLE, $rootScope, $translate, Log);

					// Add EventListener for Volume UP and DOWN (works only for Android + BlackBerry)
					$ionicPlatform.on("volumeupbutton", function (event) { $rootScope.$broadcast('volumeupbutton'); });
					$ionicPlatform.on("volumedownbutton", function (event) { $rootScope.$broadcast('volumedownbutton'); });

				})
			}
		);
    })

	// add languages here if you add a new language to the lang folder
	.constant('availableLanguages', ['en-us', 'de-de', 'hu-hu'])
	.constant('defaultLanguage', 'en-us')

    .config(function ($stateProvider, $urlRouterProvider, $translateProvider, defaultLanguage) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html',
                controller: 'TabCtrl'
            })

            // Each tab has its own nav history stack:

            .state('tab.tag', {
                url: '/tag',
                views: {
                    'tab-tag': {
                        templateUrl: 'templates/tab-tag.html',
                        controller: 'TagCtrl'
                    }
                }
            })

			.state('tab.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'templates/tab-settings.html',
                        controller: 'SettingsCtrl'
                    }
                }
            })

            .state('tab.graph', {
                url: '/graph',
                views: {
                    'tab-graph': {
                        templateUrl: 'templates/tab-graph.html',
                        controller: 'GraphCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/tag');

		// This means: load the language file lang/{preferredLanguage}.json asynchronously
		$translateProvider.useStaticFilesLoader({
			prefix: 'lang/',
			suffix: '.json'
		});
		$translateProvider.preferredLanguage(defaultLanguage);

		// sanitize the HTML in the translation text using angulars $sanitize
		// $translateProvider.useSanitizeValueStrategy('sanitize');
		// this would be the better solution but it doesnt display special characters after that.
		// angular-translate website states: Currently there is an issue with the sanitize mode,
		// it will double encode UTF-8 characters or special characters.
		//Recommendation: use the 'escape' stratey, until this is resolved.
		$translateProvider.useSanitizeValueStrategy('escape');

    })
    // Adopted from ng-cordova-ble example
    .factory('Log', function ($rootScope, $ionicPopup) {
        $rootScope.log = [];

        var add = function (message) {
            console.log(message);
            $rootScope.log.push({
                message: message,
                datetime: new Date().toISOString(),
            });
        };

        $rootScope.show = function (item) {
            $ionicPopup.show({
                template: item.message,
                title: 'Log',
                subTitle: item.datetime,
                buttons: [
                    { text: 'Cancel' },
                ]
            });
        };

        var clear = function () {
            $rootScope.log = [];
        };

        return {
            add: add,
            clear: clear,
        };
    })
    // https://docs.angularjs.org/error/ngModel/numfmt?p0=10
    .directive('stringToNumber', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function (value) {
                    return '' + value;
                });
                ngModel.$formatters.push(function (value) {
                    return parseFloat(value, 10);
                });
            }
        };
    });


function initCordovaBluetoothLE($cordovaBluetoothLE, $rootScope, $translate, Log){
	// Disable built in request as we use our own request below because
	// With the built in request we can not recognize if the request was declined, or at least do not know how
	$cordovaBluetoothLE.initialize({ request: false }).then(null,
		function (result) {
			// Handle errors
			Log.add("Init Fail: " + JSON.stringify(result));
			navigator.notification.alert($translate.instant("PROMPT_DEVICE_DOES_NOT_SUPPORT_BLE"), function () { navigator.app.exitApp(); });
		},
		function (obj) {
			// Handle successes of initialize
			if (obj.status == "disabled") {
				var enableFunction = function () {
					$cordovaBluetoothLE.enable().then(null, function (obj) {
						// There was a failure of the internal enable() function
						Log.add("Enable Error : " + JSON.stringify(obj));
						navigator.notification.alert($translate.instant("PROMPT_INTERNAL_ERROR_ENABLING_BT"),
													 function () { navigator.app.exitApp(); });
					});
				}
				// Our own request. gets called everytime there was a change to the BT state
				navigator.notification.confirm($translate.instant("PROMPT_TURN_ON_BLUETOOTH"), function (buttonIndex) {
					if (buttonIndex == 1){
						enableFunction();
					}else if(buttonIndex == 0 || buttonIndex == 2){
						navigator.notification.alert($translate.instant("PROMPT_APP_ONLY_WORKS_WITH_BT"), function () { navigator.app.exitApp(); });
					}
				}, $translate.instant("PROMPT_HEADER_ENABLE_BT"), [$translate.instant("PROMPT.ACCEPT"), $translate.instant("PROMPT.CANCEL")]);
			}
			else if (obj.status == "enabled") {
				Log.add("Enable Success : " + JSON.stringify(obj));

				$cordovaBluetoothLE.hasPermission().then(function (obj) {
					Log.add("Has Permission Success : " + JSON.stringify(obj));
					if (obj.hasPermission == false) {
						$cordovaBluetoothLE.requestPermission().then(function (obj) {
							Log.add("Request Permission Success : " + JSON.stringify(obj));
						}, function (obj) {
							Log.add("Request Permission Error : " + JSON.stringify(obj));
						});
					}
					else {
						$rootScope.$broadcast("bleEnabledEvent");
					}
				}, function (obj) {
					Log.add("Has Permission Error : " + JSON.stringify(obj));
					$rootScope.$broadcast("bleEnabledEvent");
				});

			}
		}
	);
}

function setInitialLanguageSetting($rootScope, $q, $cordovaGlobalization, settings, Log, availableLanguages, defaultLanguage){

	// This promise does nothing. It is just returned, so it can be used in the same way as when a real promise is returned like below
	var initialLangSettingDone = $q(function(resolve, reject) {
		// Do nothing
		resolve();
	});
	var lang;
	if(typeof navigator.globalization == "undefined") {
		// At the moment navigator is undefined if you do "ionic serve" but it works with "cordova run browser --target=firefox"
		settings.settings.language = defaultLanguage;
		Log.add("navigator.globalization undefined. Probably running in browser. Using default language: " + defaultLanguage);
		return initialLangSettingDone;
	}
	// If this is true its the first run. So use the system language:
	if(settings.settings.language == "system"){
		// Get the BCP 47 language tag for the client's current language. For example "en-US"
		// "en" ist the ISO 639-1 two-letter language code and  "US" is the ISO 3166-1 country code
		// Use AngularJS wrapper from ngCordova for cordova-plugin-globalization instead of navigator.globalization.getPreferredLanguage
		// That way we can work with a promise instead of callbacks
		initialLangSettingDone = $cordovaGlobalization.getPreferredLanguage().then(
			// Success
			function(language) {
				// Value is a string already
				lang = language.value;
				// Depending on the phone the codes may be uppercase or lowercase. Prevent problems by lowercasing everything
				lang = lang.toLowerCase();
				Log.add("getPreferredLanguage success: preferred language is: " + lang);
				var langExists = false;
				for(var i=0; i<availableLanguages.length; i++){
					if(availableLanguages[i] == lang){
						settings.settings.language = lang;
						langExists = true;
						break;
					}
				}
				if(langExists == false){
					settings.settings.language = defaultLanguage;
					Log.add("Preferred Language does not exist. Using default language: " + defaultLanguage);
				}
			},
			// Error
			function(error) {
				settings.settings.language = defaultLanguage;
				Log.add("getPreferredLanguage error: " + error);
				Log.add("Using default language: " + defaultLanguage);
			});
	}
	return initialLangSettingDone;
}

//currently not used
function setLocaleSetting($rootScope, settings, Log){
	// Returns the BCP 47 compliant locale identifier. For example "en-US"
	// Android does not distinguish between "language" and "locale" so this will be the same as above
	if(typeof navigator.globalization !== "undefined") {
		navigator.globalization.getLocaleName(function (locale) {
				// Value is a string already
				var locale = locale.value;
				// Depending on the phone the string may be uppercase or lowercase. Prevent problems by lowercasing everything
				locale = locale.toLowerCase();
				Log.add("getLocaleName success: preferred locale is: " + locale);
				// Set language setting
				settings.settings.locale = locale;
				$rootScope.$emit('setLocaleSettingDone');
			}, function (error) {
				Log.add("getLocaleName error:" + error);
				settings.settings.locale = "en-us";
				$rootScope.$emit('setLocaleSettingDone');
		});
	} else {
		// Fallback if the navigator object is missing. Should never happen on actual devices
		settings.settings.locale = "en-us";
		$rootScope.$emit('setLocaleSettingDone');
	}
}
