import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const width = parseInt(formData.get('width') as string);
        const height = parseInt(formData.get('height') as string);
        const quality = parseInt(formData.get('quality') as string);

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalSize = buffer.length;

        // Process image with sharp
        const processedBuffer = await sharp(buffer)
            .resize(width, height, {
                fit: 'cover',
                position: 'center',
            })
            .jpeg({ quality })
            .toBuffer();

        const newSize = processedBuffer.length;

        return new NextResponse(processedBuffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'X-Original-Size': originalSize.toString(),
                'X-New-Size': newSize.toString(),
            },
        });
    } catch (error) {
        console.error('Image processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process image' },
            { status: 500 }
        );
    }
}
