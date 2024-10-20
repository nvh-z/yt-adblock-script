// ==UserScript==
// @name         Remove yt ads
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  removes your annoying ads on youtube (disable your adblockers on youtube for this to work)
// @author       Niels
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

// this method will block your ads on youtube through tampermonkey
(function() {
    'use strict';

    // Old variable but could work in some cases
    window.__ytplayer_adblockDetected = false;

    // Function to remove ads
    async function removeAds() {
        return new Promise((resolve, _reject) => {
            setInterval(() => {
                // Retrieve all ad elements found on video page
                const adElements = [...document.querySelectorAll('.ad-showing')][0];

                // When ads are found we are gonna skip them
                if(adElements) {
                    // Video element
                    const video = document.querySelector('video');

                    // The ad skip elements
                    const skipBtn = document.querySelector('.videoAdUiSkipButton,.ytp-ad-skip-button');
                    const nonVid = document.querySelector(".ytp-ad-skip-button-modern");
                    const skipLock = document.querySelector('.ytp-ad-preview-text')?.innerText;
                    const surveyLock = document.querySelector('.ytp-ad-survey')?.length > 0;

                    if (video) {
                        // This essentially edits the video settings and skips it instantly
                        // Some ads have no skip button therefore this will always do the job and skip ads that don't have a skip button
                        video.playbackRate = 10;
                        video.volume = 0; // video.muted = true;
                        video.currentTime = video.duration;

                        // Depending on what lock is shown, click the skip button (both are the same element)
                        if (skipLock && skipBtn) {
                            skipBtn?.click();
                            nonVid?.click();

                        } // I am actually not sure if the survey is inside the video element, but safe to assume it is as it is essentially an ad inside that container
                        else if (surveyLock && skipBtn) {
                            skipBtn?.click();
                            nonVid?.click();
                        } // For anything other than non survey or skip locks
                        else {
                            skipBtn?.click();
                            nonVid?.click();
                        }
                    }
                    // Commented due to not sure if its outside or actually inside the video element
                    //                } else if (surveyLock && skipBtn) {
                    //                    skipBtn?.click();
                    //                }
                }

                // Set regular ad containers
                const adContainers = [
                    // More in depth ads
                    'div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint',
                    'div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer',
                    'div#main-container.style-scope.ytd-promoted-video-renderer',

                    // Other generic ads
                    '.ytd-companion-slot-renderer', '.ytd-action-companion-ad-renderer', // in feed
                    '.ytd-watch-next-secondary-results-renderer.sparkles-light-cta', '.ytd-unlimited-offer-module-renderer', // similar to in feed components
                    '.ytp-ad-overlay-image', '.ytp-ad-text-overlay', // deprecated overlay ads
                    '.ytd-display-ad-renderer', '.ytd-statement-banner-renderer', '.ytd-in-feed-ad-layout-renderer', // homepage ads
                    '.ytd-banner-promo-renderer', '.ytd-video-masthead-ad-v3-renderer', '.ytd-primetime-promo-renderer' // subscribe for premium & youtube tv ads (those annoying promo ads at the front page)
                ];

                // Iterate through each ad container
                adContainers.forEach(selector => {
                    // Get the ad element given
                    const adElement = document.querySelector(selector);

                    if (adElement) {
                        // This will get the grid row, which is a yt-rich-item-renderer element
                        const richItemRenderer = adElement.closest('ytd-rich-item-renderer.style-scope.ytd-rich-grid-row');

                        // Check if the ad container is inside a rich-item-renderer
                        // We can then assume its a grid row and remove the whole row, if not we just remove the adElement that was found
                        if (richItemRenderer) {
                            richItemRenderer.remove();
                        } else {
                            adElement.remove();
                        }
                    }
                });

                // Get sponsors in video's
                const sponsorContainer = document.querySelectorAll(
                    'div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy'
                );

                // Do sponsor container seperately due to chapter section child elements. And only do this when there is a sponsor
                sponsorContainer?.forEach((element) => {
                    if (element.getAttribute('id') == 'panels') {
                        element.childNodes?.forEach((childElement) => {
                            if (childElement.data?.targetId && childElement.data.targetId != 'engagement-panel-macro-markers-description-chapters') {
                                // Skips the chapter section
                                childElement.remove();
                            }
                        });
                    } else {
                        element.remove();
                    }
                });

                resolve(); // Resolve the promise to indicate completion

            }, 100);
        });
    }

    const init = async () => {
        // Not sure if a mutationObserver is needed in case dom updates and loads dynamic ads, since there is a setinterval running
        //    const observer = new MutationObserver(removeAds);
        //    observer.observe(document.body, { childList: true, subtree: true });

        // Wait for removeAds to complete
        await removeAds();
    };

    init();
})();