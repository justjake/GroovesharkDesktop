// Copyright 1997-2005, 2007 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniAppKit/OpenStepExtensions.subproj/NSSplitView-OAExtensions.h 93428 2007-10-25 16:36:11Z kc $

#import <AppKit/NSSplitView.h>

@interface NSSplitView (OAExtensions)
- (float)fraction;
- (void)setFraction:(float)newFract;
- (int)topPixels;
- (void)setTopPixels:(int)newTop;
- (int)bottomPixels;
- (void)setBottomPixels:(int)newBottom;

#if MAC_OS_X_VERSION_MAX_ALLOWED >= MAC_OS_X_VERSION_10_5
- (void)animateSubviewResize:(NSView *)resizingSubview startValue:(float)startValue endValue:(float)endValue;
#endif

@end
