
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