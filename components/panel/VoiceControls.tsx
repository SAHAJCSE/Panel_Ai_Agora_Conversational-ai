'use client';

import { useState } from 'react';
import { Mic, MicOff, Settings2, Check, Square, Play } from 'lucide-react';

export interface VoiceControlsProps {
  isEnabled: boolean;
  onToggleMic: () => void;
  onStopAgent?: () => void;
  isEnding?: boolean;
  localMicrophoneTrack?: {
    getTrackLabel?: () => string;
    setDevice?: (deviceId: string) => Promise<void>;
  } | null;
}

export function VoiceControls({
  isEnabled,
  onToggleMic,
  onStopAgent,
  isEnding = false,
  localMicrophoneTrack,
}: VoiceControlsProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const handleOpenSettings = async () => {
    if (!showSettings) {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter((d) => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (localMicrophoneTrack) {
          const currentTrackLabel = localMicrophoneTrack.getTrackLabel?.();
          const match = audioInputs.find((d) => d.label === currentTrackLabel);
          if (match) setSelectedDeviceId(match.deviceId);
        }
      } catch (e) {
        console.warn('Could not enumerate audio devices:', e);
      }
    }
    setShowSettings((prev) => !prev);
  };

  const handleSelectDevice = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowSettings(false);
    if (localMicrophoneTrack) {
      try {
        await localMicrophoneTrack.setDevice?.(deviceId);
      } catch (err) {
        console.error('Failed to change mic device:', err);
      }
    }
  };

  return (
    <div className="relative flex items-center gap-4">
      {/* Settings popover */}
      {showSettings && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-64 rounded-xl border border-[#2e2e32] bg-[#1c1c20] p-3 shadow-2xl backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2">
            Microphone Source
          </p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {devices.map((device, idx) => (
              <button
                key={device.deviceId || idx}
                type="button"
                onClick={() => handleSelectDevice(device.deviceId)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                  selectedDeviceId === device.deviceId
                    ? 'bg-[#ec4899]/20 text-white font-medium'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <span className="truncate pr-2">
                  {device.label || `Microphone ${idx + 1}`}
                </span>
                {selectedDeviceId === device.deviceId && (
                  <Check className="h-3.5 w-3.5 text-[#ec4899] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Microphone Toggle Button */}
      <button
        type="button"
        onClick={onToggleMic}
        aria-label={isEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 select-none ${
          isEnabled
            ? 'border-2 border-[#ec4899] bg-[#1a1820] text-[#ec4899] shadow-[0_0_24px_rgba(236,72,153,0.4)] hover:shadow-[0_0_32px_rgba(236,72,153,0.6)] hover:scale-105'
            : 'border-2 border-red-500/60 bg-[#20181a] text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.25)] hover:scale-105'
        }`}
      >
        {isEnabled ? (
          <Mic className="h-6 w-6" />
        ) : (
          <MicOff className="h-6 w-6" />
        )}
      </button>

      {/* Explicit Stop Agent Button */}
      {onStopAgent && (
        <button
          type="button"
          onClick={onStopAgent}
          disabled={isEnding}
          aria-label="Stop Agent"
          className="flex h-12 items-center gap-2 rounded-full border border-red-500/50 bg-red-950/40 px-5 text-xs font-semibold text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:border-red-500 hover:bg-red-900/60 hover:text-white transition-all disabled:opacity-50"
        >
          <Square className="h-4 w-4 fill-current text-red-400" />
          <span>{isEnding ? 'Stopping Agent...' : 'Stop Agent'}</span>
        </button>
      )}

      {/* Settings / Audio Device Button */}
      <button
        type="button"
        onClick={handleOpenSettings}
        aria-label="Audio Settings"
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
          showSettings
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-[#2e2e32] bg-[#1a1a1e] text-white/50 hover:border-white/20 hover:text-white/80'
        }`}
      >
        <Settings2 className="h-4 w-4" />
      </button>
    </div>
  );
}
