angular.module('app.controllers', [])

    // Controller for Tag View
    .controller('TagCtrl', function ($scope) {

        $scope.devices = [];

        $scope.connected = false;
        $scope.currentDevice = null;
        $scope.barometer = { temperature: "FREEZING HELL", pressure: "Inside of Jupiter" };

        var barometer = {
            service: "F000AA40-0451-4000-B000-000000000000",
            data: "F000AA41-0451-4000-B000-000000000000",
            notification: "F0002902-0451-4000-B000-000000000000",
            configuration: "F000AA42-0451-4000-B000-000000000000",
            period: "F000AA43-0451-4000-B000-000000000000"
        };

        function onDiscoverDevice(device) {
            $scope.devices.push(device);
        }

        function getLastCon() {
            return localStorage.getItem("lastCon");
        }

        function setLastCon(deviceId) {
            localStorage.setItem("lastCon", deviceId);
        }

        function oldConnection(device) {
            //if(device.id == "B0:B4:48:D2:EC:03")
            if (device.id == getLastCon()) {
                $scope.connect(device.id);
            }

            // Make the List on Startup-Page
            onDiscoverDevice(device);
        }

        function onError(reason) {
            console.log("ERROR: " + reason);
        }

        function onBarometerData(data) {
            var message;
            var a = new Uint8Array(data);

            function sensorBarometerConvert(data) {
                return (data / 100);
            }

            $scope.$apply(function () {
                $scope.barometer.temperature = sensorBarometerConvert(a[0] | (a[1] << 8) | (a[2] << 16)) + "°C";
                $scope.barometer.pressure = sensorBarometerConvert(a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa";
            });
        }

        $scope.disconnect = function () {
            $scope.connected = false;
            ble.disconnect($scope.deviceId, null, onError);
        }

        $scope.refreshSensortags = function () {
            $scope.devices = [];
            ble.scan([], 10, onDiscoverDevice, onError);
        }

        $scope.connect = function (deviceId) {

            console.log(deviceId);
            var onConnect = function () {
                // Save deviceId as last connected one
                setLastCon(deviceId);
                $scope.$apply(function () {
                    $scope.connected = true;
                    $scope.deviceId = deviceId;
                });
                //Subscribe to barometer service
                ble.startNotification(deviceId, barometer.service, barometer.data, onBarometerData, onError);

                //Turn on barometer
                var barometerConfig = new Uint8Array(1);
                barometerConfig[0] = 0x01;
                ble.write(deviceId, barometer.service, barometer.configuration, barometerConfig.buffer,
                    function () { console.log("Started barometer."); }, onError);
            };
            ble.connect(deviceId, onConnect, onError);

        };

        ble.scan([], 10, oldConnection, onError);

    });
