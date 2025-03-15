import { render, screen, fireEvent, act } from '@testing-library/react';
import { MeditationTimer } from '../MeditationTimer';
import { vi } from 'vitest';

// Mock the Audio API
const mockPlay = vi.fn();
global.Audio = vi.fn().mockImplementation(() => ({
  play: mockPlay,
}));

describe('MeditationTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPlay.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default duration', () => {
    render(<MeditationTimer />);
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('starts countdown when start button is clicked', () => {
    render(<MeditationTimer defaultDuration={1} />);
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('pauses countdown when pause button is clicked', () => {
    render(<MeditationTimer defaultDuration={1} />);
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    fireEvent.click(screen.getByText('Pause'));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('00:59')).toBeInTheDocument();
  });

  it('resets timer when reset button is clicked', () => {
    render(<MeditationTimer defaultDuration={1} />);
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByText('01:00')).toBeInTheDocument();
  });

  it('calls onComplete when timer finishes', () => {
    const onComplete = vi.fn();
    render(<MeditationTimer defaultDuration={1} onComplete={onComplete} />);
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    
    expect(onComplete).toHaveBeenCalled();
  });

  it('plays sound when timer completes', () => {
    render(<MeditationTimer defaultDuration={1} />);
    
    fireEvent.click(screen.getByText('Start'));
    
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    
    expect(mockPlay).toHaveBeenCalled();
  });
}); 