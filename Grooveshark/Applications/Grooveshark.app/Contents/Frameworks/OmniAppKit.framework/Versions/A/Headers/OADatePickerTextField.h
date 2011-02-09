// Copyright 2006-2007 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniAppKit/Widgets.subproj/OADatePickerTextField.h 90440 2007-08-25 02:04:31Z xmas $

#import "OASteppableTextField.h"

@interface OADatePickerTextField : OASteppableTextField
{
    NSDate *minDate;
    NSDate *maxDate;
    NSButton *calendarButton;
    NSCalendar *calendar;
    
    NSTrackingRectTag visibleRectTag;

    NSTextField *_defaultTextField;
}

- (NSDate *)defaultDate;
- (void)setDefaultDateTextField:(NSTextField *)defaultTextField;

- (void)setMinDate:(NSDate *)aDate;
- (NSDate *)maxDate;
- (void)setMaxDate:(NSDate *)aDate;

- (BOOL)isDatePickerHidden;
- (void)setIsDatePickerHidden:(BOOL)yn;

- (NSCalendar *)calendar;
- (void)setCalendar:(NSCalendar *)aCalendar;

@end

