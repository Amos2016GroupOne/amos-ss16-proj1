# Deploy to Apple iOS with travisCI / on a developer machine not running iOS

As giving Apple hardware to every programmer is unrealistic, in the following discusses alternative ways of deploying for the iStack.
Furthermore it would be cool to let our custom integration tool ([travisCI](travis-ci.org)) to automatically run the iOS-Build.

## Apple OS in a virtual Machine
This seems to work ([see this](http://stackoverflow.com/questions/276907/starting-iphone-app-development-in-linux))

**BUT:**
  1. Developers still must develop in an Mac OS X environment
  2. Not possible with travisCI
  3. It is not legally allowed to run Mac OS X on non Apple Hardware ([see this](https://discussions.apple.com/thread/5785112?tstart=0))

## Compiling on Windows/Linux and deploy to iOS
Since multiple forum entries([1](https://www.quora.com/How-do-I-to-build-app-IOS-by-ionic-framework-on-windows),[2](https://www.quora.com/Is-it-possible-to-develop-apps-for-iOS-using-a-Windows-or-Linux-PC)) this is not possible.


## Setting up a dedicated Mac OS X Server that does the build on request
The way to go.

Obviously setup could be done by yourself but it seems to be a good idea (especially in terms of long term maintenance) to go for a provider that hosts a service for it.
Those Services are using build farms with Apple hardware and software that can start the build and also the deploy to AppStore automatically.

Nevertheless, an Apple Developer ID is needed to create the certificates against which the .ipa files are signed.
The following build Services that provide support for iOS were taken into account:
### ionic.io
  - Currently in beta
  - [documentation start](http://docs.ionic.io/v2.0.0-beta/docs/package-overview)

#### Starting a single build for iOS
- Create an account on ionic.io
- `ionic io init`
- Setup a security profile. Follow [this guide](http://docs.ionic.io/docs/security-profiles)
- If not done yet follow [this guide](http://docs.ionic.io/v2.0.0-beta/docs/ios-build-profiles) to setup the recently created security profile for iOS

**Remeber** to replace `PROFILE_TAG` in all the following steps with the name of your created security profile
- Now the command `ionic package build ios --profile PROFILE_TAG` will start a development build of your app
- Use `ionic package list` to determine the recent `BUILD_ID`
- Use `ionic package download BUILD_ID` to download the newly generated .ipa file from the build server
- For further reference see [this guide](http://docs.ionic.io/v2.0.0-beta/docs/package-ios)

#### Configuring travisCI to kick off iOS build
- Add the following lines to the `.travis.yml` in the root directory:
```yaml
# TODO: echo-automate login if necessary? Or is it only necessary to login once if an app ID was given?
# TODO: test!
- ionic package build ios --profile PROFILE_TAG | grep "Build ID" | cut -d ' ' -f 3
```

#### Remarks
- Also it is possible to start android builds through ionic.io . See therefore [this guide](http://docs.ionic.io/docs/package-android)
- [ionic deploy](http://docs.ionic.io/docs/deploy-overview) can be used to automate the continuous deployment.


### build.phonegap.com
  - Should work but as we use ionic, ionic.io is used
