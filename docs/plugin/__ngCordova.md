ngCordova is not a plugin itself, but a Wrapper for native Cordova plugins.
It makes the life a lot easier.

With ngCordova, instead of calling Cordova plugins directly and having to figure out the proper object or plugin name, or to check if the plugin is actually installed, you can just call a simple AngularJS service like this:

$cordovaCamera.getPicture(options)
  .then(function(imageData) {

    // Process camera data

  }, function(error) {

    // Show an error to the user

  });


A brandnew and maybe even better wrapper is ionic-native.
The description:
Ionic Native is a curated set of wrappers for Cordova plugins that make adding any native functionality you need to your Ionic, Cordova, or Web View mobile app easy.
https://github.com/driftyco/ionic-native


How we included it:

Put it in your index.html

<script type="text/javascript" src="lib/ngCordova/dist/ng-cordova.js"></script>
<script type="text/javascript" src="lib/ng-cordova-ble/ng-cordova-bluetoothle.js"></script>

// The ng-Cordova scripts need to be included BEFORE the cordova.js script. Otherwise it will fail.
<script type="text/javascript" src="cordova.js"></script>