// Copyright 1997-2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/OpenStepExtensions.subproj/NSFileManager-OFExtensions.h 98221 2008-03-04 21:06:19Z kc $

#import <Foundation/NSFileManager.h>
#import <Foundation/NSRange.h> // For NSRange
#import <OmniBase/SystemType.h>

@class NSNumber;

@interface NSFileManager (OFExtensions)

- (NSString *)desktopDirectory;
- (NSString *)documentDirectory;

- (NSString *)temporaryPathForWritingToPath:(NSString *)path allowOriginalDirectory:(BOOL)allowOriginalDirectory error:(NSError **)outError;
- (NSString *)temporaryPathForWritingToPath:(NSString *)path allowOriginalDirectory:(BOOL)allowOriginalDirectory create:(BOOL)create error:(NSError **)outError;
- (NSString *)temporaryDirectoryForFileSystemContainingPath:(NSString *)path error:(NSError **)outError;

- (NSString *)tempFilenameFromTemplate:(NSString *)inputString
    andRange:(NSRange)replaceRange;
    // Create a unique temp filename from a template filename, given a range within the template filename which identifies where the unique portion of the filename is to lie.

- (NSString *)tempFilenameFromTemplate:(NSString *)inputString
    andPosition:(int)position;
    // Create a unique temp filename from a template string, given a position within the template filename which identifies where the unique portion of the filename is to begin.

- (NSString *)tempFilenameFromTemplate:(NSString *)inputString
    andSubstring:(NSString *)substring;
    // Create a unique temp filename from a template string, given a substring within the template filename which is to be replaced by the unique portion of the filename.

- (NSString *)tempFilenameFromHashesTemplate:(NSString *)inputString;
    // Create a unique temp filename from a template string which contains a substring of six hash marks which are to be replaced by the unique portion of the filename.

- (NSString *)uniqueFilenameFromName:(NSString *)filename error:(NSError **)outError;
- (NSString *)uniqueFilenameFromName:(NSString *)filename allowOriginal:(BOOL)allowOriginal create:(BOOL)create error:(NSError **)outError;
    // Generate a unique filename based on a suggested name

// Scratch files

- (NSString *)scratchDirectoryPath;
- (NSString *)scratchFilenameNamed:(NSString *)aName error:(NSError **)outError;
- (void)removeScratchDirectory;

// Changing file access/update timestamps.

- (void)touchFile:(NSString *)filePath;

// Directory manipulations

- (BOOL)directoryExistsAtPath:(NSString *)path;
- (BOOL)directoryExistsAtPath:(NSString *)path traverseLink:(BOOL)traverseLink;

- (BOOL)createPathToFile:(NSString *)path attributes:(NSDictionary *)attributes error:(NSError **)outError;
    // Creates any directories needed to be able to create a file at the specified path.
- (BOOL)createPath:(NSString *)path attributes:(NSDictionary *)attributes error:(NSError **)outError;

    // Creates any directories needed to be able to create a file at the specified path.  Returns NO on failure.
- (BOOL)createPathComponents:(NSArray *)components attributes:(NSDictionary *)attributes error:(NSError **)outError;

- (NSString *)existingPortionOfPath:(NSString *)path;

- (BOOL)atomicallyCreateFileAtPath:(NSString *)path contents:(NSData *)data attributes:(NSDictionary *)attr;

- (NSArray *) directoryContentsAtPath: (NSString *) path havingExtension: (NSString *) extension;

// File locking
// Note: these are *not* industrial-strength robust file locks, but will do for occasional use.

- (NSDictionary *)lockFileAtPath:(NSString *)path overridingExistingLock:(BOOL)override created:(BOOL *)outCreated error:(NSError **)outError;
- (void)unlockFileAtPath:(NSString *)path;

- (BOOL)replaceFileAtPath:(NSString *)originalFile withFileAtPath:(NSString *)newFile handler:(id)handler error:(NSError **)outError;
- (BOOL)exchangeFileAtPath:(NSString *)originalFile withFileAtPath:(NSString *)newFile handler:(id)handler error:(NSError **)outError;

//

- (NSNumber *)posixPermissionsForMode:(unsigned int)mode;
- (NSNumber *)defaultFilePermissions;
- (NSNumber *)defaultDirectoryPermissions;

- (unsigned long long)sizeOfFileAtPath:(NSString *)path;

- (BOOL)isFileAtPath:(NSString *)path enclosedByFolderOfType:(OSType)folderType;

- (NSString *)networkMountPointForPath:(NSString *)path returnMountSource:(NSString **)mountSource;
- (NSString *)fileSystemTypeForPath:(NSString *)path;

- (int)getType:(unsigned long *)typeCode andCreator:(unsigned long *)creatorCode forPath:(NSString *)path;
- (int)setType:(unsigned long)typeCode andCreator:(unsigned long)creatorCode forPath:(NSString *)path;

- (NSString *)resolveAliasAtPath:(NSString *)path;
    // Returns the original path if it isn't an alias, or the path pointed to by the alias (paths are all in POSIX form). Returns nil if an error occurs, such as not being able to resolve the alias. Note that this will not resolve aliases in the middle of the path (e.g. if /foo/bar is an alias to a directory, resolving /foo/bar/baz will fail and return nil).

- (NSString *)resolveAliasesInPath:(NSString *)path;
   // As -resolveAliasAtPath:, but will resolve aliases in the middle of the path as well, returning a path that can be used by POSIX APIs. Unlike -resolveAliasAtPath:, this can return non-nil for nonexistent paths: if the path can be resolved up to a directory which does not contain the next component, it will do so. As a side effect, -resolveAliasesInPath: will often resolve symlinks as well, but this should not be relied upon. Note that resolving aliases can incur some time-consuming operations such as mounting volumes, which can cause the user to be prompted for a password or to insert a disk, etc.

- (BOOL)fileIsStationeryPad:(NSString *)path;

   // Checks whether one path is a subdirectory of another, optionally returning the relative path (a suffix of thisPath). Consults the filesystem in an attempt to discover commonalities due to symlinks and file mounts. (Does not handle aliases, particularly.)
- (BOOL)path:(NSString *)otherPath isAncestorOfPath:(NSString *)thisPath relativePath:(NSString **)relativeResult;

@end
