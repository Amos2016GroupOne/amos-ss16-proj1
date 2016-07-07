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
.controller('TourCtrl', function($scope, $rootScope, $ionicPlatform, settings, $timeout) {
    $scope.currentStep = 0;

    $scope.startTutorial = function() {
        $rootScope.advancedSettings = true;
        $timeout(function() {
            $scope.currentStep = 1;
        });
        // As we tour through advanced settings, show them!
    }

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
            '  <h3 class="popover-title">{title} <a class="close" ng-click="currentStep=0">&times;</a></h3>' +
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
    // REFACTOR: Actually the following should happen in the html file as it is about the VIEW!
    if (ionic.Platform.isAndroid()) {
        $scope.appendTourStep("div.tab-nav>a:eq(1)",  1, "{{'SETTINGS_TAB.SETTINGS' | translate}}",          "{{'TOUR.T1' | translate}}", "bottom");
    } else {
        $scope.appendTourStep("div.tab-nav>a:eq(1)",  1, "{{'SETTINGS_TAB.SETTINGS' | translate}}",          "{{'TOUR.T1' | translate}}", "top");
    }
    $scope.appendTourStep("#scanDurationSetting", 1, "{{'SETTINGS_TAB.SCAN_DURATION' | translate}}",     "{{'TOUR.T2' | translate}}");
    $scope.appendTourStep("#volumeSetting",       1, "{{'TOUR.VOLUME' | translate}}",                    "{{'TOUR.T3' | translate}}");
    $scope.appendTourStep("#languageSetting",     1, "{{'SETTINGS_TAB.LANGUAGE' | translate}}",          "{{'TOUR.T4' | translate}}");
    // TODO: broken...
    //$scope.appendTourStep("#dbMeterSetting",      1, "{{'SETTINGS_TAB.ACTIVATE_DB_METER' | translate}}", "{{'TOUR.T5' | translate}}", "top");
    if (ionic.Platform.isAndroid()) {
        $scope.appendTourStep("div.tab-nav>a:eq(2)",     2, "{{'GRAPH_TAB.GRAPH' | translate}}",                "{{'TOUR.T6' | translate}}", "bottom");
    } else {
        $scope.appendTourStep("div.tab-nav>a:eq(2)",     2, "{{'GRAPH_TAB.GRAPH' | translate}}",                "{{'TOUR.T6' | translate}}", "top");
    }

    if (ionic.Platform.isAndroid()) {
        $scope.appendTourStep("div.tab-nav>a:eq(0)",     0, "{{'TAG_TAB.STATUS' | translate}}",                "{{'TOUR.T11' | translate}}", "bottom");
    } else {
        $scope.appendTourStep("div.tab-nav>a:eq(0)",     0, "{{'TAG_TAB.STATUS' | translate}}",                "{{'TOUR.T11' | translate}}", "top");
    }


    $scope.appendTourStep("#btnRefresh",     0, "{{'TAG_TAB.SCAN_FOR_DEVICES' | translate}}",          "{{'TOUR.T9' | translate}}");
    $scope.appendTourStep("#btnMotionStart", 0, "{{'TAG_TAB.SHOW_MOTION' | translate}}",          "{{'TOUR.T10' | translate}}");

    // Does not work anymore as this button is not available all the time:
    //    $scope.appendTourStep("#btnTrackGraph",       2, "{{'GRAPH_TAB.TRACK_GRAPH' | translate}}",          "{{'TOUR.T7' | translate}}", "bottom");

    $scope.appendTourStep("#startTutorial",       1, "{{'TOUR.RESTART_THE_TUTORIAL' | translate}}",      "{{'TOUR.T8' | translate}}");


    // TODO: when tour is started automatically from a not-settings-tab an error occurs as some elements cannot be found by angular.element as it was not loaded correctly after the tab change...
        $timeout(function() {
            if (settings.getSetting('start-with-tour')) {
                console.log('startTutorial');
                $scope.startTutorial();
                settings.setSetting('start-with-tour', false);
            }
        }, 1000);
});
// TODO: larger click boxes for arrows.
// TODO: review step translation!
