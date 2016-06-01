#!/bin/sh
if [ ! -e "scss/ionic.app.scss" ]
then
        echo "Setting up standard theme"
        echo standard | ./selectTheme.sh
fi
