BluetoothLE

This plugin allows you to interact with Bluetooth LE devices on Android, iOS, and partially on Windows.

Requirements

    Cordova 5.0.0 or higher
    Android 4.3 or higher, Android Cordova library 5.0.0 or higher, target Android API 23 or higher
    iOS 7 or higher
    Windows Phone 8.1 (Tested on Nokia Lumia 630)
    Device hardware must be certified for Bluetooth LE. i.e. Nexus 7 (2012) doesn't support Bluetooth LE even after upgrading to 4.3 (or higher) without a modification


What we changed:
nothing

Why we chose it:

We first used https://github.com/don/cordova-plugin-ble-central
But it was hard to interact with Angular.

A better way would be to use the ngCordovaBluetoothLE Plugin in the project to wrap the plugin. 
Would save some trouble too we had in the beginning.


How to use it:
Add it to your controller:
.controller('TagCtrl', function($scope, $cordovaBluetoothLE)

Have a closer look to app.js and tag.js
The code is well documented.