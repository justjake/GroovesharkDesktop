// Copyright 1997-2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/AppleScript/NSAppleEventDescriptor-OFExtensions.h 98771 2008-03-17 22:31:08Z kc $

#import <Foundation/NSAppleEventDescriptor.h>

@interface NSAppleEventDescriptor (OFExtensions)
@end

@interface NSDictionary (OFExtensions_NSAppleEventDescriptor)
+ (NSDictionary *)dictionaryWithUserRecord:(NSAppleEventDescriptor *)descriptor;
- (NSAppleEventDescriptor *)userRecordValue;
@end
