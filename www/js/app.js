var helloWorldModule = angular.module('helloWorld', []);

helloWorldModule.controller('HelloController', function() {
     this.hello = "Hello From Controller";
});