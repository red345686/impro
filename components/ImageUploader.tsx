'use client';

import { useCallback, useState } from 'react';
import { ImageFile } from '@/types';
import { generateId } from '@/lib/utils';

interface ImageUploaderProps {
    onImagesAdded: (images: ImageFile[]) => void;
}

export default function ImageUploader({ onImagesAdded }: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback((files: FileList | null) => {
        if (!files) return;

        const imageFiles: ImageFile[] = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: generateId(),
                file,
                preview: URL.createObjectURL(file),
                originalSize: file.size,
                status: 'pending' as const,
            }));

        if (imageFiles.length > 0) {
            onImagesAdded(imageFiles);
        } else {
            alert('Please select valid image files (PNG, JPG, WebP, etc.)');
        }
    }, [onImagesAdded]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer ${isDragging
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950 scale-[1.02]'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900'
                }`}
        >
            <div className="space-y-4">
                <div className={`text-5xl transition-transform ${isDragging ? 'scale-110' : ''}`}>
                    {isDragging ? '�' : '�📸'}
                </div>
                <div>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {isDragging ? 'Drop your images here' : 'Drag & drop images here'}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        or click to browse your files
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                        Supports: JPG, PNG, WebP, GIF and more
                    </p>
                </div>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    id="file-input"
                />
                <label
                    htmlFor="file-input"
                    className="inline-block px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-medium hover:scale-105 shadow-lg"
                >
                    Choose Files
                </label>
            </div>
        </div>
    );
}
