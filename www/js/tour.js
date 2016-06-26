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

.directive('uiTour', ['$timeout', '$parse', '$window', '$compile', function($timeout, $parse, $window, $compile){
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

      var detachedStep = null;
      // Show step
      function showStep(stepNumber) {
        var elm, at, children = $element.children().removeClass('active');
        if (detachedStep) {
            detachedStep.removeClass('active');
            detachedStep.detach();
            // TODO: Hope for clever garbage collection ;)
            detachedStep = null;
        }

        elm = children.eq(stepNumber - 1);
        if (stepNumber && elm.length) {
          at = elm.attr('at');
          elm = elm.clone();
          $timeout(function(){
            var target = angular.element(elm.attr('target'))[0];


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
            offset = {};

            // The element in which the Tourtip is appended.
            var anchor = $('.scroll');

            //offset.top = target.offsetTop;
            offset.top = $(target).offset().top - anchor.offset().top;
            //offset.left = target.offsetLeft;

            elm.addClass('active');

            if (at.indexOf('top') > -1) {
              offset.top -= elm[0].offsetHeight;
            } else {
              offset.top += target.offsetHeight;
            }             //if (at.indexOf('left') > -1) {
              //offset.left -= elm[0].offsetWidth;
            //} else if (at.indexOf('right') > -1) {
              //offset.left += target.offsetWidth;
            //} else {
              //offset.left += target.offsetWidth / 2 - elm[0].offsetWidth / 2;
            //}

            //offset.left = $window.innerWidth / 2;
            elm.css(offset);
            elm.find('.arrow').css({left: (target.offsetWidth / 2 + target.offsetLeft - elm[0].offsetLeft)});

            // Adding the element does not work as relative styling will break.
            detachedStep = elm.appendTo(anchor);
            $compile(detachedStep)($scope);
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
