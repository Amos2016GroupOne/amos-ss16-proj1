angular.module('app.controllers')
.controller('TourCtrl', function($scope) {
    $scope.test = function() {
        $scope.openTour();
    console.log($scope);
    };


});
