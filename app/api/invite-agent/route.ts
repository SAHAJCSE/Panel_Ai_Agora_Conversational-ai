import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
  OpenAITTS,
} from 'agora-agents';
import { ClientStartRequest, AgentResponse } from '@/types/conversation';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
import { buildInterviewerPrompt } from '@/lib/interview/system-prompt';

// agentUid identifies the AI in the RTC channel and shares its default with the client.
const agentUid = String(DEFAULT_AGENT_UID);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    // --- 1. Parse request ---

    const body: ClientStartRequest = await request.json();
    const {
      requester_id,
      channel_name,
      interview_track = 'technical',
      candidate_name,
      role_title,
      duration_minutes,
      candidate_context,
      context_memory,
    } = body;

    // Validate required env vars on first request so misconfiguration surfaces
    // with a clear error message rather than a silent failure.
    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 },
      );
    }

    // --- 2. Build and start the agent ---

    // AgoraClient authenticates API calls to the Agora Conversational AI service.
    // Area defaults to Area.US unless NEXT_AGORA_AREA is specified (e.g. EU, AP, CN).
    const areaEnv = process.env.NEXT_AGORA_AREA?.toUpperCase();
    const area =
      areaEnv === 'EU'
        ? Area.EU
        : areaEnv === 'AP'
          ? Area.AP
          : areaEnv === 'CN'
            ? Area.CN
            : Area.US;

    const client = new AgoraClient({
      area,
      appId,
      appCertificate,
    });

    // Select the appropriate agent pipeline ID based on track
    const techPipelineId =
      process.env.NEXT_AGORA_TECH_AGENT_ID || process.env.NEXT_AGORA_AGENT_ID;
    const productPipelineId =
      process.env.NEXT_AGORA_PRODUCT_AGENT_ID || process.env.NEXT_AGORA_AGENT_ID;
    const hrPipelineId =
      process.env.NEXT_AGORA_HR_AGENT_ID ||
      process.env.NEXT_AGORA_AGENT_ID ||
      '6bb3610317724e3ea78058c355d1e1b5';

    let pipelineId: string | undefined = body.pipeline_id;
    if (!pipelineId && !body.force_template) {
      if (interview_track === 'hiring_manager') {
        pipelineId = hrPipelineId;
      } else if (interview_track === 'product') {
        pipelineId = productPipelineId;
      } else {
        pipelineId = techPipelineId;
      }
    }

    // Persist candidate briefing to local database & retrieve cross-round memory
    const { saveCandidateBriefing, buildMemoryContextPrompt } = await import(
      '@/lib/interview/context-memory'
    );
    if (candidate_name) {
      saveCandidateBriefing(
        candidate_name,
        role_title || 'Senior Frontend Developer',
        duration_minutes || 15,
        candidate_context,
      );
    }

    const memoryContext =
      context_memory || buildMemoryContextPrompt(candidate_name, interview_track);

    // Unique Agent UID per track to prevent RTC join collisions during transitions
    const resolvedAgentUid =
      interview_track === 'product'
        ? '123457'
        : interview_track === 'hiring_manager'
        ? '123458'
        : '123456';

    let agent: Agent;

    if (pipelineId) {
      console.log(
        `[invite-agent] Launching Agora Console agent with pipelineId: ${pipelineId} for track: ${interview_track}`,
      );
      // When pipelineId is set from Agora Console, we let Agora use the system prompt,
      // LLM, TTS, STT, and greeting configured directly in the Agora Console.
      // We do NOT provide `instructions`, `greeting`, or `.withLlm()` here, as doing so
      // would overwrite the console-configured prompt and persona with the code template.
      agent = new Agent({
        client,
        pipelineId,
        advancedFeatures: { enable_rtm: true, enable_tools: true },
        parameters: {
          audio_scenario: 'chorus',
          data_channel: 'rtm',
          enable_error_message: true,
          enable_metrics: true,
        },
      });
    } else {
      console.log(
        `[invite-agent] No pipeline ID configured, falling back to local template for track: ${interview_track}`,
      );
      // Build structured PanelAI technical, product, or HR interviewer prompt
      const interviewerPrompt = buildInterviewerPrompt({
        candidateName: candidate_name,
        roleTitle: role_title,
        track: interview_track,
        resumeSummary: candidate_context,
      });

      const timeInstruction = duration_minutes
        ? `\n\n# Time Constraints & Pacing\nThe interview session has a strict ${duration_minutes}-minute limit. Keep turns crisp and conclude gracefully within this timeframe.`
        : '';

      const combinedInstructions = `${interviewerPrompt.instructions}${timeInstruction}${
        memoryContext ? `\n\n${memoryContext}` : ''
      }`;

      // Distinct voice per interviewer persona for rich panel experience
      const ttsVoice =
        interview_track === 'product'
          ? 'shimmer' // Sarah Lin (Product)
          : interview_track === 'hiring_manager'
          ? 'nova'    // Elena Rostova (HR)
          : 'alloy';  // Alex Chen (Technical)

      const ttsEngine = new OpenAITTS({
        model: 'tts-1',
        voice: ttsVoice,
      });

      // Direct ultra-low latency fallback pipeline
      agent = new Agent({
        client,
        instructions: combinedInstructions,
        greeting: interviewerPrompt.greeting,
        failureMessage: 'One moment, let me reconnect.',
        maxHistory: 30,
        // Optimized VAD for ultra-fast, snappy conversational voice turns
        turnDetection: {
          config: {
            speech_threshold: 0.5,
            start_of_speech: {
              mode: 'vad',
              vad_config: {
                interrupt_duration_ms: 140, // Quick natural interruption
                prefix_padding_ms: 200,    // Low audio buffer overhead
              },
            },
            end_of_speech: {
              mode: 'vad',
              vad_config: {
                silence_duration_ms: 380,  // Fast 380ms turnaround without cutting off normal pauses
              },
            },
          },
        },
        advancedFeatures: { enable_rtm: true, enable_tools: true },
        parameters: {
          // web client → ultra-low-latency chorus profile for minimum voice turnaround latency
          audio_scenario: 'chorus',
          data_channel: 'rtm',
          enable_error_message: true,
          enable_metrics: true,
        },
      })
        .withStt(
          new DeepgramSTT({
            model: 'nova-3',
            language: 'en',
          }),
        )
        .withLlm(
          new OpenAI({
            model: 'gpt-4o-mini',
            greetingMessage: interviewerPrompt.greeting,
            failureMessage: 'Please give me a moment.',
            maxHistory: 16,
            params: {
              max_tokens: 220, // Crisp 1-2 sentence questions without mid-sentence truncation
              temperature: 0.6,
              top_p: 0.9,
            },
          }),
        )
        .withTts(ttsEngine);
    }

    // Binding remoteUids specifically to candidate UID ensures Agora routes candidate audio to Deepgram STT
    const candidateUidStr = String(requester_id);
    const remoteUids =
      candidateUidStr && candidateUidStr !== '*' && candidateUidStr !== '0'
        ? [candidateUidStr]
        : ['*'];

    const session = agent.createSession({
      channel: channel_name,
      agentUid: resolvedAgentUid,
      remoteUids,
      idleTimeout: 120, // 2 minutes to keep agent alive across brief page reloads
      expiresIn: ExpiresIn.hours(1),
      debug: false,
      ...(pipelineId ? { pipelineId } : {}),
    });

    const agentId = await session.start();

    return NextResponse.json({
      agent_id: agentId,
      agent_uid: resolvedAgentUid,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } as AgentResponse & { agent_uid?: string });
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500 },
    );
  }
}
