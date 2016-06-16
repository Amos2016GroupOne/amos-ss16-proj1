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



document.addEventListener('deviceready', initPlugins, false);

function initPlugins()
{

}

// Manually Bootstrap angular
// See also: http://stackoverflow.com/a/27450072/1782614
angular.element(document).ready(function () {
    if (window.cordova) {
      console.log("Running in Cordova, will bootstrap AngularJS once 'deviceready' event fires.");
      document.addEventListener('deviceready', function () {
        console.log("Deviceready event has fired, bootstrapping AngularJS.");
        angular.bootstrap(document.body, ['app']);
      }, false);
    } else {
      console.log("Running in browser, bootstrapping AngularJS now.");
      angular.bootstrap(document.body, ['app']);
    }
});
