#!/bin/bash
# executing this will convert app-icon.svg to the needed icon png files for android and
# ios.
# Therefore inkscape is needed to be in path.

# converto to a size that is fitting for all
inkscape -z -e icon.png -w 1240 -h 1240 app-icon.svg
bin/cordova-icon

exit 0

