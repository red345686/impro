'use client';

import { ImageFile } from '@/types';
import { generateZip } from '@/lib/zipGenerator';
import { useState } from 'react';

interface DownloadButtonProps {
    images: ImageFile[];
    disabled: boolean;
}

export default function DownloadButton({ images, disabled }: DownloadButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
        const completedImages = images.filter(img => img.status === 'completed');
        console.log('Completed images:', completedImages.length);

        if (completedImages.length === 0) {
            console.log('No completed images to download');
            return;
        }

        setIsGenerating(true);
        try {
            console.log('Generating ZIP...');
            const zipBlob = await generateZip(completedImages);
            console.log('ZIP generated, size:', zipBlob.size);

            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `processed-images-${Date.now()}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('Download initiated');
            setDownloaded(true);
            setTimeout(() => setDownloaded(false), 3000);
        } catch (error) {
            console.error('Failed to generate ZIP:', error);
            alert('Failed to generate ZIP file. Check console for details.');
        } finally {
            setIsGenerating(false);
        }
    };

    const completedCount = images.filter(img => img.status === 'completed').length;

    return (
        <div className="space-y-2 md:space-y-3">
            <button
                onClick={handleDownload}
                disabled={disabled || isGenerating}
                className={`w-full px-4 sm:px-5 md:px-6 py-3 md:py-4 rounded-lg md:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 md:gap-3 shadow-lg text-sm sm:text-base ${downloaded
                    ? 'bg-green-500 dark:bg-green-600 text-white'
                    : 'bg-linear-to-r from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200 text-white dark:text-zinc-900 hover:from-zinc-800 hover:to-zinc-700 dark:hover:from-zinc-200 dark:hover:to-zinc-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin h-5 w-5 md:h-6 md:w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating ZIP...</span>
                    </>
                ) : downloaded ? (
                    <>
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Downloaded!</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download All as ZIP</span>
                    </>
                )}
            </button>

            {!disabled && (
                <p className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                    {completedCount} image{completedCount !== 1 ? 's' : ''} ready to download
                </p>
            )}
        </div>
    );
}
