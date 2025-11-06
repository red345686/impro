export interface ImageFile {
    id: string;
    file: File;
    preview: string;
    originalSize: number;
    processedSize?: number;
    status: 'pending' | 'processing' | 'completed' | 'error';
    processedBlob?: Blob;
    processedUrl?: string;
}

export interface PresetDimension {
    name: string;
    width: number;
    height: number;
}

export type UpscaleMethod = 'smart_enhance' | 'smart_resize' | 'digital_art' | 'faces' | 'photo' | 'none';
export type DecompressMode = 'moderate' | 'strong' | 'auto' | 'none';

export interface RestorationOptions {
    upscale?: UpscaleMethod;
    decompress?: DecompressMode;
    polish?: boolean;
}

export interface ProcessingOptions {
    preset: PresetDimension;
    quality: number;
    restorations?: RestorationOptions;
}

export interface ProcessingResult {
    success: boolean;
    originalSize: number;
    newSize: number;
    blob?: Blob;
    error?: string;
}

export interface ClaidImageInput {
    ext: string;
    mps: number;
    mime: string;
    format: string;
    width: number;
    height: number;
}

export interface ClaidImageOutput extends ClaidImageInput {
    tmp_url: string;
    object_key: string;
    object_bucket: string;
    object_uri: string;
    claid_storage_uri: string;
}

export interface ClaidEditResponse {
    input: ClaidImageInput;
    output: ClaidImageOutput;
    profiling: Record<string, any>;
}

export interface ClaidApiResponse {
    data: ClaidEditResponse;
}