#!/bin/bash
mkdir -p scss
echo "Select a Theme:"

for theme in `ls themes | grep app.scss | cut -d. -f1`;
do
        echo " - $theme"
done

echo
echo [standard]
read tmp
# For a default choice:
choice=${tmp:-standard}

if [ -e "./themes/$choice.app.scss" ]
then
        echo "Setting up Theme $choice !"
        rm -f scss/ionic.app.scss
        ln -s ../themes/$choice.app.scss scss/ionic.app.scss
        inkscape -z -e icon.png -w 512 -h 512 themes/$choice.app-icon.svg
        #cordova-icon  not needed as this is done as a build_prepare hook anyway.
else
        echo "Theme $choice does not exist!"
fi

gulp
