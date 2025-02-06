# Featok - Interactive Product Idea Voting Platform

A modern web application for collecting and voting on product ideas, built with Next.js, TypeScript, and MongoDB. Features a Tinder-like swipe interface and real-time vote tracking.

## Features

- 🎯 No account required - instant idea submission
- 👆 Intuitive swipe/click voting interface
- 📊 Real-time vote tracking and statistics
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- 🔄 Undo vote functionality
- 📋 Bulk idea submission
- 📊 Detailed voting analytics
- 🔗 Shareable links for idea groups

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Hooks
- **Animations**: Framer Motion

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/featok.git
   cd featok
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your MongoDB URI:
   ```
   MONGODB_URI=your_mongodb_uri_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on Vercel:

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

4. Add your MongoDB URI as an environment variable in the Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add MONGODB_URI with your connection string

The app will be automatically deployed on push to the main branch.

## Deployment Recommendations

For free hosting, here are the best options:

1. **Vercel** (Recommended):
   - Perfect for Next.js applications
   - Built-in CI/CD
   - Automatic HTTPS
   - Edge network deployment
   - Free tier includes:
     - Unlimited websites
     - Automatic deployments
     - Preview deployments
     - Basic analytics

2. **MongoDB Atlas** (Database):
   - Free tier includes:
     - 512MB storage
     - Shared clusters
     - Basic monitoring
     - Automated backups

Steps to deploy:
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add your MongoDB Atlas connection string to Vercel environment variables
4. Deploy!

Alternative hosting options:
- **Netlify**: Similar to Vercel, good free tier
- **Railway**: Good for full-stack apps, includes database hosting
- **Render**: Offers free static site hosting and database options

## Project Structure

```
src/
├── app/                 # Next.js 14 app directory
│   ├── api/            # API routes
│   ├── swipe/          # Swipe interface
│   ├── edit/           # Edit interface
│   └── my-lists/       # Lists management
├── components/         
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── models/             # MongoDB models
└── types/              # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Framer Motion for the smooth animations
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database solution
