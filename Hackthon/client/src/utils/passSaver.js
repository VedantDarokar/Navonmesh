import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * passSaver.js
 * Comprehensive utility to guarantee saving passes on Android Mobile (Gallery/Photos) & Desktop browsers.
 * 
 * Works around Android WebView restrictions:
 * 1. Inside Android APK (Capacitor native platform):
 *    - Saves the image to Cache via @capacitor/filesystem
 *    - Opens Android's native Share Sheet via @capacitor/share with the file URI.
 *      From here, Android natively offers "Save to Photos", "Gallery", "Quick Share", "Drive", "WhatsApp", etc.
 * 2. Mobile Browser (Chrome/Firefox/Safari):
 *    - Converts canvas to Blob and File.
 *    - Uses Web Share API (navigator.share({ files: [file] })) so Android displays "Save image", "Photos", "Gallery".
 * 3. Desktop / Standard Browsers:
 *    - Uses Blob Object URL (<a download>) for direct disk saving.
 */

export async function canvasToBlob(canvas) {
    return new Promise((resolve) => {
        if (canvas.toBlob) {
            canvas.toBlob((blob) => resolve(blob), 'image/png');
        } else {
            const dataUrl = canvas.toDataURL('image/png');
            fetch(dataUrl)
                .then((res) => res.blob())
                .then((blob) => resolve(blob))
                .catch(() => resolve(null));
        }
    });
}

/**
 * Saves or shares a pass image across Android Mobile APK, mobile browsers & desktop.
 */
export async function savePassImage(canvas, fileName = 'Navonmesh_Pass.png', participantName = 'Participant') {
    try {
        const dataUrl = canvas.toDataURL('image/png');
        const blob = await canvasToBlob(canvas);
        if (!blob) {
            throw new Error('Failed to generate image blob from pass canvas');
        }

        const file = new File([blob], fileName, { type: 'image/png' });
        const blobUrl = URL.createObjectURL(blob);

        let sharedSuccessfully = false;

        // 1. Android Native APK Environment: Use Capacitor Filesystem + Native Share Sheet
        if (Capacitor.isNativePlatform()) {
            try {
                const base64Data = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: `Navonmesh Pass - ${participantName}`,
                    text: `Official Event & Meal Pass for ${participantName}`,
                    url: savedFile.uri,
                    dialogTitle: 'Save Pass to Gallery / Share'
                });
                sharedSuccessfully = true;
            } catch (nativeErr) {
                console.warn('[PassSaver] Native Capacitor Share error:', nativeErr);
            }
        }

        // 2. Mobile Browser: Try Web Share API with File
        if (!sharedSuccessfully && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Navonmesh Pass - ${participantName}`,
                    text: `Official Event & Meal Pass for ${participantName}`
                });
                sharedSuccessfully = true;
            } catch (shareErr) {
                if (shareErr.name !== 'AbortError') {
                    console.warn('[PassSaver] navigator.share error:', shareErr);
                }
            }
        }

        // 3. Desktop / Web Browser: Standard Download Link
        if (!Capacitor.isNativePlatform()) {
            try {
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                }, 1000);
            } catch (downloadErr) {
                console.warn('[PassSaver] Direct download trigger error:', downloadErr);
            }
        }

        return {
            success: true,
            dataUrl,
            blobUrl,
            blob,
            file,
            sharedSuccessfully
        };
    } catch (err) {
        console.error('[PassSaver] Error saving pass:', err);
        return {
            success: false,
            error: err.message
        };
    }
}
