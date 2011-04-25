#!/bin/bash

# Make compressed .dmg script for gsFluid

# paths
PROJECT="/Users/justjake/Documents/Projects/Grooveshark"
RESOURCES="$PROJECT/Dist/Resources/en.lproj"
PKGROOT="$PROJECT/Dist/Package_Root"

# image
TEMPLATE="$PROJECT/Template.sparseimage"
OUTPUT="$PROJECT/GroovesharkDesktop.dmg"

# resource names
APP="$PKGROOT/Applications/Grooveshark.app"
README="$RESOURCES/Welcome.rtfd"
INSTALLHELP="$PROJECT/Installation Help.rtfd"
LISCENCE="$RESOURCES/License"
LIBRARY="$PKGROOT/Library"
RUNME="$PROJECT/Dist/Scripts/postflight"

# destinations
runmeDest="Run Me"
lDest="Liscence.rtf"

# copy template
echo "Copying template disk image"
cp -f "$TEMPLATE" "$PROJECT/build/working.sparseimage"
working="$PROJECT/build/working.sparseimage"

echo "Mounting image..."

# mount writable
mountinfo=$(hdiutil attach -readwrite -noverify -noautoopen "$working")
device=$(echo "$mountinfo" | egrep '^/dev/' | sed 1q | awk '{print $1}')
volume=$(echo "$mountinfo" | egrep '/Volumes/.*$' | sed 1q | awk '{print $2}')

echo "Mounted working image ($working) to $device at volume $volume"

# copy files - info
cp -rf "$README" "${volume}"
cp -rf "$LISCENCE" "$volume"
cp -rf "$INSTALLHELP" "${volume}"

# copy files - data
# cp -rf "$LIBRARY" "${volume}/Library"
# cp -rf "$RUNME" "${volume}/$runmeDest"
# cp -rf "$APP" "$volume"

# permissions
chmod -Rf go-w "$volume"

sync
sync

# detatch template
hdiutil detach ${device}

# make release
output="$PROJECT/build/$1.dmg"
hdiutil convert "$working" -format UDZO -imagekey zlib-level=9 -o "$output"
