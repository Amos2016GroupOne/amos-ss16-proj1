angular.module('app.controllers', [])

    // Controller for Tag View
    .controller('TagCtrl', function ($scope) {
/*
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

        function getLastCon() {
            return localStorage.getItem("lastCon");
        }

        function setLastCon(deviceId) {
            localStorage.setItem("lastCon", deviceId);
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


        $scope.close = function (address) {
            var params = { address: address };

            Log.add("Close : " + JSON.stringify(params));

            $cordovaBluetoothLE.close(params).then(function (obj) {
                Log.add("Close Success : " + JSON.stringify(obj));
            }, function (obj) {
                Log.add("Close Error : " + JSON.stringify(obj));
            });

            var device = $scope.devices[address];
            device.services = {};
        };

        $scope.connect = function (device) {

            var onConnect = function (obj) {
                
                Log.add("Connect Success : " + JSON.stringify(obj));
                // Save deviceId as last connected one
                setLastCon(device.address);
                $scope.$apply(function () {
                    $scope.connected = true;
                    $scope.currentDevice = device;
                });
                //Subscribe to barometer service
                ble.startNotification(deviceId, barometer.service, barometer.data, onBarometerData, onError);

                //Turn on barometer
                var barometerConfig = new Uint8Array(1);
                barometerConfig[0] = 0x01;
                ble.write(deviceId, barometer.service, barometer.configuration, barometerConfig.buffer,
                    function () { console.log("Started barometer."); }, onError);
            };
            var params = { address: device.address, timeout: 10000 };

            Log.add("Connect : " + JSON.stringify(params));

            $cordovaBluetoothLE.connect(params).then(null, function (obj) {
                Log.add("Connect Error : " + JSON.stringify(obj));
                $scope.close(params.address); //Best practice is to close on connection error
            },  onConnect);

        };

        $scope.startScan = function () {
            var params = {
                services: [],
                allowDuplicates: false,
                scanTimeout: 5000
            };

            if (window.cordova) {
                params.scanMode = bluetoothle.SCAN_MODE_LOW_POWER;
                params.matchMode = bluetoothle.MATCH_MODE_STICKY;
                params.matchNum = bluetoothle.MATCH_NUM_ONE_ADVERTISEMENT;
                //params.callbackType = bluetoothle.CALLBACK_TYPE_FIRST_MATCH;
            }

            Log.add("Start Scan : " + JSON.stringify(params));

            $cordovaBluetoothLE.startScan(params).then(function (obj) {
                Log.add("Start Scan Auto Stop : " + JSON.stringify(obj));
                $scope.firstScan = false;
            }, function (obj) {
                Log.add("Start Scan Error : " + JSON.stringify(obj));
                $scope.firstScan = false;
            }, function (device) {
                Log.add("Start Scan Success : " + JSON.stringify(device));

                if (device.status == "scanStarted") return;

                $scope.devices[device.address] = device;

                if (device.address == getLastCon() && $scope.firstScan) {
                    $scope.connect(device);
                    $scope.firstScan = false;
                }
            });
        };

        $scope.firstScan = true;
                $rootScope.$on("bleEnabledEvent", function () {
            $scope.startScan();
        })
        */
    })
    // Controller for Settings
    .controller('SettingsCtrl', function ($scope) {
   
    });
