angular.module('app.controllers', [])
    // Controller for Tag View
    .controller('TagCtrl', function ($scope, $rootScope, $cordovaBluetoothLE, Log, settings) {
        $scope.devices = {};
        $scope.scanDevice = true;
        $scope.noDevice = true;
        $scope.connected = false;
        $scope.currentDevice = null;
        $scope.firstScan = true;
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

        $scope.startScan = function () {
            var params = {
                services: [],
                allowDuplicates: false,
                scanTimeout: settings.settings.scanDuration * 1000
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
                $scope.scanDevice = false;
            }, function (obj) {
                Log.add("Start Scan Error : " + JSON.stringify(obj));
            }, function (device) {
                Log.add("Start Scan Success : " + JSON.stringify(device));

                if (device.status == "scanStarted") return;

                $scope.noDevice = false;
                $scope.devices[device.address] = device;
                $scope.devices[device.address].services = {};
                console.log(JSON.stringify($scope.devices));

                if (device.address == getLastCon() && $scope.firstScan) {
                    $scope.connect(device);
                    $scope.firstScan = false;
                }
            });
        };

        $scope.connect = function (device) {

            var onConnect = function (obj) {

                Log.add("Connect Success : " + JSON.stringify(obj));
                // Save deviceId as last connected one
                setLastCon(device.address);

                $scope.connected = true;
                $scope.currentDevice = device;

                //Subscribe to barometer service
                var params = {
                    address: device.address,
                    service: barometer.service,
                    characteristic: barometer.data,
                    timeout: 5000
                };

                Log.add("Subscribe : " + JSON.stringify(params));

                $cordovaBluetoothLE.subscribe(params).then(function (obj) {
                    Log.add("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
                }, function (obj) {
                    Log.add("Subscribe Error : " + JSON.stringify(obj));
                }, function (obj) {
                    //Log.add("Subscribe Success : " + JSON.stringify(obj));

                    if (obj.status == "subscribedResult") {
                        //Log.add("Subscribed Result");
                        onBarometerData(obj);
                        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
                        Log.add("Subscribe Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
                        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
                    } else if (obj.status == "subscribed") {
                        Log.add("Subscribed");
                        //Turn on barometer
                        var barometerConfig = new Uint8Array(1);
                        barometerConfig[0] = 0x01;
                        var params = {
                            address: device.address,
                            service: barometer.service,
                            characteristic: barometer.configuration,
                            value: $cordovaBluetoothLE.bytesToEncodedString(barometerConfig),
                            timeout: 5000
                        };

                        Log.add("Write : " + JSON.stringify(params));

                        $cordovaBluetoothLE.write(params).then(function (obj) {
                            Log.add("Write Success : " + JSON.stringify(obj));
                        }, function (obj) {
                            Log.add("Write Error : " + JSON.stringify(obj));
                        });
                    } else {
                        Log.add("Unexpected Subscribe Status");
                    }
                });


            };
            var params = { address: device.address, timeout: 10000 };

            Log.add("Connect : " + JSON.stringify(params));

            $cordovaBluetoothLE.connect(params).then(null, function (obj) {
                Log.add("Connect Error : " + JSON.stringify(obj));
                $scope.close(params.address); //Best practice is to close on connection error
            }, function () {
                $scope.discover(device.address, onConnect);
            });

        };

        $rootScope.$on("bleEnabledEvent", function () {
            $scope.startScan();
        })

        $scope.refreshSensortags = function () {
            $scope.devices = {};
            $scope.startScan();
            $scope.noDevice = true;
            $scope.scanDevice = true;
        }

        $scope.stopScan = function () {
            $scope.scanDevice = false;
            $scope.firstScan = false;
            $cordovaBluetoothLE.stopScan().then(function (obj) {
                Log.add("Stop Scan Success : " + JSON.stringify(obj));
            }, function (obj) {
                Log.add("Stop Scan Error : " + JSON.stringify(obj));
            });
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

        function onBarometerData(obj) {
            var a = $cordovaBluetoothLE.encodedStringToBytes(obj.value);

            function sensorBarometerConvert(data) {
                return (data / 100);
            }

            $scope.barometer.temperature = sensorBarometerConvert(a[0] | (a[1] << 8) | (a[2] << 16)) + "°C";
            $scope.barometer.pressure = sensorBarometerConvert(a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa";
        }

        $scope.disconnect = function () {
            $scope.connected = false;
            $scope.close($scope.currentDevice.address);
        }

        $scope.discover = function (address, afterFunction) {
            var params = {
                address: address,
                timeout: 10000
            };

            Log.add("Discover : " + JSON.stringify(params));

            $cordovaBluetoothLE.discover(params).then(function (obj) {
                Log.add("Discover Success : " + JSON.stringify(obj));

                var device = $scope.devices[obj.address];

                var services = obj.services;

                for (var i = 0; i < services.length; i++) {
                    var service = services[i];

                    addService(service, device);

                    var serviceNew = device.services[service.uuid];

                    var characteristics = service.characteristics;

                    for (var j = 0; j < characteristics.length; j++) {
                        var characteristic = characteristics[j];

                        addCharacteristic(characteristic, serviceNew);

                        var characteristicNew = serviceNew.characteristics[characteristic.uuid];

                        var descriptors = characteristic.descriptors;

                        for (var k = 0; k < descriptors.length; k++) {
                            var descriptor = descriptors[k];

                            addDescriptor(descriptor, characteristicNew);
                        }

                    }
                }
                if (afterFunction != undefined) {
                    afterFunction();
                }
            }, function (obj) {
                Log.add("Discover Error : " + JSON.stringify(obj));
            });
        };
        function addService(service, device) {
            if (device.services[service.uuid] !== undefined) {
                return;
            }
            device.services[service.uuid] = { uuid: service.uuid, characteristics: {} };
        }

        function addCharacteristic(characteristic, service) {
            if (service.characteristics[characteristic.uuid] !== undefined) {
                return;
            }
            service.characteristics[characteristic.uuid] = { uuid: characteristic.uuid, descriptors: {}, properties: characteristic.properties };
        }

        function addDescriptor(descriptor, characteristic) {
            if (characteristic.descriptors[descriptor.uuid] !== undefined) {
                return;
            }
            characteristic.descriptors[descriptor.uuid] = { uuid: descriptor.uuid };
        }

        $scope.firstScan = false;
        if (settings.settings.startReconnect == "true" || settings.settings.startReconnect === true) {
            $scope.firstScan = true;
        }

        $rootScope.$on("bleEnabledEvent", function () {
            $scope.startScan();
        });

    })

    // Controller for Settings
    .controller('SettingsCtrl', function ($scope, settings) {

        // Link the scope settings to the settings service
        $scope.settings = settings.settings;

        // Scope update function is the settings service persist function
        $scope.update = settings.persistSettings;
        //
        $scope.$on('volumeupbutton', function () {
            $scope.$apply(function () {									// angular doesn't fire $apply on the events so if $broadcast is called outside angular's context, you are going to need to $apply by hand.

                // Update Volume + checks for valid values (0 to 100)
                var vol = settings.settings.volume;
                var up = 10;

                // Catch if volume 91 to 100, update to max 100
                if (vol > 90)
                    up = 100 - vol;
                vol = vol + up;

                // Save setting
                settings.setSetting("volume", vol);

                // Initialise GUI with saved setting values
                settings.settings.volume = vol;

            });
        });

        $scope.$on('volumedownbutton', function () {
            $scope.$apply(function () {									// angular doesn't fire $apply on the events so if $broadcast is called outside angular's context, you are going to need to $apply by hand.

                // Update Volume + checks for valid values (0 to 100)
                var vol = settings.settings.volume;
                var down = 10;

                // Catch if volume 9 to 0, update to min 0
                if (vol < 10)
                    down = vol;
                vol = vol - down;

                // Save setting
                settings.setSetting("volume", vol);

                // Initialise GUI with saved setting values
                settings.settings.volume = vol;

            });
        });
    });
