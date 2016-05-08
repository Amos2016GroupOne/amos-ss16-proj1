// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'app.controllers'])

    .run(function ($ionicPlatform) {
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

            cordova.plugins.BluetoothStatus.initPlugin();
            //check if the device supports Bluetooth Low Energy
            //Android: initPlugin sets the values of BluetoothStatus. It will fail if the BluetoothManager class is not present
            //Android 4.3 is required as earlier versions dont have this class. Also for BTLE support at least Android 4.3 is needed
            //dirty hack: wait for 1 second as otherwise the hasBTLE will not be set. Moving this into another event also wont work
            setTimeout(function () {
                if (!cordova.plugins.BluetoothStatus.hasBTLE) {
                    //as hasBTLE defaults to false we can still use it even if initPlugin fails,
                    //which should only happen if the device has an Android version below 4.3
                    navigator.notification.alert("Sorry. Your device does not support BTLE!", function () { navigator.app.exitApp(); });
                    return;
                }
                else {
                    ble.isEnabled(
                        function () {
                            //BT was already enabled when the app started. this function is called if BT is currently enabled
                            //onBTenabled();
                        },
                        function () {
                            //this function is called if BT is not enabled
                            //navigator.notification.alert("Bluetooth is not enabled on your phone. Please turn it on to continue!", function () { });
                            ble.enable(
                                function () {
                                    //onBTenabled();
                                },
                                function () {
                                    navigator.notification.alert("Sorry. This app only works with Bluetooth enabled.", function () { navigator.app.exitApp(); });
                                }
                            );
                        }
                    );
                }

            }, 1000);
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
                templateUrl: 'templates/tabs.html'
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
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/tag');

    });
