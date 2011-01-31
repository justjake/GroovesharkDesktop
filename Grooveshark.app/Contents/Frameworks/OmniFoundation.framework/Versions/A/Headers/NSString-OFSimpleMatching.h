// Copyright 1997-2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/OpenStepExtensions.subproj/NSString-OFSimpleMatching.h 98560 2008-03-12 17:28:00Z bungi $

#import <Foundation/NSString.h>

#import <CoreFoundation/CFString.h>

@class OFCharacterSet;

@interface NSString (OFSimpleMatching)

+ (BOOL)isEmptyString:(NSString *)string;
// Returns YES if the string is nil or equal to @""

- (BOOL)containsCharacterInOFCharacterSet:(OFCharacterSet *)searchSet;
- (BOOL)containsCharacterInSet:(NSCharacterSet *)searchSet;
- (BOOL)containsString:(NSString *)searchString options:(unsigned int)mask;
- (BOOL)containsString:(NSString *)searchString;
- (BOOL)hasLeadingWhitespace;
#if !defined(MAC_OS_X_VERSION_10_5) || MAC_OS_X_VERSION_MIN_REQUIRED < MAC_OS_X_VERSION_10_5
- (BOOL)isEqualToCString:(const char *)cString;
#endif

- (unsigned)indexOfCharacterNotRepresentableInCFEncoding:(CFStringEncoding)anEncoding;
- (unsigned)indexOfCharacterNotRepresentableInCFEncoding:(CFStringEncoding)anEncoding range:(NSRange)aRange;
- (NSRange)rangeOfCharactersNotRepresentableInCFEncoding:(CFStringEncoding)anEncoding;

@end
