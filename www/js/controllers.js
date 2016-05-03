angular.module('app.controllers', [])

    .controller('TagCtrl', function ($scope) {

        $scope.devices = [];

        $scope.connected = false;

        var barometer = {
            service: "F000AA40-0451-4000-B000-000000000000",
            data: "F000AA41-0451-4000-B000-000000000000",
            notification: "F0002902-0451-4000-B000-000000000000",
            configuration: "F000AA42-0451-4000-B000-000000000000",
            period: "F000AA43-0451-4000-B000-000000000000"
        };

        function onDiscoverDevice(device) {
            console.log(device);
            $scope.devices.push(device);
        }

        function getLastCon() {
            return localStorage.getItem("lastCon");
        }

        function setLastCon(deviceId) {
            localStorage.setItem("lastCon", deviceId);
        }


        function sensorBarometerConvert(data) {
            return (data / 100);
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
            alert("ERROR: " + reason);
        }

        function onBarometerData(data) {
            console.log(data);
            var message;
            var a = new Uint8Array(data);


            $scope.barometer.temperature = app.sensorBarometerConvert(a[0] | (a[1] << 8) | (a[2] << 16)) + "°C";
            $scope.barometer.pressure = app.sensorBarometerConvert(a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa";
            //0-2 Temp
            //3-5 Pressure
            message =


                barometerData.innerHTML = message;

        }
        function disconnect() {
            $scope.connected = false;
            ble.disconnect($scope.deviceId, null, onError);
        }

        $scope.refreshSensortags = function () {
            ble.scan([], 5, onDiscoverDevice, onError);
        }

        $scope.connect = function (deviceId) {

console.log(deviceId);
            var onConnect = function () {
                $scope.connected = true;
                //Subscribe to barometer service
                ble.startNotification(deviceId, barometer.service, barometer.data, onBarometerData, onError);

                //Turn on barometer
                var barometerConfig = new Uint8Array(1);
                barometerConfig[0] = 0x01;
                ble.write(deviceId, barometer.service, barometer.configuration, barometerConfig.buffer,
                    function () { console.log("Started barometer."); }, onError);
            };

            // Save deviceId as last connected one
            setLastCon(deviceId);

            $scope.deviceId = deviceId;

            ble.connect(deviceId, onConnect, onError);

        };

        ble.scan([], 1, oldConnection, onError);

    });