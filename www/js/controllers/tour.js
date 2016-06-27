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


// Controller for Tour
angular.module('app.controllers')
.controller('TourCtrl', function($scope, $ionicPlatform, settings) {
    $scope.currentStep = 0;

    $scope.startTutorial = function() {
        $scope.currentStep = 1;
    }

    var isFirstTourStep = true;  // first tourtip has no back button.
    $scope.appendTourStep = function(target, targetTab, title, content, at) {

        function miniTemplate(template, options) {
            for (o in options) {
                template = template.replace(new RegExp('{'+o+'}', 'g'), options[o]);
            }
            return template;
        }

        // If we use more different tour tips one should start using a template engine!
        var template =
            '<li target="{target}" target-tab="{targetTab}" at="{at}" class="tour popover {at} in" overlay>' +
            '  <div class="arrow"></div>' +
            '  <h3 class="popover-title">{title} <a class="close" ng-click="currentStep=false">&times;</a></h3>' +
            '  <div class="popover-content">' +
            '    {content} ' +
            '  </div>' +
            '  <div class="popover-navigation">' +
            '    <i class="icon ion-arrow-left-b" style="float:left" ng-click="currentStep=currentStep-1"></i>' +
            '    <i class="icon ion-arrow-right-b" style="float:right" ng-click="currentStep=currentStep+1"></i>' +
            '  </div>' +
            '</li>';
        var options = {target: target, targetTab: targetTab, title: title, content: content, at: at || "bottom"};
        var rendered = miniTemplate(template, options);

        $('[ui-tour]').append(rendered);

    };

    // Add tour steps:
    // REM: Do not use ion elements as they have no width and are not placed well.
    // REM: if tab id is set to -2 the tab is not changed. TODO: CONSTANT for that?
    $scope.appendTourStep("a[title='Settings']", -2, "Settings", "Using the settings tab you can customize and optimize your new hearing experience!", "top");
    $scope.appendTourStep("#scanDurationSetting", 1, "Scanning timeout", "This setting influences the time that is searched for hering aids when starting the Scan.");
    $scope.appendTourStep("#volumeSetting", 1, "Volume", "Select the amplification of your hearing aid here.");
    $scope.appendTourStep("#languageSetting", 1, "Language", "Here you can select your prefered Language.");
    $scope.appendTourStep("#dbMeterSetting", 1, "DB-Meter", "This toggle is used to enable the continuous measurement of the environment noise level. If activated it will automatically change the Volumeprofile to outdoor if it gets too loud.", "top");

    $scope.appendTourStep("a[title='Graph']", -2, "Graph", "The graph tab can show you cool statistics", "top");
    $scope.appendTourStep("#btnTrackGraph", 2, "Graph Tracking", "If you wish to start the tracking of the graph hit this button. <b>Remember:</b> A device must be connected first!", "bottom");

    $scope.appendTourStep("#startTutorial", 1, "Restart the tutorial", "Click this here to restart the tutorial.");


    $ionicPlatform.ready(function() {
        if (settings.getSetting('start-with-tour')) {
            console.log('startTutorial');
            $scope.startTutorial();
            settings.setSetting('start-with-tour', false);
        }
    });
});

