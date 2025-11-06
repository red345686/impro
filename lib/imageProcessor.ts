export async function processImageClientSide(
    file: File,
    targetWidth: number,
    targetHeight: number,
    quality: number
): Promise<{ blob: Blob; originalSize: number; newSize: number }> {
    console.log(`Processing ${file.name}: ${targetWidth}x${targetHeight}, quality: ${quality}%`);

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
        }

        img.onload = () => {
            console.log(`Image loaded: ${img.width}x${img.height}`);
            // Set canvas dimensions to target size
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Calculate scaling to cover the target dimensions
            const scale = Math.max(
                targetWidth / img.width,
                targetHeight / img.height
            );

            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            // Center the image
            const x = (targetWidth - scaledWidth) / 2;
            const y = (targetHeight - scaledHeight) / 2;

            // Draw image on canvas
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

            // Convert to blob with quality setting
            const qualityValue = quality / 100;
            console.log(`Converting to JPEG with quality: ${qualityValue} (${quality}%)`);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        console.log(`Blob created: ${file.size} → ${blob.size} bytes (${((blob.size / file.size) * 100).toFixed(1)}%)`);
                        resolve({
                            blob,
                            originalSize: file.size,
                            newSize: blob.size,
                        });
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                    URL.revokeObjectURL(img.src);
                },
                'image/jpeg',
                qualityValue
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
            URL.revokeObjectURL(img.src);
        };

        img.src = URL.createObjectURL(file);
    });
}
