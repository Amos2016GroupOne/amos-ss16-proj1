#!/bin/bash
mkdir -p scss
echo "Select a Theme:"

for theme in `ls themes | cut -d. -f1`;
do
        echo " - $theme"
done

echo
echo [standard]
read tmp
choice=${tmp:-standard}

if [ -e "./themes/$choice.app.scss" ]
then
        echo "Setting up Theme $choice !"
        rm -f scss/ionic.app.scss
        ln -s ../themes/$choice.app.scss scss/ionic.app.scss
else
        echo "Theme $choice does not exist!"
fi
