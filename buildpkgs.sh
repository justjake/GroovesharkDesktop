#!/bin/bash

# Make packages script for gsFluid

# paths
PROJECT="/Users/justjake/Documents/Projects/Grooveshark"
BUILDDIR="$PROJECT/Dist/build"
PKGROOT="$PROJECT/Dist/Package_Root"

INFO="$PROJECT/Dist/PackageInfo"
DIST="$PROJECT/Dist/Distribution"

RESOURCES="$PROJECT/Dist/Resources"
SCRIPTS="$PROJECT/Dist/Scripts"

ID="org.teton-landis.jake.groovesharkDestktop.Grooveshark.pkg"

ARGS="-v --target 10.5 --no-relocate --discard-forks --no-recommend"

prepare() {
	# apply permissions
	# Remove .DS_Store
	find "$PKGROOT" -name ".DS_Store" | sed 's/ /\\ /' | xargs rm
	# make build dir
	mkdir "$BUILDDIR"
}

buildPkg() {
	packagemaker -r "$PKGROOT" -f "$INFO" -s "$SCRIPTS" $ARGS -o "$BUILDDIR/flat.pkg"
}

buildDist() {
	echo "Building Distribution"
	echo "  Copying filesystem"
	cp -r "$RESOURCES" "$BUILDDIR/Resources"
	cp "$DIST" "$BUILDDIR/Distribution"
	echo "  extracting flat package"
	pkgutil --expand "$BUILDDIR/flat.pkg" "$BUILDDIR/grooveshark.pkg/"
#	read PAUSE
	rm "$BUILDDIR/flat.pkg"
	echo "  flattening distribution"
	pkgutil --flatten "$BUILDDIR" "$PROJECT/$1.pkg"
	echo "Finished!"
}

clean() {
	rm -r "$BUILDDIR"
}
echo "Building to $PROJECT/$1.pkg"
clean
prepare
buildPkg
buildDist $1
exit 0