#!/bin/bash

# Generate UUID and put it somewhere safe.
DESTPATH="$HOME/Library/Application Support/Fluid/SSB/Grooveshark/Userscripts/.uuid.js";
UUID="gsFluid.platform.user.uuid = '`uuidgen`';"
LONGNAME="gsFluid.platform.user.longname = '`osascript -e "long user name of (system info)" 2>/dev/null`';"
if [ ! -f "$DESTPATH" ]
	then
	# write UUID js to $DESTPATH
	echo "$UUID" >> "$DESTPATH"
	echo "$LONGNAME" >> "$DESTPATH"
fi