import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client
const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Google AI API key. Please set GOOGLE_AI_API_KEY in .env.local or Vercel.');
}

interface HoleData {
  score: number | null;
  putts: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
}

interface RawHoleData {
  score?: number | null;
  putts?: number | null;
  fairwayHit?: boolean | null;
  greenInRegulation?: boolean | null;
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const ANALYSIS_PROMPT = `You are a specialized golf scorecard analyzer. I will show you a golf scorecard image. Your task is to carefully extract the following information with high precision:

1. Course Name:
   - Look for the course logo or name at the top of the scorecard (e.g., "O'Neal Golf Management")

2. Date:
   - Look for a date field, typically at the top
   - If not explicitly shown, return null

3. For each hole (1-18), carefully analyze:
   - Score: Find the HANDWRITTEN numbers in the player's score row (NOT the "Par" row)
           This is typically where the player's name is written on the left
           These are the actual strokes taken per hole
   - Putts: Find the HANDWRITTEN numbers in the "Putts" row
           This is typically below the score row
           These numbers are usually smaller than the score numbers
   - Fairway Hit: Look for checkmarks (✓) or marks in the "F" row for fairways
   - Green in Regulation: Look for checkmarks (✓) or marks in the "GIR" row

IMPORTANT SCORING INSTRUCTIONS:
- DO NOT read from the "Par" row - this shows the hole's par, not the player's score
- Look for the row with a player's name or where scores are handwritten
- Scores are typically larger numbers (2-8 range typically)
- Putts are typically smaller numbers (1-4 range typically)
- The total score for 18 holes is usually between 70-120
- Verify that the scores make sense (a score should always be >= putts for that hole)

Example of what to look for:
- Player's Score Row: Contains the actual strokes taken (handwritten)
- Putts Row: Contains number of putts (handwritten)
- Fairway/Green markers: Look for ✓, •, or similar marks in F/GIR rows

Return the data in this exact JSON format:
{
  "courseName": string | null,
  "date": string | null,
  "holes": [
    {
      "score": number | null,
      "putts": number | null,
      "fairwayHit": boolean | null,
      "greenInRegulation": boolean | null
    },
    // ... (18 holes total)
  ]
}

Only return the JSON data, no additional explanation needed.`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as Blob;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert the image to proper format for Gemini
    const imageBytes = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');

    // Generate content using Gemini
    const result = await model.generateContent([
      ANALYSIS_PROMPT,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type || "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    let content = response.text();

    // Clean up the response
    content = content
      .replace(/```json\n/, '')
      .replace(/```/, '')
      .trim();

    try {
      // Parse and validate the JSON response
      const analysisData = JSON.parse(content);
      
      // Basic validation
      if (!analysisData.holes || !Array.isArray(analysisData.holes) || analysisData.holes.length !== 18) {
        throw new Error('Invalid response format: missing or invalid holes array');
      }

      // Validate and clean each hole's data
      analysisData.holes = analysisData.holes.map((hole: RawHoleData): HoleData => {
        const score = typeof hole.score === 'number' && hole.score > 0 && hole.score < 20 ? hole.score : null;
        const putts = typeof hole.putts === 'number' && hole.putts >= 0 && hole.putts < 10 ? hole.putts : null;
        
        // Additional validation: putts cannot be greater than score
        const validatedPutts = (score !== null && putts !== null && putts > score) ? null : putts;
        
        return {
          score,
          putts: validatedPutts,
          fairwayHit: typeof hole.fairwayHit === 'boolean' ? hole.fairwayHit : null,
          greenInRegulation: typeof hole.greenInRegulation === 'boolean' ? hole.greenInRegulation : null
        };
      });

      // Clean course name and date
      if (analysisData.courseName === '') {
        analysisData.courseName = null;
      }
      if (analysisData.date === '') {
        analysisData.date = null;
      }

      // Validate total score is in reasonable range
      const totalScore = analysisData.holes.reduce((sum: number, hole: { score: number | null }) => 
        sum + (hole.score || 0), 0);
      if (totalScore < 30 || totalScore > 200) {
        console.warn('Suspicious total score detected:', totalScore);
        return NextResponse.json(
          { error: 'Invalid score detection. Please try again or enter scores manually.' },
          { status: 400 }
        );
      }

      return NextResponse.json(analysisData);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError, 'Raw content:', content);
      return NextResponse.json(
        { error: 'Failed to parse scorecard data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error analyzing scorecard:', error);
    return NextResponse.json(
      { error: 'Failed to analyze scorecard' },
      { status: 500 }
    );
  }
}