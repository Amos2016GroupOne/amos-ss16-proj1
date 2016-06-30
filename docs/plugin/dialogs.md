Dialogs

This plugin provides access to some native dialog UI elements.

Supported Platforms

    Amazon Fire OS
    Android
    BlackBerry 10
    Browser
    Firefox OS
    iOS
    Tizen
    Windows Phone 7 and 8
    Windows 8
    Windows


Installation:
cordova plugin add cordova-plugin-dialogs

How to use:
    navigator.notification.alert
    navigator.notification.confirm
    navigator.notification.prompt
    navigator.notification.beep


Our "Activate Bluetooth" with Translation Example:
navigator.notification.confirm($translate.instant("PROMPT.TURN_ON_BLUETOOTH"), function (buttonIndex) {
   if (buttonIndex == 1){
	enableFunction();
   }else if(buttonIndex == 0 || buttonIndex == 2){
        navigator.notification.alert($translate.instant("PROMPT.APP_ONLY_WORKS_WITH_BT"), function () { navigator.app.exitApp(); });
   }
}, $translate.instant("PROMPT.HEADER_ENABLE_BT"), [$translate.instant("PROMPT.ACCEPT"), $translate.instant("PROMPT.CANCEL")]);


Why did we choose it:
We use it to interact with the user before the App is completly loaded.
For example:
We need to activate the BLE. Therefore we need a interaction with the user. The plguin helps us to do this in a native way.