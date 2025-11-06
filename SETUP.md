# Quick Setup Instructions

## ⚡ Get Started in 3 Steps

### Step 1: Install Dependencies (if needed)
```bash
cd impro
npm install
```

### Step 2: Configure Your API Key

1. Open `.env.local` file
2. Replace `your_api_key_here` with your actual Claid.ai API key:

```env
CLAID_API_KEY=your_actual_api_key_from_claid_ai
```

**Get your API key**: Sign up at [https://claid.ai/](https://claid.ai/)

### Step 3: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 What's New

### AI-Powered Image Restoration Features:

✅ **Upscale Methods**
- Smart Enhance (low quality products)
- Smart Resize (high quality with text)
- Digital Art (illustrations, cartoons)
- Faces (portraits)
- Photo (general photography)

✅ **Decompress**
- Auto-detect and remove JPEG artifacts
- Moderate or Strong compression removal

✅ **Polish**
- Sharpen and enhance image details
- Makes images more realistic

### How to Use:

1. **Upload** images (drag & drop or click)
2. **Select** preset dimensions
3. **Choose** AI restoration options:
   - Upscale method
   - Decompress mode
   - Enable polish (optional)
4. **Process** all images
5. **Download** results (individual or ZIP)

## 🔧 Troubleshooting

**"CLAID_API_KEY not configured" error?**
- Make sure `.env.local` exists in the `impro` folder
- Check that you replaced `your_api_key_here` with your actual API key
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

**Images fail to process?**
- Verify your API key is valid
- Check you have available API credits in your Claid.ai account
- Ensure images aren't too large (polish has 16 MP limit)

## 📚 More Information

See `CLAID_API_GUIDE.md` for detailed documentation about:
- Complete API reference
- Technical implementation details
- Best practices for each restoration method
- Advanced troubleshooting

## 🎨 Tips for Best Results

- **Product Photos**: Use Smart Enhance upscale
- **Photos with Text**: Use Smart Resize upscale
- **Illustrations/Cartoons**: Use Digital Art upscale
- **Portraits**: Use Faces upscale
- **General Photos**: Use Photo upscale
- **Compressed Images**: Enable Auto decompress
- **Extra Sharpness**: Enable Polish (works great with Smart Enhance)

---

**Need Help?** Check the full guide in `CLAID_API_GUIDE.md`
