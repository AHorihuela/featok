'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Collection {
  _id: string;
  name: string;
  ideas: Array<{
    title: string;
    description?: string;
  }>;
}

interface VoteStats {
  up: number;
  down: number;
}

interface ParsedIdea {
  title: string;
  description?: string;
}

export default function Home() {
  const [collectionName, setCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bulkIdeas, setBulkIdeas] = useState('');
  const [stats, setStats] = useState<Record<string, VoteStats>>({});

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      const collection = collections.find(c => c._id === selectedCollection);
      if (collection) {
        const formattedIdeas = collection.ideas
          .map(idea => `- ${idea.title}${idea.description ? '\n' + idea.description : ''}`)
          .join('\n\n');
        setBulkIdeas(formattedIdeas);
      }
    }
  }, [selectedCollection, collections]);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('/api/collections');
      setCollections(response.data);
      response.data.forEach((collection: Collection) => {
        fetchStats(collection._id);
      });
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  };

  const createCollection = async () => {
    if (!collectionName.trim()) return;
    try {
      const response = await axios.post('/api/collections', { name: collectionName });
      setCollections([...collections, response.data]);
      setCollectionName('');
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const parseIdeas = (text: string): ParsedIdea[] => {
    return text.split('\n')
      .reduce((acc: ParsedIdea[], line, index, lines) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('-')) {
          const title = trimmedLine.slice(1).trim();
          const nextLine = lines[index + 1]?.trim();
          const description = nextLine && !nextLine.startsWith('-') ? nextLine : '';
          acc.push({ title, description });
        }
        return acc;
      }, []);
  };

  const fetchStats = async (collectionId: string) => {
    try {
      const response = await axios.get(`/api/collections/${collectionId}/stats`);
      setStats(prev => ({ ...prev, [collectionId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getShareableLink = (collectionId: string) => {
    return `${window.location.origin}/swipe/${collectionId}`;
  };

  const addBulkIdeas = async () => {
    if (!selectedCollection || !bulkIdeas.trim()) return;
    const ideas = parseIdeas(bulkIdeas);
    try {
      await axios.put(`/api/collections/${selectedCollection}/ideas`, { ideas });
      await fetchCollections();
    } catch (error) {
      console.error('Failed to update ideas:', error);
    }
  };

  return (
    <main className="min-h-screen p-6 space-y-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Idea Collections Dashboard</h1>
        <ThemeToggle />
      </header>

      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Create New Collection</h2>
        <div className="flex gap-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="Collection name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <button 
            className="btn-primary whitespace-nowrap"
            disabled={!collectionName.trim()}
            onClick={createCollection}
          >
            Create
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold mb-4">Manage Ideas</h2>
        <div className="space-y-4">
          <select 
            className="input"
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="">Select a collection</option>
            {collections.map(collection => (
              <option key={collection._id} value={collection._id}>
                {collection.name} ({collection.ideas.length} ideas)
              </option>
            ))}
          </select>
          
          <div className="flex items-center justify-between text-sm text-secondary mb-2">
            <span>Edit Ideas</span>
            <div className="space-x-2">
              <button 
                className="text-secondary hover:text-primary transition-colors"
                onClick={() => setBulkIdeas('')}
              >
                Clear
              </button>
              <button 
                className="text-secondary hover:text-primary transition-colors"
                onClick={() => setBulkIdeas(bulkIdeas + '\n- ')}
              >
                Add New
              </button>
            </div>
          </div>

          <textarea
            className="input min-h-[200px] font-mono text-sm"
            value={bulkIdeas}
            onChange={(e) => setBulkIdeas(e.target.value)}
            placeholder="Enter your ideas, one per line:&#10;- Idea title&#10;Description goes here&#10;&#10;- Another idea&#10;With its description"
          />

          <div className="flex justify-between items-center">
            <span className="text-sm text-secondary">
              {parseIdeas(bulkIdeas).length} ideas
            </span>
            <button 
              className="btn-success"
              disabled={!selectedCollection || !bulkIdeas.trim()}
              onClick={addBulkIdeas}
            >
              Save Changes
            </button>
          </div>
        </div>
      </section>

      {/* Collections List */}
      <section className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Collections</h2>
          <button
            onClick={fetchCollections}
            className="px-4 py-2 text-sm rounded-lg hover:bg-opacity-80 transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            Refresh Stats
          </button>
        </div>
        <div className="space-y-6">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium">{collection.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--accent-secondary)' }}>
                      👍 {stats[collection._id]?.up || 0}
                    </span>
                    <span style={{ color: 'var(--accent-danger)' }}>
                      👎 {stats[collection._id]?.down || 0}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {collection.ideas.length} ideas
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Shareable Link:
                </span>
                <input
                  type="text"
                  readOnly
                  value={getShareableLink(collection._id)}
                  className="input flex-1 text-sm py-1"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
