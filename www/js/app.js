// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'app.controllers', 'app.services', 'ngCordovaBluetoothLE', 'chart.js', 'angular-slider-easy'])

    .run(function ($ionicPlatform, $cordovaBluetoothLE, $rootScope, Log) {
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

			// Add EventListener for Volume UP and DOWN (works only for Android + BlackBerry)
			document.addEventListener("volumeupbutton", function (event) { $rootScope.$broadcast('volumeupbutton'); });
			document.addEventListener("volumedownbutton", function (event) { $rootScope.$broadcast('volumedownbutton'); });
			
            //disable built in request as we use our own request below because
            //with the built in request we can not recognize if the request was declined, or at least do not know how
            $cordovaBluetoothLE.initialize({ request: false }).then(null,
                function (result) {
                    //Handle errors
                    Log.add("Init Fail: " + JSON.stringify(result));
                    navigator.notification.alert("Sorry. Your device does not support BTLE!", function () { navigator.app.exitApp(); });
                },
                function (obj) {
                    //Handle successes of initialize
                    if (obj.status == "disabled") {
                        var enableFunction = function () {
                            $cordovaBluetoothLE.enable().then(null, function (obj) {
                                //there was a failure of the internal enable() function
                                Log.add("Enable Error : " + JSON.stringify(obj));
                                navigator.notification.alert("There was an internal error whenn enabling Bluetooth. This app only works with Bluetooth enabled.",
                                                             function () { navigator.app.exitApp(); });
                            });
                        }
                        //our own request. gets called everytime there was a change to the BT state
                        navigator.notification.confirm("BLE Remote would like to turn on Bluetooth.", function (buttonIndex) {
                            if (buttonIndex == 1){
                                enableFunction();
                            }else if(buttonIndex == 0 || buttonIndex == 2){
                                navigator.notification.alert("Sorry. This app only works with Bluetooth enabled.", function () { navigator.app.exitApp(); });
                            }
                        }, "Enable Bluetooth", ["Accept", "Cancel"]);
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
        })
    })

    .config(function ($stateProvider, $urlRouterProvider) {

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
