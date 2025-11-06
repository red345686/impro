import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File;
        const width = formData.get('width') as string;
        const height = formData.get('height') as string;
        const upscale = formData.get('upscale') as string;
        const decompress = formData.get('decompress') as string;
        const polish = formData.get('polish') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const apiKey = process.env.CLAID_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'CLAID_API_KEY not configured' },
                { status: 500 }
            );
        }

        // Build the operations object for Claid API
        const operations: any = {};

        // Add resizing if dimensions are provided
        if (width || height) {
            operations.resizing = {};
            // Convert string numbers to integers for Claid API
            if (width) operations.resizing.width = parseInt(width);
            if (height) operations.resizing.height = parseInt(height);
        }

        // Add restoration operations
        if (upscale || decompress || polish) {
            operations.restorations = {};

            if (upscale && upscale !== 'none') {
                operations.restorations.upscale = upscale;
            }

            if (decompress && decompress !== 'none') {
                operations.restorations.decompress = decompress;
            }

            if (polish === 'true') {
                operations.restorations.polish = true;
            }
        }

        // Create multipart form data for Claid API
        const claidFormData = new FormData();

        // Add the file
        claidFormData.append('file', file);

        // Add the operations as JSON
        const dataPayload = {
            operations: operations
        };
        claidFormData.append('data', JSON.stringify(dataPayload));

        console.log('Sending request to Claid API with operations:', JSON.stringify(operations, null, 2));

        // Send request to Claid API
        const response = await fetch('https://api.claid.ai/v1/image/edit/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
            },
            body: claidFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claid API error:', response.status, errorText);
            return NextResponse.json(
                {
                    error: `Claid API error: ${response.status}`,
                    details: errorText
                },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('Claid API response:', result);

        // Download the processed image from Claid's temporary URL
        if (result.data?.output?.tmp_url) {
            const imageResponse = await fetch(result.data.output.tmp_url);

            if (!imageResponse.ok) {
                throw new Error('Failed to download processed image');
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const processedSize = imageBuffer.byteLength;

            return new NextResponse(imageBuffer, {
                status: 200,
                headers: {
                    'Content-Type': result.data.output.mime || 'image/jpeg',
                    'X-Original-Size': file.size.toString(),
                    'X-New-Size': processedSize.toString(),
                    'X-Claid-Response': JSON.stringify(result.data),
                },
            });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Image processing error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process image',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
