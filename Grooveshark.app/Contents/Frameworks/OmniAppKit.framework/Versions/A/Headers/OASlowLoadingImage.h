// Copyright 2007 Omni Development, Inc.  All rights reserved.
//
// This software may only be used and reproduced according to the
// terms in the file OmniSourceLicense.html, which should be
// distributed with this project and can also be found at
// <http://www.omnigroup.com/developer/sourcecode/sourcelicense/>.
//
// $Header: svn+ssh://source.omnigroup.com/Source/svn/Omni/tags/OmniSourceRelease/2008-03-20/OmniGroup/Frameworks/OmniAppKit/Widgets.subproj/OASlowLoadingImage.h 93428 2007-10-25 16:36:11Z kc $

#import <AvailabilityMacros.h>
#if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)

#import <OmniFoundation/OFObject.h>

#import <AppKit/NSImage.h>
#import <ApplicationServices/ApplicationServices.h>

@class /* Foundation */ NSURLRequest, NSURLConnection, NSError, NSMutableData;

@interface OASlowLoadingImage : OFObject
{
    NSURLRequest *source;
    
    enum OASlowLoadingImageState {
        OASlowLoadNotStarted,
        OASlowLoadStarted,
        OASlowLoadFinished
    } slowLoadingState;
    
    NSURLConnection *transfer;
    CGImageRef mostRecentCGImage;
//    NSImage *mostRecentNSImage;  // No efficient way to do this until 10.5
    NSSize mostRecentSize;
    NSError *finalError;
    
    CFStringRef typeHint;
    NSMutableData *dataBuffer;
    CGImageSourceRef imageParser;
}

- initWithURL:(NSURL *)source;
- initWithURLRequest:(NSURLRequest *)source startImmediately:(BOOL)startImmediately;  // D.I.

// The following properties are KVO-observable. Calling them will not block.
- (CGImageRef)CGImage;           // The fully loaded image, or nil.
- (CGImageRef)partialCGImage;    // The partially loaded image, or fully loaded image, or nil.
- (NSSize)imageSize;          // The size of the image, or NSZeroSize. May become valid before -image does.
- (NSError *)loadingError;    // If the image fails to load, this will become non-nil.

@end

#endif /* MAC_OS_X_VERSION_10_4 */
