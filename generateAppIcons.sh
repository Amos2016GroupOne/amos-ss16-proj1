#!/bin/bash
# executing this will convert app-icon.svg to the needed icon png files for android and
# ios.
# Therefore inkscape is needed to be in path.

# converto to a size that is fitting for all
inkscape -z -e icon.png -w 1240 -h 1240 app-icon.svg
bin/cordova-icon

exit 0

# first argument: outputpath relative to www/res/icons
# second argument: width=height in px
function convert {
        inkscape -z -e www/res/icons/$1 -w $2 -h $2 app-icon.svg
}

mkdir -p www/res
mkdir -p www/res/icons

# android:
mkdir -p www/res/icons/android
convert android/icon-36-ldpi.png 36
convert android/icon-48-mdpi.png 48
convert android/icon-72-hdpi.png 72
convert android/icon-96-xhdpi.png 96



# ios:
# TODO: double resolution for ios
mkdir -p www/res/icons/ios
convert ios/icon-57-2x.png 57
convert ios/icon-57.png 57
convert ios/icon-72-2x.png 72
convert ios/icon-72.png 72

