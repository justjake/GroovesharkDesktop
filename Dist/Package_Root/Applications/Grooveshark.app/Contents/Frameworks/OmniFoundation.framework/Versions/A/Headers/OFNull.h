// Copyright 1997-2005, 2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/DataStructures.subproj/OFNull.h 98560 2008-03-12 17:28:00Z bungi $

#import <Foundation/NSObject.h>

#define OFNOTNULL(ptr)   ((ptr) != nil && ![ptr isNull])
#define OFISNULL(ptr)    ((ptr) == nil || [ptr isNull])
#define OFISEQUAL(a, b)    ((OFISNULL(a) && OFISNULL(b)) || [(a) isEqual: (b)])
#define OFNOTEQUAL(a, b)   (!OFISEQUAL(a, b))

@interface OFNull : NSObject
+ (id)nullObject;
+ (NSString *)nullStringObject;
@end

#import <Foundation/NSObject.h>

@interface NSObject (Null)
- (BOOL)isNull;
@end

extern NSString * OFNullStringObject;
