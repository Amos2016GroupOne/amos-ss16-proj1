# amos-ss16-proj1
The repository for the AMOS Project 2016 Group 1

Prerequisites:

Cordova:
- NodeJS + NPM

Android:
- Android SDK
- JDK 1.8

Install and build:

- npm install -g cordova cordova-icon ionic bower
- ionic state restore
- ionic prepare
- bower update
- ionic build

Run:

- `ionic emulate` OR `ionic run` OR (if you have no sdk's installed yet: `cordova run browser --target=chromium`





To regenerate icons from `app-icon.svg` execute `./generateAppIcons.sh`
