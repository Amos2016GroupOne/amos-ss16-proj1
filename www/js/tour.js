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
.directive('uiTour', ['$timeout', '$parse', '$window', '$compile', '$ionicTabsDelegate', '$ionicScrollDelegate', function($timeout, $parse, $window, $compile, $ionicTabsDelegate, $ionicScrollDelegate){
    return {
        link: function($scope, $element, $attributes) {
            var model = $parse($attributes.uiTour);


            // Watch model and change steps
            $scope.$watch($attributes.uiTour, function(newVal, oldVal){
                if (angular.isNumber(newVal)) {
                    showStep(newVal)
                } else {
                    if (angular.isString(newVal)) {
                        var stepNumber = 0,
                            children = $element.children()
                                angular.forEach(children, function(step, index) {
                                    if (angular.element(step).attr('name') === newVal)
                                        stepNumber = index+1;
                                });
                        model.assign($scope, stepNumber);
                    } else {
                        model.assign($scope, newVal && 1 || 0);
                    }
                }
            });

            var oldStep = null;
            // Show step
            function showStep(stepNumber) {
                var elm, at, children = $element.children().removeClass('active');

                if (oldStep) {
                    // Remove old step!
                    oldStep.removeClass('active');
                    oldStep.detach();
                    // TODO: Hope for clever garbage collection ;)
                    oldStep = null;
                }

                elm = children.eq(stepNumber - 1);
                if (stepNumber && elm.length) {
                    // Make a copy of current tourtip that will be shown.
                    elm = elm.clone();

                    at = elm.attr('at');

                    $timeout(function(){

                        // Get id of tab.
                        var targetTabId = parseInt(elm.attr('target-tab'));
                        if (targetTabId !== -2 && $ionicTabsDelegate.selectedIndex() !== targetTabId) {
                            $ionicTabsDelegate.select(targetTabId);

                            // Fire ionic event loop here to let tab change happen, so that all
                            // elements are in right place and the tourtip can be positioned correctly
                            $scope.$digest();
                        }

                        // Since now the tab is changed we have a chance to find the target
                        var target = angular.element(elm.attr('target'))[0];

                        // Make the tool tip visible
                        if (elm.attr('overlay') !== undefined) {
                            $('.tour-overlay').addClass('active').css({
                                marginLeft: target.offsetLeft + target.offsetWidth / 2 - 150,
                                marginTop: target.offsetTop + target.offsetHeight / 2 - 150
                            }).addClass('in');
                        } else {
                            $('.tour-overlay').removeClass('in');
                            setTimeout(function(){
                                $('.tour-overlay').removeClass('active');
                            }, 1000);
                        }
                        elm.addClass('active');

                        // Get the anchor element in which the tourtip is appended.
                        // This leads to smoothly scrolling tooltips.
                        if (target == angular.element('.scroll ' + elm.attr('target'))[0]) {
                            var anchor = $('.scroll');
                            var isInScroll = true;
                        } else {
                            var anchor = $('body');
                        }


                        var relativeTop = $(target).offset().top - anchor.offset().top;
                        if(isInScroll) {
                            // Scroll to element

                            // Get height of highest scroll container.
                            // (Highest is the active one)
                            // TODO: Probably there is a better way to retrieve the scrollable height.
                            var height = 0;
                            $('.scroll').parent().each(function() {
                                height = Math.max(height, $(this).height());
                            });

                            if (relativeTop > height) {
                                $ionicScrollDelegate.scrollBottom(true);
                            } else {
                                $ionicScrollDelegate.scrollTo(relativeTop, $(target).offset().left, true);
                            }
                        }

                        // Insert tourtip in anchor and compile content there
                        elm = elm.appendTo(anchor);
                        elm = $compile(elm)($scope);

                        // Set tourtip position
                        offset = {};
                        offset.top = relativeTop
                        if (at.indexOf('top') > -1) {
                            offset.top -= elm[0].offsetHeight;
                        } else {
                            offset.top += target.offsetHeight;
                        }
                        elm.css(offset);
                        elm.find('.arrow').css({left: (target.offsetWidth / 2 + target.offsetLeft - elm[0].offsetLeft)});
                        oldStep = elm;
                    });
                } else {
                    $('.tour-overlay').removeClass('in');
                    setTimeout(function(){
                        $('.tour-overlay').removeClass('active');
                    }, 1000);
                }
            }
        }
    };
}]);
