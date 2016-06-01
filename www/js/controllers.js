angular.module('app.controllers', [])
    // Controller for Tag View
    .controller('TagCtrl', function($scope, $rootScope, $cordovaBluetoothLE, Log, settings, dataStorage) {
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

        var barometer = {
            service: "F000AA40-0451-4000-B000-000000000000",
            data: "F000AA41-0451-4000-B000-000000000000",
            notification: "F0002902-0451-4000-B000-000000000000",
            configuration: "F000AA42-0451-4000-B000-000000000000",
            period: "F000AA43-0451-4000-B000-000000000000"
        };
        var accelerometer = {
                service: "F000AA80-0451-4000-B000-000000000000",
                data: "F000AA81-0451-4000-B000-000000000000", // read 3 bytes X, Y, Z
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

            // Android 6 requires the locaton to be enabled. Therefore check this and query the user to enable it.
            // This has no effect on Android 4 and 5 and iOS
            $cordovaBluetoothLE.isLocationEnabled().then(function(obj) {
                console.log(JSON.stringify(obj));
                if (obj.isLocationEnabled) {
                    startScan();
                }
                else {
                    navigator.notification.confirm("To scan for devices you need to enable location services. Do you want to do that now?", function(buttonIndex) {
                        if (buttonIndex == 1) {
                            $cordovaBluetoothLE.requestLocation().then(function(obj) {
                                console.log(JSON.stringify(obj));
                                if (obj.requestLocation) {
                                    startScan();
                                }
                                else {
                                    navigator.notification.alert("Sorry. Scanning only works with location services enabled.", null);
                                }
                            }, null);
                        } else if (buttonIndex == 0 || buttonIndex == 2) {
                            navigator.notification.alert("Sorry. Scanning only works with location services enabled.", null);
                        }
                    }, "Enable Bluetooth", ["Accept", "Cancel"]);
                }
            }, function(err)
               {
                 // We are probably on IOS need to explicitly check it
                 console.log(JSON.stringify(err))
                 startScan();
               });
        };

        $scope.connect = function(device) {

            var onConnect = function(obj) {

                if ($scope.dev1Connected && $scope.dev2Connected) {
                    navigator.notification.alert("Sorry. You cannot connect to more than two devices!", function() { });
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

                //Subscribe to barometer service
                var params = {
                    address: device.address,
                    service: barometer.service,
                    characteristic: barometer.data,
                    timeout: 5000
                };

                //Subscribe to accelerometer service
                var params = {
                address: device.address,
                service: accelerometer.service,
                characteristic: accelerometer.data,
                timeout: 5000
                };

                Log.add("Subscribe : " + JSON.stringify(params));

                $cordovaBluetoothLE.subscribe(params).then(function(obj) {
                    Log.add("Subscribe Auto Unsubscribe : " + JSON.stringify(obj));
                }, function(obj) {
                    Log.add("Subscribe Error : " + JSON.stringify(obj));
                }, function(obj) {
                    //Log.add("Subscribe Success : " + JSON.stringify(obj));

                    if (obj.status == "subscribedResult") {
                        //Log.add("Subscribed Result");
                        //onBarometerData(obj, device);
                        onAccelerometerData(obj, device);
                        var bytes = $cordovaBluetoothLE.encodedStringToBytes(obj.value);
                        Log.add("Subscribe Success ASCII (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToString(bytes));
                        Log.add("HEX (" + bytes.length + "): " + $cordovaBluetoothLE.bytesToHex(bytes));
                    } else if (obj.status == "subscribed") {
                        Log.add("Subscribed");
                        //Turn on barometer
                        /*var barometerConfig = new Uint8Array(1);
                        barometerConfig[0] = 0x01;
                        var params = {
                            address: device.address,
                            service: barometer.service,
                            characteristic: barometer.configuration,
                            value: $cordovaBluetoothLE.bytesToEncodedString(barometerConfig),
                            timeout: 5000
                        };

                        $cordovaBluetoothLE.write(params).then(function(obj) {
                                Log.add("Write Success : " + JSON.stringify(obj));
                                }, function(obj) {
                                Log.add("Write Error : " + JSON.stringify(obj));
                                });*/

                        //Turn on accelerometer
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

                        $cordovaBluetoothLE.write(params).then(function(obj) {
                                    Log.add("Write Success : " + JSON.stringify(obj));
                                    }, function(obj) {
                                    Log.add("Write Error : " + JSON.stringify(obj));
                        });



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

                        $cordovaBluetoothLE.write(params).then(function(obj) {
                            Log.add("Write Success : " + JSON.stringify(obj));
                        }, function(obj) {
                            Log.add("Write Error : " + JSON.stringify(obj));
                        });
                    } else {
                        Log.add("Unexpected Subscribe Status");
                    }
                });


            };
            var params = { address: device.address, timeout: 10000 };

            Log.add("Connect : " + JSON.stringify(params));

            $cordovaBluetoothLE.connect(params).then(null, function(obj) {
                Log.add("Connect Error : " + JSON.stringify(obj));
                 navigator.notification.alert("Connection failed. Please try again.", null);
                $scope.close(params.address); //Best practice is to close on connection error
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
            }, function(obj) {
                Log.add("Close Error : " + JSON.stringify(obj));
            });

            var device = $scope.devices[address];
            device.services = {};
        };

        function onBarometerData(obj, device) {
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

        function onAccelerometerData(obj,device) {
            var acc = $cordovaBluetoothLE.encodedStringToBytes(obj.value);



                function sensorAccelerometerConvert(data) {

                    var a = data / (32768 / 2);
                    return a;
                }

                function convertAllData(data)
                {
                  // convert the data to 16 bit. the data consist of 2bytes.
                  var converted = [];
                  var b = new Uint16Array(6);

                  for(i = 0; i < 12; i++)
                  {
                      console.log("data " + i + " is " + data[i]);
                  }

                  for(i = 0; i < 12; i += 2)
                  {
                      b[i/2] = (data[i] << 8);
                      console.log("B " + i/2 + " is now " + b[i/2]);
                  }

                  for(i = 1; i < 12; i += 2)
                  {
                      b[(i - 1)/2] += (data[i]);
                      console.log("B " + (i-1)/2 + " is now " + b[(i-1)/2]);
                  }

                  for(i = 0; i < 12; i++)
                  {
                      converted.push(sensorAccelerometerConvert(b[i]));
                  }
                  return converted;
                }

                console.log("Convert all data!");

                acc = convertAllData(acc);

                dataStorage.storeData("accelerometer", acc);
                dataStorage.storeData("accelerometer-time", new Date());

                $rootScope.$broadcast("newAccelerometerData");

                if ($scope.currentDevice1.address == device.address) {
                    $scope.accelerometer.accelerometerDev1 = "X: " + acc[3] + ", " +
                                                             "Y: " + acc[4] + ", " +
                                                             "Z: " + acc[5] * -1;
                } else if(scope.currentDevice2.address == device.address) {
                    $scope.accelerometer.accelerometerDev2 = "X: " + acc[3] + ", " +
                                                             "Y: " + acc[4] + ", " +
                                                             "Z: " + acc[5] * -1;
                } else {
                    Log.add("onAccelerometerData: no matching device" + JSON.stringify(device.address));
                }

        }

        $scope.disconnect = function(device) {
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

    })

    // Controller for Settings
    .controller('SettingsCtrl', function($scope, Log, settings) {

        // Link the scope settings to the settings service
        $scope.settings = settings.settings;

        // Scope update function is the settings service persist function
        $scope.update = settings.persistSettings;

		//this is used by the scanduration slider. It adds ' s' to the tooltip of the slider
		$scope.durationSliderLabel = function(value) {
      		return value + ' s';
    	}

		//this is used by the volume slider. It adds '%' to the tooltip of the slider
		$scope.volumeSliderLabel = function(value) {
      		return value + '%';
    	}

        $scope.newVolumeProfileName = "";

        $scope.changedVolume = function() {
            $scope.settings.currentVolumeProfile = false;
            $scope.settings.mute = false;
            $scope.update();
        }

        $scope.addVolumeProfile = function(name) {
            // TODO: no duplicates!
            var newProfile = { name: name, volume: $scope.settings.volume };
            $scope.settings.volumeProfiles.push(newProfile);
            $scope.settings.currentVolumeProfile = newProfile;
            $scope.newVolumeProfileName = "";  // TODO: has no effect!
        }

        $scope.removeVolumeProfile = function(volumeProfile) {  // TODO
            console.log("removing volume profile " + volumeProfile.name);
            $scope.settings.volumeProfiles = $scope.settings.volumeProfiles.filter(function(item) {
                return item.name !== volumeProfile.name;
            });
        }

        $scope.changeVolumeProfile = function() {
            $scope.settings.volume = JSON.parse($scope.settings.currentVolumeProfile).volume;
            $scope.update();
        }

        //called when mute was toggled by pressing the button
        $scope.muteToggle = function() {
            if (settings.settings.mute) {
                settings.settings.volBeforeMute = settings.settings.volume;
                settings.settings.volume = parseInt(0);
            } else {
                settings.settings.volume = parseInt(settings.settings.volBeforeMute);
            }
            //persist settings
            $scope.update();
        }

        $scope.$on('volumeupbutton', function() {
            $scope.$apply(function() {									// angular doesn't fire $apply on the events so if $broadcast is called outside angular's context, you are going to need to $apply by hand.

                // Update Volume + checks for valid values (0 to 100)
                if (settings.settings.mute) {
                    var vol = parseInt(settings.settings.volBeforeMute);
                } else {
                    // parse to Int or otherwise it is not if changed per GUI
                    var vol = parseInt(settings.settings.volume);
                }
                var up = 10;

                // Catch if volume 91 to 100, update to max 100
                if (vol > 90)
                    up = 100 - vol;
                vol = vol + up;

                settings.settings.volume = vol;
                //unmute as the user changed the volume and persist
                $scope.changedVolume();

            });
        });

        $scope.$on('volumedownbutton', function() {
            $scope.$apply(function() {									// angular doesn't fire $apply on the events so if $broadcast is called outside angular's context, you are going to need to $apply by hand.

                // Update Volume + checks for valid values (0 to 100)
                if (settings.settings.mute) {
                    var vol = parseInt(settings.settings.volBeforeMute);
                } else {
                    // parse to Int or otherwise it is not if changed per GUI
                    var vol = parseInt(settings.settings.volume);
                }
                var down = 10;

                // Catch if volume 9 to 0, update to min 0
                if (vol < 10)
                    down = vol;
                vol = vol - down;

                settings.settings.volume = vol;
                //unmute as the user changed the volume and persist
                $scope.changedVolume();

            });
        });
    })

	// Controller for Settings
    .controller('GraphCtrl', function($scope, Log, settings, dataStorage) {
		$scope.labels = [];
		$scope.series = ['Device'];
		$scope.data = [];

    // Initialize the current start point
    $scope.currentStartPoint = dataStorage.retrieveData("accelerometer").length - 100;

    // If less than 100 data points are available set the startpoint to 0
    if($scope.currentStartPoint < 0) $scope.currentStartPoint = 0;

    // This function extracs a 100 item data slice from the data starting at $scope.currentStartPoint
    // This data slice is set as the chart data.
    function createAndSetDataSlice()
    {
      var start = $scope.currentStartPoint;
      var end = start + 100;

      $scope.data = [];
      $scope.data.push_back(dataStorage.retrieveData("accelerometer").slice(start,end));

      $scope.labels = [];
      $scope.labels.push_back(dataStorage.retrieveData("accelerometer-time").slice(start, end));
    }

    createAndSetDataSlice();

    // If we receive new data then update the graph
    $rootScope.$on("newAccelerometerData", function() {
      // Initialize the current start point
      $scope.currentStartPoint = dataStorage.retrieveData("accelerometer").length - 100;

      // If less than 100 data points are available set the startpoint to 0
      if($scope.currentStartPoint < 0) $scope.currentStartPoint = 0;

      createAndSetDataSlice();
    });

    })

    .controller('TabCtrl', function ($scope, $ionicTabsDelegate) {

        $scope.goForward = function () {
            var selected = $ionicTabsDelegate.selectedIndex();
            if (selected != -1) {
                $ionicTabsDelegate.select(selected + 1);
            }
        }

        $scope.goBack = function () {
            var selected = $ionicTabsDelegate.selectedIndex();
            if (selected != -1 && selected != 0) {
                $ionicTabsDelegate.select(selected - 1);
            }
        }
    });
