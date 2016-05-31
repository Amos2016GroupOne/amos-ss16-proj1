# amos-ss16-proj1
The repository for the AMOS Project 2016 Group 1

Prerequisites:

Cordova:
- NodeJS + NPM

Android:
- Android SDK
- JDK 1.8

E2E Tests:
- Protractor
- Java for Selenium
- Firefox

Install and build:

- npm install -g cordova ionic bower gulp karma-cli protractor
- npm install
- ionic state restore
- bower update
- ionic prepare
- ionic build

Run:

- `ionic emulate` OR `ionic run`
- OR `ionic run android --device` to test on connected Android device
- OR `ionic serve` to test GUI-design in Webbrowser.


To regenerate icons from `app-icon.svg` execute `./generateAppIcons.sh`
