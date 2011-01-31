// Copyright 1997-2005, 2007-2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniBase/OBObject.h 98560 2008-03-12 17:28:00Z bungi $

#import <Foundation/NSObject.h>

@interface OBObject : NSObject
@end


@class NSDictionary, NSMutableDictionary;

@interface OBObject (Debug)

// Debugging methods
- (NSMutableDictionary *)debugDictionary;
- (NSString *)descriptionWithLocale:(NSDictionary *)locale indent:(unsigned)level;
- (NSString *)description;
- (NSString *)shortDescription;

@end

// OmniBase Symbols

#import <OmniBase/SystemType.h> // Defines OBOperatingSystem{Major,Minor}Version
