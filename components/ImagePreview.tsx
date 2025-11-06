'use client';

import Image from 'next/image';
import { ImageFile } from '@/types';
import { formatBytes } from '@/lib/utils';

interface ImagePreviewProps {
    image: ImageFile;
    onRemove: (id: string) => void;
}

export default function ImagePreview({ image, onRemove }: ImagePreviewProps) {
    const getStatusColor = () => {
        switch (image.status) {
            case 'completed': return 'bg-green-500 shadow-lg shadow-green-500/50';
            case 'processing': return 'bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50';
            case 'error': return 'bg-red-500 shadow-lg shadow-red-500/50';
            default: return 'bg-zinc-300 dark:bg-zinc-700';
        }
    };

    const getStatusText = () => {
        switch (image.status) {
            case 'completed': return '✓';
            case 'processing': return '⟳';
            case 'error': return '✗';
            default: return '';
        }
    };

    const getSizeColor = () => {
        if (!image.processedSize) return '';
        return image.processedSize > image.originalSize
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-green-600 dark:text-green-400';
    };

    return (
        <div className="relative group border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-zinc-900">
            <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={image.preview}
                    alt={image.file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                />
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 w-8 h-8 rounded-full ${getStatusColor()} flex items-center justify-center text-white text-sm font-bold transition-all`}>
                    {getStatusText()}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        onClick={() => onRemove(image.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 shadow-lg"
                        aria-label="Remove image"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove</span>
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-3 bg-white dark:bg-zinc-900">
                <p className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100" title={image.file.name}>
                    {image.file.name}
                </p>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {formatBytes(image.originalSize)}
                    </span>
                    {image.processedSize && (
                        <>
                            <span className={getSizeColor()}>→</span>
                            <span className={`flex items-center gap-1 font-semibold ${getSizeColor()}`}>
                                {formatBytes(image.processedSize)}
                                <span className="text-[10px]">
                                    ({image.processedSize > image.originalSize ? '+' : ''}
                                    {Math.round(((image.processedSize - image.originalSize) / image.originalSize) * 100)}%)
                                </span>
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
