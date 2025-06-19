# Vercel Deployment Guide for EduPapers

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Your Supabase project credentials

## Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for EduPapers deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/edupapers.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 3: Environment Variables
Add these environment variables in your Vercel project settings:

1. Go to your project on Vercel
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PDF_PROCESSOR_URL=your_pdf_processor_url
```

## Step 4: Custom Domain (Optional)
1. In Vercel project settings, go to Domains
2. Add your custom domain
3. Configure your domain's DNS settings as instructed

## Step 5: Deploy PDF Processor
For the PDF processor backend, you'll need to deploy it separately:

### Option A: Deploy to Vercel as Serverless Function
1. Move `server/pdf-processor.js` to `api/pdf-processor.js`
2. Update the file to work as a serverless function

### Option B: Deploy to Railway/Render
1. Create a separate repository for the PDF processor
2. Deploy to Railway, Render, or another Node.js hosting service

## Project Structure for Vercel
```
edupapers/
├── src/                  # React source files
├── public/              # Static assets
├── dist/                # Build output (auto-generated)
├── config/              # Configuration files
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

## Build Commands
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`
- **Output Directory**: `dist`

## Troubleshooting
1. **Build fails**: Check that all dependencies are in `package.json`
2. **Environment variables**: Ensure all `VITE_` prefixed variables are set
3. **Routing issues**: The `vercel.json` handles SPA routing
4. **CORS errors**: Configure your Supabase project's allowed origins

## Post-Deployment
1. Test all functionality
2. Update Supabase allowed origins to include your Vercel domain
3. Update any hardcoded URLs to use environment variables
4. Monitor deployment logs for any issues
