# Featok - Product Idea Voting Platform

A modern platform for collecting and voting on product ideas with a Tinder-like interface.

<div align="center">
  <img src="docs/assets/demo.gif" alt="Featok Demo" width="300" />
</div>

## Features

- 🎯 Create and share idea lists
- 👆 Tinder-style swipe voting
- 📊 Real-time vote tracking
- 🔄 Undo votes
- 📱 Mobile-friendly design
- 🎨 Beautiful animations

## How It Works

### Creating Ideas
Add your product ideas with titles and descriptions. Separate multiple ideas with blank lines for easy bulk submission.

### Voting Interface
Swipe right for Love ❤️, up for Neat 👍, or left for Meh 🤷‍♂️. You can also use the buttons below the card for voting.

### Results Dashboard
View voting results and statistics for your ideas, including love, neat, and meh counts for each idea.

### Managing Lists
Easily edit, share, or delete your idea lists. Share links with others to collect votes on your ideas.

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/AHorihuela/featok.git
cd featok
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your MongoDB connection string.

4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Featok.

## Tech Stack

- Next.js 14
- TypeScript
- MongoDB
- Framer Motion
- Tailwind CSS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
