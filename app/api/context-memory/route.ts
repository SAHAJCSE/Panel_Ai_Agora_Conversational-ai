import { NextRequest, NextResponse } from 'next/server';
import {
  getOrCreateCandidateMemory,
  recordRoundMemory,
  clearCandidateMemory,
  buildMemoryContextPrompt,
} from '@/lib/interview/context-memory';
import { demoCandidate } from '@/data/demo';
import type { InterviewTrack } from '@/types/conversation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || demoCandidate.name;
    const targetTrack = (searchParams.get('track') as InterviewTrack) || 'product';

    const profile = getOrCreateCandidateMemory(name);
    const contextPrompt = buildMemoryContextPrompt(name, targetTrack);

    return NextResponse.json({
      profile,
      contextPrompt,
    });
  } catch (error) {
    console.error('Error fetching context memory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context memory' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateName, track, scorecard, answers, roleTitle, durationMinutes, backgroundNotes, isBriefing } = body;

    const { saveCandidateBriefing, recordRoundMemory } = await import('@/lib/interview/context-memory');

    if (isBriefing) {
      const profile = saveCandidateBriefing(
        candidateName || demoCandidate.name,
        roleTitle || 'Senior Frontend Developer',
        durationMinutes,
        backgroundNotes,
      );
      return NextResponse.json({ success: true, profile });
    }

    if (!track) {
      return NextResponse.json(
        { error: 'track is required' },
        { status: 400 },
      );
    }

    const profile = recordRoundMemory(
      candidateName || demoCandidate.name,
      track,
      scorecard,
      answers,
    );

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error saving context memory:', error);
    return NextResponse.json(
      { error: 'Failed to save context memory' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || demoCandidate.name;
    clearCandidateMemory(name);

    return NextResponse.json({
      success: true,
      message: `Memory cleared for ${name}`,
    });
  } catch (error) {
    console.error('Error clearing context memory:', error);
    return NextResponse.json(
      { error: 'Failed to clear context memory' },
      { status: 500 },
    );
  }
}
