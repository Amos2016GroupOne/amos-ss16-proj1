/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

 /*
 Not 100% stable. More a 80% thing. Need a better check if the device is still available before the app crashes.
 
 How to use:
 cordova platform add android
 cordova run android
 
 */
 
'use strict';

var barometer = {
    service: "F000AA40-0451-4000-B000-000000000000",
    data: "F000AA41-0451-4000-B000-000000000000",
    notification: "F0002902-0451-4000-B000-000000000000",
    configuration: "F000AA42-0451-4000-B000-000000000000",
    period: "F000AA43-0451-4000-B000-000000000000"
};

var app = {
	// Application Constructor
    initialize: function() {
        this.bindEvents();
        devicePage.hidden = true;
    },
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        SensorTagList.addEventListener('touchstart', this.connect, false);
		btnRefresh.addEventListener('touchstart', this.refreshSensorTagList, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);        
    },
    onDeviceReady: function() {
        //check if the device supports Bluetooth Low Energy
        //Android: initPlugin sets the values of BluetoothStatus. It will fail if the BluetoothManager class is not present
        //Android 4.3 is required as earlier versions dont have this class. Also for BTLE support at least Android 4.3 is needed
        cordova.plugins.BluetoothStatus.initPlugin();
        //dirty hack: wait for 1 second as otherwise the hasBTLE will not be set. Moving this into another event also wont work
        setTimeout(function() {
            if(!cordova.plugins.BluetoothStatus.hasBTLE){
                //as hasBTLE defaults to false we can still use it even if initPlugin fails,
                //which should only happen if the device has an Android version below 4.3
                navigator.notification.alert("Sorry. Your device does not support BTLE!", function(){navigator.app.exitApp();});
                return;
            }
        }, 1000);
        // Scan for SensorTags, after startup
        //app.refreshSensorTagList();
    },
	// Update the List of Devices
    refreshSensorTagList: function() {
        SensorTagList.innerHTML = '';
        // scan for all devices. need to put something in ble(['filter']) to scan only for CC2560 SensorTags, not sure what
        ble.scan([], 5, app.onDiscoverDevice, app.onError);
    },
	// Show details of a device
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.id;

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        SensorTagList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId,
            onConnect = function() {

                //Subscribe to barometer service
                ble.startNotification(deviceId, barometer.service, barometer.data, app.onBarometerData, app.onError);

                //Turn on barometer
                var barometerConfig = new Uint8Array(1);
                barometerConfig[0] = 0x01;
                ble.write(deviceId, barometer.service, barometer.configuration, barometerConfig.buffer,
                    function() { console.log("Started barometer."); },app.onError);

                //Associate the deviceID with the disconnect button
                disconnectButton.dataset.deviceId = deviceId;
                app.showDevicePage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },

    
    sensorBarometerConvert: function(data){
        return (data / 100);

    },
    onBarometerData: function(data) {
         console.log(data);
         var message;
         var a = new Uint8Array(data);

         //0-2 Temp
         //3-5 Pressure
         message =  "Temperature <br/>" +
                    app.sensorBarometerConvert( a[0] | (a[1] << 8) | (a[2] << 16)) + "°C <br/><br/ >" +
                    "Pressure <br/>" +
                    app.sensorBarometerConvert( a[3] | (a[4] << 8) | (a[5] << 16)) + "hPa <br/><br />" ;


        barometerData.innerHTML = message;

    },
    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showOverviewPage, app.onError);
    },
    showOverviewPage: function() {
        overviewPage.hidden = false;
        devicePage.hidden = true;
    },
    showDevicePage: function() {
        overviewPage.hidden = true;
        devicePage.hidden = false;
    },
    onError: function(reason) {
        alert("ERROR: " + reason);
    }
    
};

app.initialize();