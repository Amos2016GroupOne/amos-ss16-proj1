"use strict"

/*
 * This file is a modified version of
 * https://github.com/angular-ui/ui-tour/blob/master/src/tour.js
 * and therefore licensed under MIT.
 */

/*global angular */
/**
 * uiTour directive
 *
 * @example:
 *   <ul ui-tour="currentStep">
 *     <li target="#someId">
 *       First Tooltip
 *       <a ng-click="currentStep=currentStep+1">Next</a>
 *     </li>
 *     <li target=".items:eq(2)" name="two">
 *       Second Tooltip
 *       <a ng-click="currentStep=currentStep-1">Prev</a>
 *     </li>
 *     <li target=".items:eq(2)">
 *       Third Tooltip
 *       <a ng-click="currentStep='two'">Go directly to 'two'</a>
 *       <a ng-click="currentStep=0">Done</a>
 *     </li>
 *   </ul>
 */
angular.module('ui.tour', [])

// REFACTOR: Is there maybe a better way to write this: ?
.directive('uiTour', ['$ionicPosition', '$q', '$timeout', '$parse', '$window', '$compile', '$ionicTabsDelegate', '$ionicScrollDelegate', function($ionicPosition, $q, $timeout, $parse, $window, $compile, $ionicTabsDelegate, $ionicScrollDelegate){
    return {
        link: function($scope, $element, $attributes) {

            // Compile all children
            var children = $element.children();
            for (var i = 0; i < children.length; ++i) {
                $compile(children[i])($scope);
            }

            function validateStepNumber(stepNumber) {
                if (stepNumber < 0) return 0;
                if (stepNumber > $element.children().length) return 0;
                if (!angular.isNumber(stepNumber)) return 0;
                return stepNumber;
            }

            // Watch model and change steps
            $scope.$watch($attributes.uiTour, function(newVal, oldVal){
                hideStep(validateStepNumber(oldVal));

                // showo overlay...
                if (validateStepNumber(newVal) === 0) {
                    angular.element('.tour-overlay').removeClass('active');
                } else {
                    angular.element('.tour-overlay').addClass('active');
                }
                showStep(validateStepNumber(newVal));
            });

            function getStepElement(stepNumber) {
                return $element.children().eq(stepNumber - 1);
            }

            function hideStep(stepNumber) {
                if (stepNumber <= 0) return;
                var elm = getStepElement(stepNumber);
                elm.removeClass('active');
            }

            // Show step
            function showStep(stepNumber) {
                if (stepNumber <= 0) {
                    // Unfreeze all scrolls that were freezed by scroll commands
                    $timeout(function(){
                        $ionicScrollDelegate.freezeAllScrolls(false);
                    }, 20);
                    return;
                }
                var stepEl = getStepElement(stepNumber),
                    at  = stepEl.attr('at');

                // Get id of tab
                var targetTabId = parseInt(stepEl.attr('target-tab'));

                // Maybe select tab
                if ($ionicTabsDelegate.selectedIndex() !== targetTabId) {
                    $ionicTabsDelegate.select(targetTabId);

                }

                // Wait for next digest to update selected tab
                $timeout(function() {

                    var target, scrollView, inScrollView;
                    var windowOffset = { height: $window.innerHeight, width: $window.innerWidth };

                    // Since now the tab is changed we have a chance to find the target
                    target = angular.element(stepEl.attr('target'));
                    if (! (target.length) ) {
                        console.log('Could not find tour tip target ' + stepEl.attr('target') + ' ... skipping it!');
                        $scope.currentStep++;
                        return;
                    }

                    scrollView = $ionicScrollDelegate.getScrollView();

                    // Is the target in the scrollView?
                    inScrollView = angular.element(scrollView.__content).find(stepEl.attr('target')).length > 0;

                    // Reset scroll
                    $ionicScrollDelegate.scrollTop(false); // takes too long. so subtract scrollview position from coordinates!

                    var atTop = (at.indexOf('top') > -1);

                    // Move tourtip
                    var targetOffset  = $ionicPosition.offset(target);
                    if (inScrollView) {
                        targetOffset.top += $ionicScrollDelegate.getScrollPosition().top;
                    }
                    var tourtipOffset = $ionicPosition.offset(stepEl);

                    var tourtipTop = targetOffset.top + (atTop ? -tourtipOffset.height : targetOffset.height);
                    // TODO: maybe use  tourtipEl.style.transform = tourtipEl.style.webkitTransform = 'translate3d(0,' + tourtipTop(v) +'px,0)';
                    //               arrowEl.style.transform = self._arrowEl.style.webkitTransform = 'translate3d(' + arrowLeft(v) + 'px,0,0)';
                    stepEl.css({top: tourtipTop});


                    // Make the tourtip visible
                    stepEl.addClass('active');



                    var newArrowLeft = (targetOffset.left + (targetOffset.width / 2)) - ((windowOffset.width - tourtipOffset.width) / 2);
                    stepEl.find('.arrow').css({left: newArrowLeft});

                    var stepElOffset = $ionicPosition.offset(stepEl);

                    var newTourtipBottom = tourtipTop + stepElOffset.height + 20;
                    if(newTourtipBottom > windowOffset.height && inScrollView) {
                        var scrollDiff = Math.min(newTourtipBottom - windowOffset.height, scrollView.__maxScrollTop);
                        $ionicScrollDelegate.scrollBy(0, scrollDiff, true);

                        // Refresh tourtip position:
                        stepEl.css({top: tourtipTop - scrollDiff});
                    }

                    // TODO: maybe do top or bottom half calculation and get the at from it.

                }, 1);
            }
        }
    };
}]);
