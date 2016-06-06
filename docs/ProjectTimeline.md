# Outline

This document is designed to outline the general steps taken so far.

Furthermore it aims to consolidate the discussions we had
during this project and their arguments into one document.

It is meant to be continously expanded as we make new design decisions.

## Cordova

### Installation of Cordova

The initial setup of cordova is extremely easy.

The only requirement for cordova itself is nodejs and its package manager npm.

    npm install -g cordova

### Initialization of Cordova Project

Is similarly to the installation a one liner.

    cordova create hello com.example.hello HelloWorld

### Adding of platforms and building

Cordova requires the developer to explicitly specify which platforms they wish to support and build the app for.
For example reasons Android is used in the following however the steps are similar for iOS.

This is done using the cordova command aswell.

    cordova platform add android --save

Using the '--save' switch allows the platform to be restored on other developers machines using

    cordova prepare

Depending on the platform various other dependencies are required. For further information see for example:

https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html

Building and running for a specific platform is accomplished using

    cordova build android
    cordova run android

### Creating application logic and views

Cordova is split into multiple layers. Starting from a platform specific layer
which is where the cordova-plugins reside up to the webview layer
which is where most of the logic of the app itself is going to reside.

The lower levels are written in part in the native programming language of the underlying platform
i.e. Java or Objective-C usually. They also expose a Javascript interface that is used by the higher layers.

The application logic itself is written in Javascript entirely.
The views are composed of HTML which is manipulated using Javascript.

The main benefit of this separation is that only hardware specific functions need to be implemented in a specific language
while the main application logic can be shared among platforms allowing for (depending on the application) almost complete code reuse.

The drawback is that it also limits the developer to Javascript which is by some considered to be a script language with a lot of drawbacks.

For further discussion about Javascript-Frameworks see below.

## Javascript Frameworks

Due to the aforementioned need to use Javascript as the main programming language the decision to use existing Javascript frameworks comes naturally.

However there is an abundance of such frameworks with many differences and similarities. We discussed a rather short list when deciding which one to use to develop the project.

### ReactJS

Created by Facebook ReactJS is a library not so much a framework that is designed to allow easy DOM manipulating and one-way databinding.

One of the main differences to AngularJS is that it doesn't try to be a complete framework instead relying on additional libraries.

If thinking in Model-View-Controller React handles the View part very well.

Main Advantages:
 - JSX a JS/XML Hybrid language that is compiled into pure javascript
 - Very active community
 - Likely to be developed over a long time

Disadvantages:
 - Not around as long as AngularJS
 - Requires additional libraries
 - Not as many Cordova Plugin Bindings

### AngularJS

A complete framework AngularJS provides DOM manipulation, two-way databinding and a rich controller and state architecture.

AngularJS has been around since 2009 and has seen a lot of development. There are a multitude of additional libraries and components that solve a number of standard design problems.

It completely encompasses the entire Model-View-Controller hierarchy.

The currently stable version of AngularJS is version 1. However version 2 is expected to be released this year. This means that the main development will happen on this new version probably.
However it can be expected that version one will continue to receive updates and will still have an active community since Angular 2 will change a lot of things.

Main Advantages:
 - Directives which allow for new HTML-Syntax elements with custom behaviour.
 - Mature library which has been around for a long time
 - Active community
 - Lots of libraries
 - Cordova Plugins

Disadvantages:
 - Relatively complex to develop
 - Will be superseded by AngularJS 2 which completely changes a lot of things


## Ionic

Ionic provides another layer on top of Cordova. It is a UI-Library/Framework that contains UI-Elements that are designed to look as native as possible on each platform.

Furthermore it provides a couple of additional features such as theming that help when developing cross-platform applications.

It replaces/augments the Cordova CLI instead providing its own CLI.

The installation is as simple as for Cordova. Simply calling

    npm install -g ionic

 is sufficient, provided Cordova is already installed.

 It can be used in place of Cordova when adding platforms, building and running.

    ionic build android
    ionic run android

 It provides one additional interesting feature: 'ionic serve'

 This is a live preview inside the browser that allows for rapid prototyping/development.
 A competitor in that regard would be PhoneGap (A Cordova offshoot) which allows similar things even deployed on a device.


## Common Pitfalls

Below is a list of common pitfalls we stumbled in.

 - `() => {}` does not work on iOS webview and old versions android webviews
 - js comparing `=` of objects does not work as expected. So use `JSON.stringify()` and compare the resulting strings to check if all object-properties contain the same value.
  - This is especially important on radio/ select controls when you have objects as `ng-value`(in this case the json-filter function can be used)

- Renaming the generated apk is hard?!
  --> no solution found yet

- Angular does strange things to `JSON.stringify` and `JSON.parse`. If Angular is included in
a project better use `angular.toJson` and `angular.fromJson`

- Building up a radio group that uses objects as values:
html:

    <ion-radio
    ng-repeat="volumeProfile in settings.volumeProfiles"
    ng-value="volumeProfile|json"
    ng-model="settings.currentVolumeProfile"
    ng-change="changeVolumeProfile()">
    {{ volumeProfile.name }}
    </ion-radio>

    controller.js:


    var settings = {
      ...
      "volumeProfiles": [
        { name: "Home",    volume: 40 },
        { name: "Office",  volume: 70 },
        { name: "Outdoor", volume: 90 }
      ],
      ...

    // to set the controller to a value:
    settings.currentVolumeProfile = angular.toJson(settings.volumeProfiles[0], true);

As === operator on objects evaluates to true just if both
operands __refer__ to the same we must save the values as json (see `...|json`-filter).
Furthermore the json filter automatically uses the `pretty`-flag. So we have to set this
as well:

    ... = angular.toJson(..., true);

