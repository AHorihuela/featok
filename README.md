# Featok - Product Idea Voting Platform

A modern platform for collecting and voting on product ideas with a Tinder-like interface.

## Features

- 🎯 Create and share idea lists
- 👆 Tinder-style swipe voting
- 📊 Real-time vote tracking
- 🔄 Undo votes
- 📱 Mobile-friendly design
- 🎨 Beautiful animations

## How It Works

### Creating Ideas
![Creating Ideas](docs/assets/create.png)
Add your product ideas with titles and descriptions. Separate multiple ideas with blank lines.

### Voting Interface
![Voting Interface](docs/assets/vote.png)
Swipe right for Love ❤️, up for Neat 👍, or left for Meh 🤷‍♂️.

### Results Dashboard
![Results](docs/assets/results.png)
View voting results and statistics for your ideas.

### Managing Lists
![Managing Lists](docs/assets/manage.png)
Edit, share, or delete your idea lists.

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/featok.git
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
