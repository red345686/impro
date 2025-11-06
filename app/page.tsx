'use client';

import { useState, useCallback, useEffect } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImagePreview from '@/components/ImagePreview';
import ProcessingOptions from '@/components/ProcessingOptions';
import DownloadButton from '@/components/DownloadButton';
import { ImageFile, PresetDimension, UpscaleMethod, DecompressMode } from '@/types';
import { PRESET_DIMENSIONS, formatBytes } from '@/lib/utils';

type Step = 'upload' | 'configure' | 'process' | 'download';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PresetDimension>(PRESET_DIMENSIONS[0]);
  const [quality, setQuality] = useState(85);
  const [upscaleMethod, setUpscaleMethod] = useState<UpscaleMethod>('none');
  const [decompressMode, setDecompressMode] = useState<DecompressMode>('none');
  const [enablePolish, setEnablePolish] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  // Auto-advance to configure step when images are added
  const handleImagesAdded = useCallback((newImages: ImageFile[]) => {
    setImages(prev => [...prev, ...newImages]);
    if (currentStep === 'upload') {
      setTimeout(() => setCurrentStep('configure'), 300);
    }
  }, [currentStep]);

  // Update step based on image state
  useEffect(() => {
    if (images.length === 0 && currentStep !== 'upload') {
      setCurrentStep('upload');
    }
  }, [images.length, currentStep]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'p':
            e.preventDefault();
            if (images.some(img => img.status === 'pending')) {
              handleProcessAll();
            }
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, images]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const processImageWithClaid = async (image: ImageFile): Promise<ImageFile> => {
    try {
      console.log(`Starting to process with Claid API: ${image.file.name}`);

      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('width', selectedPreset.width.toString());
      formData.append('height', selectedPreset.height.toString());
      formData.append('upscale', upscaleMethod);
      formData.append('decompress', decompressMode);
      formData.append('polish', enablePolish.toString());

      const response = await fetch('/api/claid-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Claid API error:', error);
        throw new Error(error.error || 'Failed to process image');
      }

      const originalSize = parseInt(response.headers.get('X-Original-Size') || '0');
      const newSize = parseInt(response.headers.get('X-New-Size') || '0');

      const blob = await response.blob();

      console.log(`Processed: ${image.file.name}, Size: ${originalSize} → ${newSize} bytes`);

      return {
        ...image,
        status: 'completed',
        processedBlob: blob,
        processedSize: newSize,
      };
    } catch (error) {
      console.error('Image processing error:', error);
      return { ...image, status: 'error' };
    }
  };

  const handleProcessAll = async () => {
    setIsProcessing(true);
    const pendingImages = images.filter(img => img.status === 'pending');

    console.log('Processing', pendingImages.length, 'images with Claid API');
    console.log('Settings:', {
      preset: selectedPreset.name,
      upscale: upscaleMethod,
      decompress: decompressMode,
      polish: enablePolish,
    });

    for (const image of pendingImages) {
      setImages(prev => prev.map(img =>
        img.id === image.id ? { ...img, status: 'processing' } : img
      ));

      const processed = await processImageWithClaid(image);

      setImages(prev => prev.map(img =>
        img.id === processed.id ? processed : img
      ));
    }

    setIsProcessing(false);
    console.log('Processing complete');
  };

  const handleReset = useCallback(() => {
    if (images.length > 0 && !confirm(`Are you sure you want to reset? This will remove all ${images.length} image(s).`)) {
      return;
    }
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setImages([]);
    setCurrentStep('upload');
  }, [images]);

  const totalOriginalSize = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalProcessedSize = images.reduce((acc, img) => acc + (img.processedSize || 0), 0);
  const completedCount = images.filter(img => img.status === 'completed').length;
  const processingCount = images.filter(img => img.status === 'processing').length;

  const steps: { id: Step; label: string; icon: string }[] = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'configure', label: 'Configure', icon: '⚙️' },
    { id: 'process', label: 'Process', icon: '✨' },
    { id: 'download', label: 'Download', icon: '📥' },
  ];

  const getStepStatus = (step: Step) => {
    const stepIndex = steps.findIndex(s => s.id === step);
    const currentIndex = steps.findIndex(s => s.id === currentStep);

    if (step === 'download' && completedCount === 0) return 'disabled';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-zinc-950 dark:via-blue-950/20 dark:to-purple-950/20">
      {/* Floating Help Button */}
      <button
        onClick={() => setShowTooltips(!showTooltips)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group hover:shadow-blue-500/50"
        title={showTooltips ? 'Hide hints' : 'Show hints'}
        aria-label={showTooltips ? 'Hide hints' : 'Show hints'}
      >
        <span className="text-xl md:text-2xl filter drop-shadow-lg">{showTooltips ? '💡' : '❓'}</span>
        <span className="absolute bottom-full mb-3 right-0 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg hidden md:block">
          {showTooltips ? 'Hide hints' : 'Show hints'}
          <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"></span>
        </span>
      </button>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 md:space-y-6 pt-4 md:pt-8 pb-2 md:pb-4 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight leading-tight px-2">
              AI Image Processor
            </h1>
            <div className="h-1 w-16 md:w-24 mx-auto mt-3 md:mt-4 bg-linear-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-medium px-4">
            Transform your images with AI-powered enhancement, resizing, and restoration
          </p>

          {/* Keyboard Shortcuts Hint */}
          {showTooltips && (
            <div className="hidden md:inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium shadow-lg animate-slide-up">
              <span className="text-lg">⌨️</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-3 py-1.5 bg-linear-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-md border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold shadow-sm">Ctrl</kbd>
                  <span className="text-zinc-400">+</span>
                  <kbd className="px-3 py-1.5 bg-linear-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-md border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold shadow-sm">P</kbd>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">Process</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-3 py-1.5 bg-linear-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-md border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold shadow-sm">Ctrl</kbd>
                  <span className="text-zinc-400">+</span>
                  <kbd className="px-3 py-1.5 bg-linear-to-br from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-md border border-zinc-300 dark:border-zinc-700 font-mono text-xs font-semibold shadow-sm">R</kbd>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">Reset</span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Step Progress Bar */}
        {images.length > 0 && (
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 p-3 sm:p-4 md:p-6 animate-scale-in overflow-x-auto">
            <div className="flex items-center justify-center max-w-4xl mx-auto min-w-max px-2">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => {
                        if (status !== 'disabled') {
                          setCurrentStep(step.id);
                        }
                      }}
                      disabled={status === 'disabled'}
                      className={`flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 ${status === 'disabled'
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer hover:scale-110 active:scale-95'
                        }`}
                    >
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-base md:text-xl transition-all duration-300 relative ${status === 'active'
                          ? 'bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-xl shadow-blue-500/50 scale-110'
                          : status === 'completed'
                            ? 'bg-linear-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white shadow-md'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                          }`}
                      >
                        {status === 'completed' ? (
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="filter drop-shadow-sm">{step.icon}</span>
                        )}
                        {status === 'active' && (
                          <span className="absolute -inset-1 bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg md:rounded-xl opacity-20 blur-lg animate-pulse-soft"></span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-semibold transition-all duration-300 whitespace-nowrap ${status === 'active'
                          ? 'text-blue-600 dark:text-blue-400 scale-105'
                          : status === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-zinc-500 dark:text-zinc-500'
                          }`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-12 sm:w-16 md:w-24 h-0.5 mx-2 md:mx-4 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden rounded-full">
                        <div
                          className={`absolute inset-0 transition-all duration-700 ease-out rounded-full ${getStepStatus(steps[index + 1].id) === 'completed' || getStepStatus(steps[index + 1].id) === 'active'
                            ? 'bg-linear-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700'
                            : ''
                            }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content */}
        {currentStep === 'upload' || images.length === 0 ? (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            {showTooltips && images.length === 0 && (
              <div className="bg-linear-to-r from-blue-50 via-purple-50/50 to-pink-50 dark:from-blue-950/50 dark:via-purple-950/30 dark:to-pink-950/50 border-2 border-blue-200/50 dark:border-blue-800/50 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-sm animate-slide-up">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-linear-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-lg">
                    🚀
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold bg-linear-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3 md:mb-4">
                      Get Started in Seconds
                    </h3>
                    <ul className="space-y-2 md:space-y-3 stagger-animation">
                      <li className="flex items-start gap-2 md:gap-3 group">
                        <span className="shrink-0 w-6 h-6 md:w-7 md:h-7 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-md md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm group-hover:scale-110 transition-transform">1</span>
                        <span className="text-blue-900 dark:text-blue-100 font-medium flex-1 text-sm md:text-base">Upload one or more images by dragging them or clicking the upload area below</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3 group">
                        <span className="shrink-0 w-6 h-6 md:w-7 md:h-7 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-md md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm group-hover:scale-110 transition-transform">2</span>
                        <span className="text-blue-900 dark:text-blue-100 font-medium flex-1 text-sm md:text-base">Configure AI settings to enhance your images with upscaling and restoration</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3 group">
                        <span className="shrink-0 w-6 h-6 md:w-7 md:h-7 bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400 rounded-md md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm group-hover:scale-110 transition-transform">3</span>
                        <span className="text-blue-900 dark:text-blue-100 font-medium flex-1 text-sm md:text-base">Process all images with one click using advanced AI algorithms</span>
                      </li>
                      <li className="flex items-start gap-2 md:gap-3 group">
                        <span className="shrink-0 w-6 h-6 md:w-7 md:h-7 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-md md:rounded-lg flex items-center justify-center font-bold text-xs md:text-sm group-hover:scale-110 transition-transform">4</span>
                        <span className="text-blue-900 dark:text-blue-100 font-medium flex-1 text-sm md:text-base">Download all processed images as a convenient ZIP file</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            <ImageUploader onImagesAdded={handleImagesAdded} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Images Header */}
              <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 sm:p-6 md:p-8 card-hover">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                      Your Images
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2">
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse-soft"></span>
                        {images.length} image{images.length !== 1 ? 's' : ''}
                      </p>
                      {completedCount > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {completedCount} completed
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleReset}
                      className="flex-1 sm:flex-none px-3 sm:px-5 py-2 md:py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg md:rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 hover:scale-105 active:scale-95 font-medium shadow-sm group text-sm md:text-base"
                      title="Reset all (Ctrl+R)"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reset</span>
                    </button>
                    {currentStep !== 'process' && images.some(img => img.status === 'pending') && (
                      <button
                        onClick={() => setCurrentStep('process')}
                        className="flex-1 sm:flex-none px-3 sm:px-5 py-2 md:py-2.5 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-lg md:rounded-xl hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 hover:scale-105 active:scale-95 font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/50 text-sm md:text-base"
                      >
                        <span>Continue</span>
                        <svg className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 p-4 md:p-6 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/50 dark:via-purple-950/30 dark:to-pink-950/50 rounded-xl md:rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-lg animate-scale-in">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-semibold gap-2">
                      <span className="flex items-center gap-3 text-blue-900 dark:text-blue-100">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Processing with AI...
                      </span>
                      <span className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                        <span className="text-2xl font-bold">{completedCount}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">/</span>
                        <span className="text-xl">{images.length}</span>
                        <span className="ml-2 px-3 py-1 bg-white/80 dark:bg-zinc-900/80 rounded-full text-xs font-bold">
                          {Math.round((completedCount / images.length) * 100)}%
                        </span>
                      </span>
                    </div>
                    <div className="relative w-full bg-white/80 dark:bg-zinc-800/80 rounded-full h-4 overflow-hidden shadow-inner backdrop-blur-sm">
                      <div
                        className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-500 dark:via-purple-500 dark:to-pink-500 h-full transition-all duration-700 ease-out overflow-hidden shadow-lg"
                        style={{ width: `${(completedCount / images.length) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute inset-0 bg-linear-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 animate-pulse-soft" />
                      </div>
                    </div>
                    {processingCount > 0 && (
                      <p className="text-xs text-center text-blue-700 dark:text-blue-300 font-medium flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {processingCount} image{processingCount !== 1 ? 's' : ''} currently processing...
                      </p>
                    )}
                  </div>
                )}

                {/* Image Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {images.map(image => (
                    <ImagePreview
                      key={image.id}
                      image={image}
                      onRemove={handleRemoveImage}
                    />
                  ))}
                </div>

                {/* Add More Button */}
                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <ImageUploader onImagesAdded={handleImagesAdded} />
                </div>
              </div>
            </div>

            {/* Right Column - Settings & Actions */}
            <div className="space-y-4 md:space-y-6">
              {/* Step-based Content */}
              {currentStep === 'configure' && (
                <div className="space-y-6 animate-fade-in">
                  {showTooltips && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        ⚙️ Configure how your images should be processed. Choose dimensions, quality, and AI enhancements.
                      </p>
                    </div>
                  )}
                  <ProcessingOptions
                    selectedPreset={selectedPreset}
                    quality={quality}
                    upscaleMethod={upscaleMethod}
                    decompressMode={decompressMode}
                    enablePolish={enablePolish}
                    onPresetChange={setSelectedPreset}
                    onQualityChange={setQuality}
                    onUpscaleChange={setUpscaleMethod}
                    onDecompressChange={setDecompressMode}
                    onPolishChange={setEnablePolish}
                  />
                  <button
                    onClick={() => setCurrentStep('process')}
                    className="w-full px-6 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 hover:scale-105 shadow-lg"
                  >
                    <span>Continue to Process</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              )}

              {currentStep === 'process' && (
                <div className="space-y-6 animate-fade-in">
                  {showTooltips && !isProcessing && images.some(img => img.status === 'pending') && (
                    <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        ✨ Ready to process! Click the button below to apply AI enhancements to all your images.
                      </p>
                    </div>
                  )}

                  {/* Settings Summary */}
                  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                      Current Settings
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Dimensions:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedPreset.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Quality:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{quality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Upscale:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {upscaleMethod === 'none' ? 'None' : upscaleMethod.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Decompress:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {decompressMode === 'none' ? 'None' : decompressMode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 dark:text-zinc-400">Polish:</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {enablePolish ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep('configure')}
                      className="w-full mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all text-sm"
                    >
                      ← Change Settings
                    </button>
                  </div>

                  <button
                    onClick={handleProcessAll}
                    disabled={isProcessing || images.every(img => img.status !== 'pending')}
                    className="w-full px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:scale-105 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Processing... ({processingCount})
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Process All Images (Ctrl+P)
                      </>
                    )}
                  </button>
                </div>
              )}

              {currentStep === 'download' && (
                <div className="space-y-6 animate-fade-in">
                  {showTooltips && completedCount > 0 && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        🎉 All done! Your images are ready to download.
                      </p>
                    </div>
                  )}

                  {completedCount > 0 && (
                    <div className={`p-6 rounded-xl border transition-all duration-300 shadow-lg ${totalProcessedSize > totalOriginalSize
                      ? 'bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800'
                      : 'bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800'
                      }`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-sm font-semibold ${totalProcessedSize > totalOriginalSize
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-green-900 dark:text-green-100'
                          }`}>
                          {totalProcessedSize > totalOriginalSize ? '📈 Total Size Increased' : '💾 Total Size Saved'}
                        </p>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${totalProcessedSize > totalOriginalSize
                          ? 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
                          : 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100'
                          }`}>
                          {totalOriginalSize > 0 ? Math.abs(Math.round(((totalProcessedSize - totalOriginalSize) / totalOriginalSize) * 100)) : 0}%
                        </span>
                      </div>
                      <p className={`text-3xl font-bold mt-2 ${totalProcessedSize > totalOriginalSize
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-green-600 dark:text-green-400'
                        }`}>
                        {totalProcessedSize > totalOriginalSize
                          ? `+${formatBytes(totalProcessedSize - totalOriginalSize)}`
                          : formatBytes(totalOriginalSize - totalProcessedSize)
                        }
                      </p>
                      <div className={`mt-4 pt-4 border-t space-y-2 ${totalProcessedSize > totalOriginalSize
                        ? 'border-blue-200 dark:border-blue-800'
                        : 'border-green-200 dark:border-green-800'
                        }`}>
                        <div className="flex justify-between text-sm">
                          <span className={totalProcessedSize > totalOriginalSize ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>
                            Original
                          </span>
                          <span className={`font-semibold ${totalProcessedSize > totalOriginalSize ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`}>
                            {formatBytes(totalOriginalSize)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={totalProcessedSize > totalOriginalSize ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>
                            Processed
                          </span>
                          <span className={`font-semibold ${totalProcessedSize > totalOriginalSize ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`}>
                            {formatBytes(totalProcessedSize)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-dashed border-current/20">
                          <span className={totalProcessedSize > totalOriginalSize ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}>
                            Images Completed
                          </span>
                          <span className={`font-semibold ${totalProcessedSize > totalOriginalSize ? 'text-blue-900 dark:text-blue-100' : 'text-green-900 dark:text-green-100'}`}>
                            {completedCount} / {images.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <DownloadButton
                    images={images}
                    disabled={completedCount === 0}
                  />

                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
