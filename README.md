# 📸 AI Image Processor

A powerful Next.js application for batch image processing with AI-powered restoration features using the Claid.ai API.

## ✨ Features

- **Batch Image Processing**: Upload and process multiple images at once
- **Preset Dimensions**: Quick presets for social media platforms (Instagram, Facebook, Twitter, etc.)
- **AI-Powered Restorations**:
  - **5 Upscale Methods**: Smart Enhance, Smart Resize, Digital Art, Faces, Photo
  - **Decompress**: Auto, Moderate, and Strong JPEG artifact removal
  - **Polish**: AI-powered sharpening and enhancement
- **Quality Control**: Adjustable compression quality (0-100%)
- **Batch Download**: Download all processed images as a ZIP file
- **Real-time Preview**: See original and processed images side-by-side
- **Size Tracking**: Monitor file size reduction/increase

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

1. Sign up at [Claid.ai](https://claid.ai/) and get your API key
2. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
3. Add your API key to `.env.local`:
   ```env
   CLAID_API_KEY=your_actual_api_key_here
   ```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Quick setup instructions
- **[CLAID_API_GUIDE.md](./CLAID_API_GUIDE.md)** - Comprehensive API documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🎯 How to Use

1. **Upload Images**: Drag and drop or click to select images
2. **Choose Dimensions**: Select from preset dimensions or use custom sizes
3. **Configure AI Restoration**:
   - Select an upscale method (or None)
   - Choose decompress mode (Auto, Moderate, Strong, or None)
   - Enable polish for extra sharpness (optional)
4. **Adjust Quality**: Set JPEG compression quality (0-100%)
5. **Process**: Click "Process All" to enhance your images
6. **Download**: Download individual images or all as a ZIP file

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Claid.ai API
- **Deployment**: Vercel-ready

## 🎨 AI Restoration Guide

### Upscale Methods

| Method | Best For | Use Case |
|--------|----------|----------|
| Smart Enhance | Small, low-quality images | Products, food, real estate |
| Smart Resize | High-quality images | Images with text, detailed photos |
| Digital Art | Artwork and illustrations | Drawings, cartoons, anime |
| Faces | Portrait photography | Photos of people |
| Photo | General photography | Nature, architecture, lifestyle |

### Decompress Modes

- **Auto**: Automatically detects and removes artifacts (recommended)
- **Moderate**: Standard JPEG artifact removal
- **Strong**: Aggressive artifact removal for heavily compressed images

### Polish

- Redraws image parts for sharper, more realistic results
- Works best combined with Smart Enhance upscale
- Maximum supported resolution: 16 MP (e.g., 4096 × 4096)

## 📁 Project Structure

```
impro/
├── app/
│   ├── api/
│   │   ├── claid-upload/      # Claid.ai API integration
│   │   └── process/            # Original processing endpoint
│   ├── layout.tsx
│   └── page.tsx                # Main application page
├── components/
│   ├── DownloadButton.tsx      # ZIP download functionality
│   ├── ImagePreview.tsx        # Image preview component
│   ├── ImageUploader.tsx       # Drag & drop uploader
│   └── ProcessingOptions.tsx   # AI restoration controls
├── lib/
│   ├── imageProcessor.ts       # Client-side processing
│   ├── utils.ts                # Utility functions
│   └── zipGenerator.ts         # ZIP file generation
├── types/
│   └── index.ts                # TypeScript type definitions
└── .env.local                  # Environment variables (create this!)
```

## 🔑 Environment Variables

Create a `.env.local` file with:

```env
CLAID_API_KEY=your_api_key_here
```

**Note**: Never commit `.env.local` to version control!

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `CLAID_API_KEY` environment variable in Vercel project settings
4. Deploy!

### Environment Variables in Production

Make sure to add your `CLAID_API_KEY` to your deployment platform's environment variables.

## 📝 API Credits

This application uses the [Claid.ai API](https://claid.ai/). API usage is subject to your Claid.ai subscription plan and rate limits.

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. Update types in `types/index.ts`
2. Modify API route in `app/api/claid-upload/route.ts`
3. Update UI components as needed
4. Test thoroughly with various image types

## 🐛 Troubleshooting

### "CLAID_API_KEY not configured" Error

- Ensure `.env.local` exists in the project root
- Verify the API key is correctly set
- Restart the development server

### Images Not Processing

- Check API key validity
- Verify API quota in Claid.ai dashboard
- Check browser console for errors
- Ensure images don't exceed size limits

### Polish Not Working

- Verify target dimensions don't exceed 16 MP
- Check console for specific error messages

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For Claid.ai API support:
- Documentation: [https://docs.claid.ai/](https://docs.claid.ai/)
- Website: [https://claid.ai/](https://claid.ai/)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI image processing powered by [Claid.ai](https://claid.ai/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ using Next.js and Claid.ai**
