import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';
import { nanoid } from 'nanoid';
import { spawn } from 'child_process';
import { join } from 'path';

async function generateTitle(ideas: Array<{ title: string; description: string }>) {
  try {
    return new Promise((resolve) => {
      try {
        const pythonProcess = spawn('python3', [
          join(process.cwd(), 'src/lib/summarize.py'),
          JSON.stringify(ideas)
        ]);

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('error', (err) => {
          console.error('Python process error:', err);
          resolve('My Ideas'); // Fallback on process error
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error('Python process exited with code:', code, 'Error:', error);
            resolve('My Ideas'); // Fallback title
          } else {
            resolve(output.trim() || 'My Ideas');
          }
        });

        // Add timeout
        setTimeout(() => {
          pythonProcess.kill();
          console.error('Python process timed out');
          resolve('My Ideas');
        }, 5000);
      } catch (err) {
        console.error('Failed to spawn Python process:', err);
        resolve('My Ideas');
      }
    });
  } catch (err) {
    console.error('generateTitle error:', err);
    return 'My Ideas';
  }
}

export async function POST(req: Request) {
  try {
    let ideas, creatorId;
    
    try {
      const body = await req.json();
      ideas = body.ideas;
      creatorId = body.creatorId;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new NextResponse(
        JSON.stringify({ message: 'Invalid request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate input
    if (!Array.isArray(ideas) || ideas.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: 'At least one idea is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!creatorId) {
      return new NextResponse(
        JSON.stringify({ message: 'Creator ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate each idea
    for (const idea of ideas) {
      if (!idea.title || !idea.description) {
        return new NextResponse(
          JSON.stringify({ message: 'Title and description are required for each idea' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    try {
      // Connect to database
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return new NextResponse(
        JSON.stringify({ message: 'Database connection failed' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate a unique group ID for this set of ideas
    const groupId = nanoid(10);

    // Generate title for the group
    const groupTitle = await generateTitle(ideas);

    try {
      // Create all ideas with the same group ID
      const createdIdeas = await Promise.all(
        ideas.map(async (idea, index) => {
          try {
            return await ProductIdea.create({
              title: idea.title.trim(),
              description: idea.description.trim(),
              shareableId: nanoid(10),
              groupId,
              groupTitle,
              creatorId,
              order: index,
              votes: { superLike: 0, up: 0, neutral: 0 },
              views: 0
            });
          } catch (createError) {
            console.error(`Failed to create idea ${index}:`, createError);
            throw new Error(`Failed to create idea ${index}: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          }
        })
      );

      return new NextResponse(
        JSON.stringify({
          message: 'Ideas submitted successfully',
          groupId,
          groupTitle,
          count: createdIdeas.length,
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      console.error('Failed to create ideas:', dbError);
      return new NextResponse(
        JSON.stringify({ message: 'Failed to save ideas to database' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in ideas creation:', error);
    return new NextResponse(
      JSON.stringify({ message: 'An unexpected error occurred' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
