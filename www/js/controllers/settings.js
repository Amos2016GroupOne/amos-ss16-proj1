/*
 * Projectname: amos-ss16-proj1
 *
 * Copyright (c) 2016 de.fau.cs.osr.amos2016.gruppe1
 *
 * This file is part of the AMOS Project 2016 @ FAU
 * (Friedrich-Alexander University Erlangen-Nürnberg)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 *
 */


// Controller for Settings
angular.module('app.controllers')
.controller('SettingsCtrl', function($scope, $rootScope, $ionicPlatform, Log, settings, $translate, availableLanguages) {

    // Link the scope settings to the settings service
    $scope.settings = settings.settings;

    // Scope update function is the settings service persist function
    $scope.update = settings.persistSettings;

    // Get the list of all languages that are available as json file
    $scope.availableLanguages = availableLanguages;

    $scope.changeLanguage = function() {
        console.log("tanslating to: " + $scope.settings.language);
        $translate.use($scope.settings.language);
        $scope.update();
    }

    // This is used by the scanduration slider. It adds ' s' to the tooltip of the slider
    $scope.durationSliderLabel = function(value) {
        return value + ' s';
    }

    // This is used by the volume slider. It adds '%' to the tooltip of the slider
    $scope.volumeSliderLabel = function(value) {
        return value + '%';
    }

    $scope.newVolumeProfileName = "";

    $scope.changedVolume = function() {
        $scope.settings.currentVolumeProfile = false;
        $scope.settings.mute = false;
        $scope.update();
    }

    $scope.changeVolumeProfile = function() {

        $scope.settings.volume = JSON.parse($scope.settings.currentVolumeProfile).volume;
        $scope.settings.mute = false;
        $scope.settings.volume = angular.fromJson($scope.settings.currentVolumeProfile).volume;

        $scope.update();
    }

    // Called when mute was toggled by pressing the button
    $scope.muteToggle = function() {
        if (settings.settings.mute) {
            settings.settings.volBeforeMute = settings.settings.volume;
            settings.settings.volProfileBeforeMute = settings.settings.currentVolumeProfile;
            settings.settings.volume = parseInt(0);
            $scope.settings.currentVolumeProfile = false;  // Deselects any volume profile
        } else {
            settings.settings.volume = parseInt(settings.settings.volBeforeMute);
            settings.settings.currentVolumeProfile = settings.settings.volProfileBeforeMute;
        }
        // Persist settings
        $scope.update();
    }

    // Helper function to start the DBMeter and its output
    function startDBMeter() {
        var delayCounter = 0,
        DELAY = 10;  // * 100 ms
        DBMeter.start(function(dB){
            // Gets called every 100 ms. to change this, the dbmeter plugins source must be adapted.
            if (delayCounter === 0) {
                // Refresh datamodel and format
                $scope.decibel = dB.toFixed(0);
                //console.log('loudness: '+dB.toFixed(0));

                // Select another volume profile if it is loud!
                if (dB > 85 && !$scope.settings.mute) {
                    // Set profile to outdoor as it is soo loud ;)
                    // REM: The json filter that is used in tab-settings.html for the options automatically
                    // does prettyfication. To set the current volume profile we must set the pretty flag as well:
                    $scope.settings.currentVolumeProfile = angular.toJson($scope.settings.volumeProfiles[2], true);
                    $scope.changeVolumeProfile();
                }

                // Manual apply is needed, looks like angular does not fire apply here
                $scope.$apply();

            }
            delayCounter = (delayCounter + 1) % DELAY;
        }, function(e){
            console.log('code: ' + e.code + ', message: ' + e.message);
        });
    }

    // Tanslate it on first run
    $translate('NOT_MEASURED_YET').then(function (translation) {
        $scope.decibel = translation;
    });
    // Also listen if the translation was changed in order to update it then
    $rootScope.$on('$translateChangeSuccess', function () {
        $translate('NOT_MEASURED_YET').then(function (translation) {
            $scope.decibel = translation;
        });
    });
    $scope.decibelToggle = function() {

        // Persist settings
        $scope.update();

        if ($scope.settings.isListeningDecibel === true) {
            console.log('starting db...');
            startDBMeter();
        } else {
            console.log('stopping db...');
            DBMeter.isListening(function(isListening) {
                if (isListening) {
                    DBMeter.stop(function(){
                        console.log("DBMeter well stopped");
                    }, function(e){
                        console.log('code: ' + e.code + ', message: ' + e.message);
                    });
                }
            });
        }

    }

    // Catch stupid browsers!
    if (typeof DBMeter !== 'undefined') {
        $scope.decibelToggle();
    }

    $ionicPlatform.on('pause', function() {
        // Store DBMeter state and stop it.
        DBMeter.myWasListening = false;
        DBMeter.isListening(function(isListening) {
            if (isListening) {
                DBMeter.stop(function() {
                    DBMeter.myWasListening = true;
                    console.log("DBMeter well stopped");
                }, function(e) {
                    console.log('code: ' + e.code + ', message: ' + e.message);
                });
            }
        });
    });

    $ionicPlatform.on('resume', function() {
        // Restore DBMeter state
        if (DBMeter.myWasListening === true) {
            console.log('try to resume DBMeter');
            // Reactivate DBMeter
            DBMeter.isListening(function(isListening) {
                if (!isListening) {
                    startDBMeter();
                }
            });
        }
    });

    function volumeButtonPress(volDiff) {
        $scope.$apply(function() {	// Angular doesn't fire $apply on the events so if $broadcast is called outside angular's context, you are going to need to $apply by hand.

            // Update Volume + checks for valid values (0 to 100)
            if (settings.settings.mute) {
                var vol = parseInt(settings.settings.volBeforeMute);
            } else {
                // Parse to Int or otherwise it is not if changed per GUI
                var vol = parseInt(settings.settings.volume);
            }
            var up = 10;

            vol += volDiff;

            // Catch if volume 91 to 100, update to max 100
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            settings.settings.volume = vol;
            // Unmute as the user changed the volume and persist
            $scope.changedVolume();
        });
    }

    $scope.$on('volumeupbutton', volumeButtonPress.bind(this, +10));
    $scope.$on('volumedownbutton', volumeButtonPress.bind(this, -10));
})
