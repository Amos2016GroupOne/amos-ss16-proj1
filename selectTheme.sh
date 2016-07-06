#!/bin/bash

# Projectname: amos-ss16-proj1
#
# Copyright (c) 2016 de.fau.cs.osr.amos2016.gruppe1
#
# This file is part of the AMOS Project 2016 @ FAU
# (Friedrich-Alexander University Erlangen-Nürnberg)
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with this program. If not, see
# <http://www.gnu.org/licenses/>.


# Script to select a theme and rebuild all styles of the app

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
        rm -f scss/ionic-ltr.app.scss
        ln -s ../themes/$choice.app.scss scss/ionic-ltr.app.scss
        inkscape -z -e icon.png -w 512 -h 512 themes/$choice.app-icon.svg
        #cordova-icon  not needed as this is done as a build_prepare hook anyway.
else
        echo "Theme $choice does not exist!"
fi

gulp
