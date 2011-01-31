// Copyright 1997-2006, 2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniAppKit/OpenStepExtensions.subproj/NSWindow-OAExtensions.h 98221 2008-03-04 21:06:19Z kc $

#import <AppKit/NSWindow.h>

#import <Foundation/NSGeometry.h> // for NSPoint
#import <Foundation/NSDate.h> // for NSTimeInterval

#if !defined(MAC_OS_X_VERSION_10_5) || MAC_OS_X_VERSION_MAX_ALLOWED < MAC_OS_X_VERSION_10_5
enum {
    NSWindowCollectionBehaviorDefault = 0,
    NSWindowCollectionBehaviorCanJoinAllSpaces = 1 << 0,
    NSWindowCollectionBehaviorMoveToActiveSpace = 1 << 1
};

typedef NSUInteger NSWindowCollectionBehavior;

@interface NSWindow (LeopardAPI)
- (void)setCollectionBehavior:(NSWindowCollectionBehavior)behavior;
@end
#endif

@interface NSWindow (OAExtensions)

+ (NSArray *)windowsInZOrder;

- (NSPoint)frameTopLeftPoint;
- (void)morphToFrame:(NSRect)newFrame overTimeInterval:(NSTimeInterval)morphInterval;

- (BOOL)isBecomingKey;
- (BOOL)shouldDrawAsKey;

- (void *)carbonWindowRef;

#if defined(MAC_OS_X_VERSION_10_4) && MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4
- (void)addConstructionWarning;
#endif

- (CGPoint)convertBaseToCGScreen:(NSPoint)windowPoint;

@end
