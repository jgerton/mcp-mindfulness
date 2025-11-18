"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const MeditationTimer_1 = require("../MeditationTimer");
const vitest_1 = require("vitest");
// Mock the Audio API
const mockPlay = vitest_1.vi.fn();
global.Audio = vitest_1.vi.fn().mockImplementation(() => ({
    play: mockPlay,
}));
describe('MeditationTimer', () => {
    beforeEach(() => {
        vitest_1.vi.useFakeTimers();
        mockPlay.mockClear();
    });
    afterEach(() => {
        vitest_1.vi.useRealTimers();
    });
    it('renders with default duration', () => {
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer />);
        expect(react_1.screen.getByText('10:00')).toBeInTheDocument();
    });
    it('starts countdown when start button is clicked', () => {
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer defaultDuration={1}/>);
        react_1.fireEvent.click(react_1.screen.getByText('Start'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        expect(react_1.screen.getByText('00:59')).toBeInTheDocument();
    });
    it('pauses countdown when pause button is clicked', () => {
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer defaultDuration={1}/>);
        react_1.fireEvent.click(react_1.screen.getByText('Start'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        react_1.fireEvent.click(react_1.screen.getByText('Pause'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        expect(react_1.screen.getByText('00:59')).toBeInTheDocument();
    });
    it('resets timer when reset button is clicked', () => {
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer defaultDuration={1}/>);
        react_1.fireEvent.click(react_1.screen.getByText('Start'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(1000);
        });
        react_1.fireEvent.click(react_1.screen.getByText('Reset'));
        expect(react_1.screen.getByText('01:00')).toBeInTheDocument();
    });
    it('calls onComplete when timer finishes', () => {
        const onComplete = vitest_1.vi.fn();
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer defaultDuration={1} onComplete={onComplete}/>);
        react_1.fireEvent.click(react_1.screen.getByText('Start'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(60000);
        });
        expect(onComplete).toHaveBeenCalled();
    });
    it('plays sound when timer completes', () => {
        (0, react_1.render)(<MeditationTimer_1.MeditationTimer defaultDuration={1}/>);
        react_1.fireEvent.click(react_1.screen.getByText('Start'));
        (0, react_1.act)(() => {
            vitest_1.vi.advanceTimersByTime(60000);
        });
        expect(mockPlay).toHaveBeenCalled();
    });
});
