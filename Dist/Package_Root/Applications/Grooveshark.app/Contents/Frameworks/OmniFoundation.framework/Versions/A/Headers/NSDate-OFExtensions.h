// Copyright 1997-2005, 2007-2008 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniFoundation/OpenStepExtensions.subproj/NSDate-OFExtensions.h 98560 2008-03-12 17:28:00Z bungi $

#import <Foundation/NSDate.h>

@class NSCalendar, NSString, NSTimeZone;

@interface NSDate (OFExtensions)

//- (NSString *)descriptionWithHTTPFormat; // rfc1123 format with TZ forced to GMT

- (void)sleepUntilDate;

- (BOOL)isAfterDate: (NSDate *) otherDate;
- (BOOL)isBeforeDate: (NSDate *) otherDate;

// XML Schema / ISO 8601 support
+ (NSTimeZone *)UTCTimeZone;
+ (NSCalendar *)gregorianUTCCalendar;
- initWithXMLString:(NSString *)xmlString;
// date formatted according to http://www.w3.org/2001/XMLSchema-datatypes
- (NSString *)xmlDateString;
// dateTime formatted according to http://www.w3.org/2001/XMLSchema-datatypes
- (NSString *)xmlString;

@end
