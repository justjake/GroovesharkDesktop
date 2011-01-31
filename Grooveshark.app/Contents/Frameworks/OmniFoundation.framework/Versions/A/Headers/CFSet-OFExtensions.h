// Copyright 1997-2005, 2007 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/CoreFoundationExtensions/CFSet-OFExtensions.h 89466 2007-08-01 23:35:13Z kc $

#import <CoreFoundation/CFSet.h>

extern const CFSetCallBacks OFCaseInsensitiveStringSetCallbacks;

extern const CFSetCallBacks OFNonOwnedPointerSetCallbacks;
extern const CFSetCallBacks OFIntegerSetCallbacks;
extern const CFSetCallBacks OFPointerEqualObjectSetCallbacks;
extern const CFSetCallBacks OFNonOwnedObjectCallbacks;
extern const CFSetCallBacks OFNSObjectSetCallbacks;
extern const CFSetCallBacks OFWeaklyRetainedObjectSetCallbacks;

@class NSMutableSet;
extern NSMutableSet *OFCreateNonOwnedPointerSet(void);
extern NSMutableSet *OFCreatePointerEqualObjectSet(void);
