// Copyright 2005-2007 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/OpenStepExtensions.subproj/NSSet-OFExtensions.h 89466 2007-08-01 23:35:13Z kc $

#import <Foundation/NSSet.h>

@interface NSSet (OFExtensions)

- (NSSet *)setByPerformingSelector:(SEL)aSelector;
- (NSArray *)sortedArrayUsingSelector:(SEL)comparator;

- (void)applyFunction:(CFSetApplierFunction)applier context:(void *)context;

@end

