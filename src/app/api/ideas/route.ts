import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductIdea from '@/models/ProductIdea';
import { nanoid } from 'nanoid';
import { spawn } from 'child_process';
import { join } from 'path';

interface ErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

function createErrorResponse(error: ErrorResponse, status: number) {
  return NextResponse.json(
    { error },
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

async function generateTitle(ideas: Array<{ title: string; description: string }>) {
  try {
    // First try a simple JavaScript-based title generation
    if (ideas.length === 1) {
      return ideas[0].title;
    }

    // For multiple ideas, try to find common themes in titles
    const commonWords = ideas
      .map(idea => idea.title.toLowerCase().split(/\s+/))
      .reduce((acc, words) => {
        words.forEach(word => {
          if (word.length > 3) { // Only count words longer than 3 chars
            acc[word] = (acc[word] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

    // Find the most common meaningful words
    const commonThemes = Object.entries(commonWords)
      .filter(([word]) => !['the', 'and', 'for', 'with'].includes(word))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([word]) => word);

    if (commonThemes.length > 0) {
      const theme = commonThemes.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `${theme} Ideas`;
    }

    // If no common themes found, try Python summarization
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
        return 'My Ideas'; // Fallback on process error
      });

      const result = await new Promise<string>((resolve) => {
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
      });

      return result;
    } catch (err) {
      console.error('Python process failed:', err);
      return 'My Ideas';
    }
  } catch (err) {
    console.error('Title generation error:', err);
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
      return createErrorResponse(
        { message: 'Invalid request body', code: 'INVALID_JSON' },
        400
      );
    }

    if (!Array.isArray(ideas) || ideas.length === 0) {
      return createErrorResponse(
        { message: 'At least one idea is required', code: 'MISSING_IDEAS' },
        400
      );
    }

    if (!creatorId) {
      return createErrorResponse(
        { message: 'Creator ID is required', code: 'MISSING_CREATOR_ID' },
        400
      );
    }

    for (const idea of ideas) {
      if (!idea.title || !idea.description) {
        return createErrorResponse(
          { message: 'Title and description are required for each idea', code: 'INVALID_IDEA' },
          400
        );
      }
    }

    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return createErrorResponse(
        { 
          message: 'Database connection failed', 
          code: 'DB_CONNECTION_ERROR',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        503
      );
    }

    const groupId = nanoid(10);
    const groupTitle = await generateTitle(ideas);

    try {
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
            throw new Error(`Failed to create idea ${index}: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          }
        })
      );

      return NextResponse.json({
        message: 'Ideas submitted successfully',
        groupId,
        groupTitle,
        count: createdIdeas.length,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (dbError) {
      console.error('Failed to create ideas:', dbError);
      return createErrorResponse(
        { 
          message: 'Failed to save ideas to database', 
          code: 'DB_ERROR',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        500
      );
    }
  } catch (error) {
    console.error('Unexpected error in ideas creation:', error);
    return createErrorResponse(
      { 
        message: 'An unexpected error occurred', 
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error)
      },
      500
    );
  }
}
