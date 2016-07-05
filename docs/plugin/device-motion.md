DeviceMotion

This plugin provides access to the device’s accelerometer. The accelerometer is a motion sensor that detects the change (delta) in movement relative to the current device orientation, in three dimensions along the x, y, and z axis.

Install:
cordova plugin add cordova-plugin-device-motion

Supported Platforms

    Amazon Fire OS
    Android
    BlackBerry 10
    Browser
    Firefox OS
    iOS
    Tizen
    Windows Phone 8
    Windows

Android Issue:
The accelerometer is called with the SENSOR_DELAY_UI flag, which limits the maximum readout frequency to something between 20 and 60 Hz, depending on the device. Values for period corresponding to higher frequencies will result in duplicate samples. More details can be found in the Android API Guide.

iOS Issue:
 iOS doesn't recognize the concept of getting the current acceleration at any given point.
 You must watch the acceleration and capture the data at given time intervals.
 Thus, the getCurrentAcceleration function yields the last value reported from a watchAccelerometer call.


Why have you chosen it? 
ngCordova offers this Plugin to meassure the Acceleration.
As ngCordova is the recommended way to use a plugin (without trouble) we chose this one.

What have you changed, if you have changed sthg.? 
nothing

How have you included it?
Include it in your Controller
.controller('TagCtrl', function($scope, $rootScope, $q, $cordovaDeviceMotion) {

Example Usage:

// Define your Success Function
function onSuccess(acceleration) {
    alert('Acceleration X: ' + acceleration.x + '\n' +
          'Acceleration Y: ' + acceleration.y + '\n' +
          'Acceleration Z: ' + acceleration.z + '\n' +
          'Timestamp: '      + acceleration.timestamp + '\n');
}

// Define your Error Function
function onError() {
    alert('onError!');
}

// Create an options Object
var options = { frequency: 3000 };  // Update every 3 seconds (not more options available yet)

// Start to watch the accelerometer data with the frequency of [options]
var watchID = navigator.accelerometer.watchAcceleration(onSuccess, onError, options);

// Deregister from accelerometer again. Use the watchID you got from watchAcceleration()
navigator.accelerometer.clearWatch(watchID);

