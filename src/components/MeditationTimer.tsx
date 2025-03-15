'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Bell } from 'lucide-react';

interface MeditationTimerProps {
  defaultDuration?: number; // in minutes
  onComplete?: () => void;
}

export function MeditationTimer({ 
  defaultDuration = 10,
  onComplete 
}: MeditationTimerProps) {
  const [duration, setDuration] = useState(defaultDuration * 60); // Convert to seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement>();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/meditation-bell.mp3');
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(() => {
        toast({
          title: "Couldn't play sound",
          description: "Please check your browser's audio settings.",
          variant: "destructive",
        });
      });
    }
    
    onComplete?.();
    
    toast({
      title: "Meditation Complete",
      description: "Great job! Take a moment to reflect on your practice.",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const handleDurationChange = (value: number[]) => {
    const newDuration = value[0] * 60;
    setDuration(newDuration);
    setTimeLeft(newDuration);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Meditation Timer</h2>
        <div className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <Slider
            defaultValue={[defaultDuration]}
            max={60}
            min={1}
            step={1}
            onValueChange={handleDurationChange}
            disabled={isRunning}
          />
        </div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} className="w-24">
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} className="w-24" variant="secondary">
              Pause
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="w-24">
            Reset
          </Button>
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="ghost"
            size="icon"
            className={isMuted ? 'text-muted-foreground' : ''}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 