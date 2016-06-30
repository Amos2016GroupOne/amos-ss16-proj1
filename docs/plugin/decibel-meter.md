# Measuring decibel
  - it does not work in a browser(obviously)
  - it works on blackberry, ios, android
    - even in background
    - even in standby
    - even when playing music from another app.

Why have you chosen it? 
[input from Sebastian]

What have you changed, if you have changed sthg.? 
nothing

How have you included it?
the cordova dbmeter plugin offers a variable `DBMeter` in global scope:

  DBMeter.start(function(dB) {
    // this is called periodically whenever a new dB value was retrieved until DBMeter.stop() is called.
    // so the next line will countinously log the loudness
    console.log('loudness:' + dB + 'dB');
  });
  DBMeter.stop();