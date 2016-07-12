/*
 * Projectname: amos-ss16-proj1
 *
 * Copyright (c) 2016 de.fau.cs.osr.amos2016.gruppe1
 *
 * This file is part of the AMOS Project 2016 @ FAU
 * (Friedrich-Alexander University Erlangen-Nürnberg)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/>.
 *
 */


// Controller for Tag View
angular.module('app.controllers')
.controller('TagCtrl', function($scope, $rootScope, $q, $cordovaBluetoothLE, $ionicPlatform, $cordovaDeviceMotion, $cordovaSQLite, Log, settings, dataStorage, $translate) {
    $scope.devices = {};
    $scope.scanDevice = false;
    $scope.noDevice = true;
    $scope.dev1Connected = false;
    $scope.dev2Connected = false;
    $scope.currentDevice1 = null;
    $scope.currentDevice2 = null;
    $scope.firstScan = true;
    $scope.barometer = {
        temperatureDev1: "FREEZING HELL", pressureDev1: "Inside of Jupiter",
        temperatureDev2: "FREEZING HELL", pressureDev2: "Inside of Jupiter"
    };
    $scope.accelerometer = {
        accelerometerDev1: "", accelerometerDev2: ""
    };
    $scope.motionOn = false;
    $rootScope.connectedTime = -1;
    
    // Create Database for Graph. Better in service.. but no native plugins in service possible
    // Mock database for browser testing:
    $rootScope.db = {
        transaction: function() {
            console.log('Mocking db transaction');
        }
    };
    $ionicPlatform.ready(function() {
        //dataStorage.storeData_graph("" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(), acc[3], acc[4], acc[5]);
        initDB();
        initDataStorage();
    });

    function initDB()
    {
        // On Phone: all okay
        if(window.cordova) {
            $rootScope.db = $cordovaSQLite.openDB({name: "my.db", iosDatabaseLocation: 'default'});
        }
        else { // Without a phone (e.g. ionic serve)
            db = openDatabase("my.db", '1.0', "My WebSQL Database", 2 * 1024 * 1024);
        }

        $cordovaSQLite.execute($scope.db, "CREATE TABLE IF NOT EXISTS graph (id integer primary key, time text, x integer, y integer, z integer)");
    }

    // Get data from sql and store in service
    function initDataStorage()
    {
        var var_dataStorage = {};
        var_dataStorage["accelerometer-time"] = [];
        var_dataStorage["accelerometer-x"] = [];
        var_dataStorage["accelerometer-y"] = [];
        var_dataStorage["accelerometer-z"] = [];

        var query = "SELECT time, x, y, z FROM graph ORDER BY id ASC";
        $cordovaSQLite.execute($scope.db, query).then(function(res) {
            if(res.rows.length > 0) {
                for(var i = 0; i < res.rows.length; i++) {
                    var_dataStorage["accelerometer-x"].push(res.rows.item(i).x);
                    var_dataStorage["accelerometer-y"].push(res.rows.item(i).y);
                    var_dataStorage["accelerometer-z"].push(res.rows.item(i).z);
                    var_dataStorage["accelerometer-time"].push(res.rows.item(i).time);
                }

                // Initialize the service-datastore with persistent data
                dataStorage.swapData(var_dataStorage["accelerometer-time"], var_dataStorage["accelerometer-x"], var_dataStorage["accelerometer-y"], var_dataStorage["accelerometer-z"]);
            }
        }, function (err) {
            console.error(err);
        });
    }


    var barometer = {
        service: "F000AA40-0451-4000-B000-000000000000",
        data: "F000AA41-0451-4000-B000-000000000000",
        notification: "F0002902-0451-4000-B000-000000000000",
        configuration: "F000AA42-0451-4000-B000-000000000000",
        period: "F000AA43-0451-4000-B000-000000000000"
    };

    var accelerometer = {
        service: "F000AA80-0451-4000-B000-000000000000",
        data: "F000AA81-0451-4000-B000-000000000000",  // Read 3 bytes X, Y, Z
        notification: "F0002902-0451-4000-B000-000000000000",
        configuration: "F000AA82-0451-4000-B000-000000000000",
        period: "F000AA83-0451-4000-B000-000000000000"
    };

    function getLastCon() {
        return localStorage.getItem("lastCon");
    }

    function setLastCon(deviceId) {
        localStorage.setItem("lastCon", deviceId);
    }

    $scope.startScan = function() {
        var params = {
            services: [],
            allowDuplicates: false,
            scanTimeout: settings.settings.duration * 1000
        };

        if (window.cordova) {
            params.scanMode = bluetoothle.SCAN_MODE_LOW_POWER;
            params.matchMode = bluetoothle.MATCH_MODE_STICKY;
            params.matchNum = bluetoothle.MATCH_NUM_ONE_ADVERTISEMENT;
            //params.callbackType = bluetoothle.CALLBACK_TYPE_FIRST_MATCH;
        }

        // Function to start scan for devices.
        // This function populates th $scope.devices variable on results.
        function startScan() {
            Log.add("Start Scan : " + JSON.stringify(params));
            $cordovaBluetoothLE.startScan(params).then(function(obj) {
                Log.add("Start Scan Auto Stop : " + JSON.stringify(obj));
                $scope.firstScan = false;
                $scope.scanDevice = false;
            }, function(obj) {
                Log.add("Start Scan Error : " + JSON.stringify(obj));
            }, function(device) {
                Log.add("Start Scan Success : " + JSON.stringify(device));


                if (device.status == "scanStarted") {
                    $scope.scanDevice = true;
                    return;
                }

                $scope.noDevice = false;
                $scope.devices[device.address] = device;
                $scope.devices[device.address].services = {};
                console.log(JSON.stringify($scope.devices));

                if (device.address == getLastCon() && $scope.firstScan) {
                    $scope.connect(device);
                    $scope.firstScan = false;
                }
            })
        };

        // This function is used to subscribe to the barometer service and activate it on the passed device.
        // It returns a promise that is resolved on sucessful subscription and activation
        // The promise returned is rejected if any error occurs.
        // This approach is needed when subscribing to multple services as multiple writes in short succession will fail.
        $scope.subscribeBarometer = function (device) {
            var deferred = $q.defer();

            // Subscribe to barometer service
            var barometerParams = {
                address: device.address,
                service: barometer.service,
                characteristic: barometer.data,
                timeout: 5000
            };

            $cordovaBluetoothLE.subscribe(barometerParams).then(function (obj) {
                Log.add("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
            }, function (obj) {
                deferred.reject();
                Log.add("Subscribe Error : " + JSON.stringify(obj));
                navigator.notification.alert("The device is interrupted or out of range! Please move the device closer!");
                $scope.disconnect(device);
            }, function (obj) {
                //Log.add("Subscribe Success : " + JSON.stringify(obj));
                if (obj.status == "subscribedResult") {
                    Log.add("Subscribed Result");

                    $scope.onBarometerData(obj, device);

                    var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
                    Log.add("Subscribe Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
                    Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
                } else if (obj.status == "subscribed") {
                    Log.add("Subscribed");
                    // Turn on barometer
                    var barometerConfig = new Uint8Array(1);
                    barometerConfig[0] = 0x01;
                    var params = {
                        address: device.address,
                        service: barometer.service,
                        characteristic: barometer.configuration,
                        value: $cordovaBluetoothLE.bytesToEncodedString(barometerConfig),
                        timeout: 5000
                    };

                    $cordovaBluetoothLE.write(params).then(function (obj) {
                        Log.add("Write Success : " + JSON.stringify(obj));
                        deferred.resolve();
                    }, function (obj) {
                        deferred.reject();
                        Log.add("Write Error : " + JSON.stringify(obj));
                    });

                    Log.add("Write : " + JSON.stringify(params));


                } else {
                    Log.add("Unexpected Subscribe Status");
                }
            });
            return deferred.promise;
        };

        // This function is used to subscribe to the accelerometer service and activate it on the passed device.
        // It returns a promise that is resolved on sucessful subscription and activation
        // The promise returned is rejected if any error occurs.
        // This approach is needed when subscribing to multple services as multiple writes in short succession will fail.

        $scope.subscribeAccelerometer = function (device) {
            var deferred = $q.defer();
            // Subscribe to accelerometer service
            var accelerometerParams = {
                address: device.address,
                service: accelerometer.service,
                characteristic: accelerometer.data,
                timeout: 5000
            };

            Log.add("Subscribe : " + JSON.stringify(accelerometerParams));

            $cordovaBluetoothLE.subscribe(accelerometerParams).then(function (obj) {
                Log.add("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
            }, function (obj) {
                Log.add("Subscribe Error : " + JSON.stringify(obj));
                deferred.reject();
            }, function (obj) {
                //Log.add("Subscribe Success : " + JSON.stringify(obj));

                if (obj.status == "subscribedResult") {
                    Log.add("Subscribed Result");
                    $scope.onAccelerometerData(obj, device);

                    var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
                    Log.add("Subscribe Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
                    Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
                } else if (obj.status == "subscribed") {
                    Log.add("Subscribed");

                    // Turn on accelerometer
                    var accelerometerConfig = new Uint8Array(2);
                    accelerometerConfig[0] = 0x7F;
                    accelerometerConfig[1] = 0x00;

                    var params = {
                        address: device.address,
                        service: accelerometer.service,
                        characteristic: accelerometer.configuration,
                        value: $cordovaBluetoothLE.bytesToEncodedString(accelerometerConfig),
                        timeout: 5000
                    };

                    $cordovaBluetoothLE.write(params).then(function (obj) {
                        Log.add("Write Success : " + JSON.stringify(obj));
                        var periodConfig = new Uint8Array(1);
                        periodConfig[0] = 0x64;
                        var params = {
                            address: device.address,
                            service: accelerometer.service,
                            characteristic: accelerometer.period,
                            value: $cordovaBluetoothLE.bytesToEncodedString(periodConfig),
                            timeout: 5000
                        };


                        Log.add("Write : " + JSON.stringify(params));

                        $cordovaBluetoothLE.write(params).then(function (obj) {
                            Log.add("Write Success : " + JSON.stringify(obj));
                            deferred.resolve();
                        }, function (obj) {
                            Log.add("Write Error : " + JSON.stringify(obj));
                            deferred.reject();
                        });
                    }, function (obj) {
                        Log.add("Write Error : " + JSON.stringify(obj));
                        deferred.reject();
                    });


                } else {
                    Log.add("Unexpected Subscribe Status");
                }
            });
            return deferred.promise;
        }
        // Android 6 requires the locaton to be enabled. Therefore check this and query the user to enable it.
        // This has no effect on Android 4 and 5 and iOS
        $cordovaBluetoothLE.isLocationEnabled().then(function(obj) {
            console.log(JSON.stringify(obj));
            if (obj.isLocationEnabled) {
                startScan();
            }
            else {
                navigator.notification.confirm($translate.instant("PROMPT.ENABLE_LOCATION_SERVICE"), function(buttonIndex) {
                    if (buttonIndex == 1) {
                        $cordovaBluetoothLE.requestLocation().then(function(obj) {
                            console.log(JSON.stringify(obj));
                            if (obj.requestLocation) {
                                startScan();
                            }
                            else {
                                navigator.notification.alert($translate.instant("PROMPT.SCANNING_ONLY_WORKS_WITH_LOCATION_SERVICE"), null);
                            }
                        }, null);
                    } else if (buttonIndex == 0 || buttonIndex == 2) {
                        navigator.notification.alert($translate.instant("PROMPT.SCANNING_ONLY_WORKS_WITH_LOCATION_SERVICE"), null);
                    }
                }, $translate.instant("PROMPT.HEADER_ENABLE_BT"), [$translate.instant("PROMPT.ACCEPT"), $translate.instant("PROMPT.CANCEL")]);
            }
        }, function(err)
        {
            // We are probably on IOS need to explicitly check it
            console.log(JSON.stringify(err))
                startScan();
        });
    };

    $scope.connect = function(device) {

            $scope.stopScan();

        var onConnect = function(obj) {
            
            //when the device is connected, get the time when the device is connected
            $scope.startTime();
            
            Log.add("StartTime: " + $rootScope.connectedTime);
            
            if ($scope.dev1Connected && $scope.dev2Connected) {
                navigator.notification.alert($translate.instant("PROMPT.CONNECT_MORE_THAN_TWO_DEVICES"), function() { });
                return;
            }

            Log.add("Connect Success : " + JSON.stringify(obj));
            // Save deviceId as last connected one
            setLastCon(device.address);

            if ($scope.dev1Connected == false) {
                $scope.dev1Connected = true;
                $scope.currentDevice1 = device;
                $scope.barometer.temperatureDev1 = "FREEZING HELL";
                $scope.barometer.pressureDev1 = "Inside of Jupiter";
                $scope.accelerometer.accelerometerDev1 = "TEST";
            } else {
                $scope.dev2Connected = true;
                $scope.currentDevice2 = device;
                $scope.barometer.temperatureDev2 = "FREEZING HELL";
                $scope.barometer.pressureDev2 = "Inside of Jupiter";
            }

            // First subscribe to the barometer. After that subscribe to the accelerometer.
            $scope.subscribeBarometer(device).then(function() { $scope.subscribeAccelerometer(device) }, function() { $scope.subscribeAccelerometer(device) });

        };
        var params = { address: device.address, timeout: 10000 };

        Log.add("Connect : " + JSON.stringify(params));

        $cordovaBluetoothLE.connect(params).then(null, function(obj) {
            Log.add("Connect Error : " + JSON.stringify(obj));
            navigator.notification.alert($translate.instant("PROMPT.CONNECTION_FAILED"), null);
            $scope.close(params.address);  // Best practice is to close on connection error
        }, function() {
            $scope.discover(device.address, onConnect);
        });

    };

    $scope.refreshSensortags = function() {
        console.log("This function is being called");
        $scope.devices = {};
        $scope.startScan();
        $scope.noDevice = true;
    }

    $scope.stopScan = function() {
        $scope.scanDevice = false;
        $scope.firstScan = false;
        $cordovaBluetoothLE.stopScan().then(function(obj) {
            Log.add("Stop Scan Success : " + JSON.stringify(obj));
        }, function(obj) {
            Log.add("Stop Scan Error : " + JSON.stringify(obj));
        });
    }

    $scope.close = function(address) {
        var params = { address: address };

        Log.add("Close : " + JSON.stringify(params));

        $cordovaBluetoothLE.close(params).then(function(obj) {
            Log.add("Close Success : " + JSON.stringify(obj));
            Log.add("Connected Time: " + $rootScope.connectedTime);
        }, function(obj) {
            Log.add("Close Error : " + JSON.stringify(obj));
        });

        var device = $scope.devices[address];
        device.services = {};
    };

    $scope.onBarometerData = function(obj,device) {
        var a = $cordovaBluetoothLE.encodedStringToBytes(obj.value);

        function sensorBarometerConvert(data) {
            return (data / 100);
        }

        if ($scope.currentDevice1.address == device.address) {
            $scope.barometer.temperatureDev1 = sensorBarometerConvert(a[0] | (a[1] << 8) | (a[2] << 16)) + "°C";
            $scope.barometer.pressureDev1 = sensorBarometerConvert(a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa";
        } else if ($scope.currentDevice2.address == device.address) {
            $scope.barometer.temperatureDev2 = sensorBarometerConvert(a[0] | (a[1] << 8) | (a[2] << 16)) + "°C";
            $scope.barometer.pressureDev2 = sensorBarometerConvert(a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa";
        } else {
            Log.add("onBarometerData: no matching device" + JSON.stringify(device.address));
        }
    }

    $scope.onAccelerometerData = function(obj,device) {
        var acc = $cordovaBluetoothLE.encodedStringToBytes(obj.value);

        function sensorAccelerometerConvert(data) {
            var a = data / (32768 / 2);
            return a;
        }

        function convertAllData(data)
        {
            // Convert the data to 16 bit. the data consist of 2bytes.
            var converted = [];
            var b = new Int16Array(9);

            for(i = 0; i < 18; i += 2)
            {
                b[i/2] = (data[i]) | (data[i+1] << 8);
                //console.log("B " + i/2 + " is now " + b[i/2]);
            }

            for(i = 0; i < 9; i++)
            {
                converted.push(sensorAccelerometerConvert(b[i]));
            }
            return converted;
        }

        console.log("Convert all data!");

        acc = convertAllData(acc);

        var date = new Date();
        var time = "" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();



        // Save persistent (ugly workaround)
        $ionicPlatform.ready(function() {

            // Save data persistent
            var query = "INSERT INTO graph (time, x, y, z) VALUES (?,?,?,?)";
            $cordovaSQLite.execute($scope.db, query, [time, acc[3], acc[4], acc[5]]).then(function(res) {
                console.log("INSERT ID -> " + res.insertId);
            }, function (err) {
                console.error(err);
            });
        });

        $rootScope.$broadcast("newAccelerometerData");

        if ($scope.currentDevice1.address == device.address) {
            $scope.accelerometer.accelerometerDev1 = "X: " + acc[3] + ", " +
                "Y: " + acc[4] + ", " +
                "Z: " + acc[5] * -1;
                dataStorage.storeData("accelerometer-x", acc[3]);
                dataStorage.storeData("accelerometer-y", acc[4]);
                dataStorage.storeData("accelerometer-z", acc[5]);
                dataStorage.storeData("accelerometer-time", time);
        } else if($scope.currentDevice2.address == device.address) {
            $scope.accelerometer.accelerometerDev2 = "X: " + acc[3] + ", " +
                "Y: " + acc[4] + ", " +
                "Z: " + acc[5] * -1;
                dataStorage.storeData("accelerometer-2-x", acc[3]);
                dataStorage.storeData("accelerometer-2-y", acc[4]);
                dataStorage.storeData("accelerometer-2-z", acc[5]);
                dataStorage.storeData("accelerometer-2-time", time);
        } else {
            Log.add("onAccelerometerData: no matching device" + JSON.stringify(device.address));
        }

    }

    $scope.disconnect = function(device) {
            
        $rootScope.connectedTime = -1;
 
        if ($scope.dev1Connected && $scope.currentDevice1.address == device.address) {
            $scope.dev1Connected = false;
            $scope.close($scope.currentDevice1.address);
        } else if ($scope.dev2Connected && $scope.currentDevice2.address == device.address) {
            $scope.dev2Connected = false;
            $scope.close($scope.currentDevice2.address);
        }
    }

    $scope.isConnected = function(device) {
        if ($scope.dev1Connected && $scope.currentDevice1.address == device.address) {
            return true;
        } else if ($scope.dev2Connected && $scope.currentDevice2.address == device.address) {
            return true;
        } else {
            return false;
        }
    }

    $scope.discover = function(address, afterFunction) {
        var params = {
            address: address,
            timeout: 10000
        };

        Log.add("Discover : " + JSON.stringify(params));

        $cordovaBluetoothLE.discover(params).then(function(obj) {
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
        }, function(obj) {
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
    if (settings.settings.reconnect == "true" || settings.settings.reconnect === true) {
        $scope.firstScan = true;

    }

    $rootScope.$on("bleEnabledEvent", function() {
        console.log("BLE Enabled Event");
        $scope.startScan();
    });



    // watch Acceleration options
    $scope.options = {
        frequency: 100,  // Measure every 100ms
        deviation : 25   // We'll use deviation to determine the shake event, best values in the range between 25 and 30
    };

    // Current measurements
    $scope.measurements = {
        x : null,
        y : null,
        z : null,
        timestamp : null
    }

    // Previous measurements
    $scope.previousMeasurements = {
        x : null,
        y : null,
        z : null,
        timestamp : null
    }

    // Watcher object
    $scope.watch = null;

    // Start measurements when Cordova device is ready
    $ionicPlatform.ready(function() {

        // Start Watching method
        $scope.startWatching = function() {

            $scope.motionOn = true;

            // Device motion configuration
            $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);

            // Device motion initilaization
            $scope.watch.then(null, function(error) {
                console.log('Error');
            },function(result) {

                // Set current data
                $scope.measurements.x = result.x.toFixed(2);
                $scope.measurements.y = result.y.toFixed(2);
                $scope.measurements.z = result.z.toFixed(2);
                //$scope.motion.timestamp = result.timestamp;

                // Detect a shake
                $scope.detectShake(result);

            });
        };

        // Stop watching method
        $scope.stopWatching = function() {
            $scope.watch.clearWatch();
            $scope.motionOn = false;
        }

        // Detect shake method
        $scope.detectShake = function(result) {

            // Object to hold measurement difference between current and old data
            var measurementsChange = {};

            // Calculate measurement change only if we have two sets of data, current and old
            if ($scope.previousMeasurements.x !== null) {
                measurementsChange.x = Math.abs($scope.previousMeasurements.x, result.x);
                measurementsChange.y = Math.abs($scope.previousMeasurements.y, result.y);
                measurementsChange.z = Math.abs($scope.previousMeasurements.z, result.z);
            }

            // If measurement change is bigger then predefined deviation
            if (measurementsChange.x + measurementsChange.y + measurementsChange.z > $scope.options.deviation) {
                $scope.stopWatching();  // Stop watching because it will start triggering like hell
                console.log('Shake detected'); // shake detected
                setTimeout($scope.startWatching(), 1000);  // Again start watching after 1 sex

                // Clean previous measurements after succesfull shake detection, so we can do it next time
                $scope.previousMeasurements = {
                    x: null,
                    y: null,
                    z: null
                }

            } else {
                // On first measurements set it as the previous one
                $scope.previousMeasurements = {
                    x: result.x,
                    y: result.y,
                    z: result.z
                }
            }

        }
    });
            
    //It will set the connected time in seconds format
    $rootScope.startTime = function() {
        var time = new Date;
        $rootScope.connectedTime = time.getTime() / 1000;
    }
            
})
