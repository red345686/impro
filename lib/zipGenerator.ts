import JSZip from 'jszip';
import { ImageFile } from '@/types';

export async function generateZip(images: ImageFile[]): Promise<Blob> {
    const zip = new JSZip();

    console.log('Generating ZIP for', images.length, 'images');

    for (const image of images) {
        if (image.processedBlob && image.status === 'completed') {
            const fileName = `processed_${image.file.name}`;
            console.log('Adding to ZIP:', fileName, 'Size:', image.processedBlob.size);
            zip.file(fileName, image.processedBlob);
        } else {
            console.log('Skipping image:', image.file.name, 'Status:', image.status, 'Has blob:', !!image.processedBlob);
        }
    }

    console.log('Generating ZIP blob...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    console.log('ZIP blob generated, size:', zipBlob.size);

    return zipBlob;
}
