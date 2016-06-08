# Measuring decibel
- the decibel meter was up to now only tested in browser and on a blackberry phone
  - it does not work in a browser(obviously)
  - it works on blackberry
    - even in background
    - even in standby
    - even when playing music from another app.

## How it works
- the cordova dbmeter plugin offers a variable `DBMeter` in global scope:

  DBMeter.start(function(dB) {
    // this is called periodically whenever a new dB value was retrieved until DBMeter.stop() is called.
    // so the next line will countinously log the loudness
    console.log('loudness:' + dB + 'dB');
  });
  DBMeter.stop();

## Open questions
- does it work on ios/(real)android?
- what about powerconsumption?
- is it performant? (At least it looks performant enough)
