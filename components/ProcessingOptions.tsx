'use client';

import { PRESET_DIMENSIONS } from '@/lib/utils';
import { PresetDimension, UpscaleMethod, DecompressMode } from '@/types';

interface ProcessingOptionsProps {
    selectedPreset: PresetDimension;
    quality: number;
    upscaleMethod: UpscaleMethod;
    decompressMode: DecompressMode;
    enablePolish: boolean;
    onPresetChange: (preset: PresetDimension) => void;
    onQualityChange: (quality: number) => void;
    onUpscaleChange: (method: UpscaleMethod) => void;
    onDecompressChange: (mode: DecompressMode) => void;
    onPolishChange: (enabled: boolean) => void;
}

export default function ProcessingOptions({
    selectedPreset,
    quality,
    upscaleMethod,
    decompressMode,
    enablePolish,
    onPresetChange,
    onQualityChange,
    onUpscaleChange,
    onDecompressChange,
    onPolishChange,
}: ProcessingOptionsProps) {
    return (
        <div className="space-y-4 md:space-y-6 p-4 sm:p-6 md:p-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 card-hover">
            <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-lg md:rounded-xl flex items-center justify-center text-base md:text-xl shadow-lg">
                    ⚙️
                </div>
                <h3 className="text-xl md:text-2xl font-bold bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                    Processing Settings
                </h3>
            </div>

            <div className="space-y-2 md:space-y-3">
                <label className="flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="text-base md:text-lg">📐</span>
                    <span>Output Dimensions</span>
                </label>
                <select
                    value={selectedPreset.name}
                    onChange={(e) => {
                        const preset = PRESET_DIMENSIONS.find(p => p.name === e.target.value);
                        if (preset) onPresetChange(preset);
                    }}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 font-medium hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer text-sm md:text-base"
                >
                    {PRESET_DIMENSIONS.map(preset => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name} ({preset.width}×{preset.height}px)
                        </option>
                    ))}
                </select>
                <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 md:gap-1.5 mt-1.5 md:mt-2">
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Choose the target size for all images</span>
                </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg md:rounded-xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-md space-y-3 md:space-y-4">
                <div className="flex justify-between items-center">
                    <label className="flex items-center gap-1.5 md:gap-2.5 text-sm md:text-base font-bold text-blue-900 dark:text-blue-100">
                        <span className="w-7 h-7 md:w-8 md:h-8 bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-md md:rounded-lg flex items-center justify-center text-base md:text-lg shadow-md">
                            🎨
                        </span>
                        <span>Quality</span>
                    </label>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-3xl md:text-4xl font-extrabold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent filter drop-shadow-sm">
                            {quality}%
                        </span>
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <div className="relative pt-1">
                        {/* Track with gradient fill */}
                        <div className="relative h-5 md:h-6 bg-white/80 dark:bg-zinc-800/80 rounded-full overflow-hidden shadow-inner backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-800/50">
                            {/* Gradient fill based on value */}
                            <div
                                className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 transition-all duration-300 ease-out relative overflow-hidden"
                                style={{ width: `${quality}%` }}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                {/* Pulse effect */}
                                <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 animate-pulse-soft" />
                            </div>

                            {/* Range input overlay */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={quality}
                                onChange={(e) => {
                                    const newQuality = parseInt(e.target.value);
                                    console.log('Quality changed to:', newQuality);
                                    onQualityChange(newQuality);
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                style={{
                                    WebkitAppearance: 'none',
                                    appearance: 'none'
                                }}
                            />

                            {/* Custom thumb indicator */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-20"
                                style={{ left: `calc(${quality}% - 11px)` }}
                            >
                                <div className="w-5 h-5 md:w-7 md:h-7 bg-white dark:bg-zinc-100 rounded-full shadow-lg border-2 md:border-3 border-blue-600 dark:border-blue-400 relative">
                                    <div className="absolute inset-0 rounded-full bg-blue-600 dark:bg-blue-400 opacity-20 animate-pulse-soft" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Labels with better styling */}
                    <div className="flex justify-between items-center text-[10px] md:text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 px-2 py-1 bg-white/60 dark:bg-zinc-800/60 rounded-md backdrop-blur-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Smaller file
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 px-2 py-1 bg-white/60 dark:bg-zinc-800/60 rounded-md backdrop-blur-sm">
                            Best quality
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </span>
                    </div>

                    {/* Quality indicator text */}
                    <div className="text-center">
                        <p className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200">
                            {quality < 30 && '📉 Low quality - Smaller file size'}
                            {quality >= 30 && quality < 70 && '⚖️ Balanced quality and file size'}
                            {quality >= 70 && quality < 90 && '📈 High quality - Larger file size'}
                            {quality >= 90 && '✨ Maximum quality - Largest file size'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t-2 border-zinc-200 dark:border-zinc-800 pt-4 md:pt-6">
                <h4 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 md:mb-5 flex items-center gap-1.5 md:gap-2.5">
                    <span className="w-7 h-7 md:w-8 md:h-8 bg-linear-to-br from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500 rounded-md md:rounded-lg flex items-center justify-center text-base md:text-lg shadow-md">
                        ✨
                    </span>
                    <span>AI Enhancements</span>
                </h4>

                <div className="space-y-4 md:space-y-5">
                    {/* Upscale Method */}
                    <div className="space-y-2 md:space-y-3">
                        <label className="flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            <span className="text-base md:text-lg">🔍</span>
                            <span>Upscale Method</span>
                        </label>
                        <select
                            value={upscaleMethod}
                            onChange={(e) => onUpscaleChange(e.target.value as UpscaleMethod)}
                            className="w-full px-3 py-2.5 md:px-4 md:py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all duration-300 text-xs sm:text-sm font-medium hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer"
                        >
                            <option value="none">None - Keep original quality</option>
                            <option value="smart_enhance">🎯 Smart Enhance - Low quality products</option>
                            <option value="smart_resize">📱 Smart Resize - High quality + text</option>
                            <option value="digital_art">🎨 Digital Art - Illustrations, cartoons</option>
                            <option value="faces">👤 Faces - People portraits</option>
                            <option value="photo">📷 Photo - General photography</option>
                        </select>
                        <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 md:gap-1.5">
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>AI generates new pixels for better quality</span>
                        </p>
                    </div>

                    {/* Decompress Mode */}
                    <div className="space-y-2 md:space-y-3">
                        <label className="flex items-center gap-1.5 md:gap-2 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            <span className="text-base md:text-lg">🧹</span>
                            <span>Artifact Removal</span>
                        </label>
                        <select
                            value={decompressMode}
                            onChange={(e) => onDecompressChange(e.target.value as DecompressMode)}
                            className="w-full px-3 py-2.5 md:px-4 md:py-3.5 bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none transition-all duration-300 text-xs sm:text-sm font-medium hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer"
                        >
                            <option value="none">None - Keep as is</option>
                            <option value="auto">🤖 Auto - Detect & remove artifacts</option>
                            <option value="moderate">⚡ Moderate - Remove JPEG artifacts</option>
                            <option value="strong">💪 Strong - Aggressive removal</option>
                        </select>
                        <p className="text-[10px] md:text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 md:gap-1.5">
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Removes compression artifacts and noise</span>
                        </p>
                    </div>

                    {/* Polish Toggle */}
                    <div className="p-3 sm:p-4 md:p-5 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg md:rounded-xl border-2 border-purple-200/50 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-all duration-300">
                        <label className="flex items-start gap-2 md:gap-3.5 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={enablePolish}
                                onChange={(e) => onPolishChange(e.target.checked)}
                                className="mt-0.5 md:mt-1 w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400 bg-white dark:bg-zinc-700 border-2 border-purple-300 dark:border-purple-600 rounded-md md:rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 cursor-pointer transition-all duration-300"
                            />
                            <div className="flex-1">
                                <span className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors flex items-center gap-1.5 md:gap-2">
                                    <span className="text-base md:text-lg">💎</span>
                                    <span>Polish (Advanced)</span>
                                </span>
                                <p className="text-[10px] md:text-xs text-purple-700 dark:text-purple-300 mt-1.5 md:mt-2 leading-relaxed">
                                    Redraws parts of the image for sharper, more realistic look. Maximum 16 megapixels.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
