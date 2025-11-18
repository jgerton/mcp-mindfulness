"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeditationTimer = MeditationTimer;
const react_1 = __importStar(require("react"));
const button_1 = require("@/components/ui/button");
const slider_1 = require("@/components/ui/slider");
const use_toast_1 = require("@/components/ui/use-toast");
const lucide_react_1 = require("lucide-react");
function MeditationTimer({ defaultDuration = 10, onComplete }) {
    const [duration, setDuration] = (0, react_1.useState)(defaultDuration * 60); // Convert to seconds
    const [timeLeft, setTimeLeft] = (0, react_1.useState)(duration);
    const [isRunning, setIsRunning] = (0, react_1.useState)(false);
    const [isMuted, setIsMuted] = (0, react_1.useState)(false);
    const timerRef = (0, react_1.useRef)();
    const audioRef = (0, react_1.useRef)();
    const { toast } = (0, use_toast_1.useToast)();
    (0, react_1.useEffect)(() => {
        // Initialize audio
        audioRef.current = new Audio('/sounds/meditation-bell.mp3');
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (!isRunning) {
            if (timerRef.current)
                clearInterval(timerRef.current);
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
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, [isRunning]);
    const handleComplete = () => {
        setIsRunning(false);
        if (timerRef.current)
            clearInterval(timerRef.current);
        if (!isMuted && audioRef.current) {
            audioRef.current.play().catch(() => {
                toast({
                    title: "Couldn't play sound",
                    description: "Please check your browser's audio settings.",
                    variant: "destructive",
                });
            });
        }
        onComplete === null || onComplete === void 0 ? void 0 : onComplete();
        toast({
            title: "Meditation Complete",
            description: "Great job! Take a moment to reflect on your practice.",
        });
    };
    const formatTime = (seconds) => {
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
    const handleDurationChange = (value) => {
        const newDuration = value[0] * 60;
        setDuration(newDuration);
        setTimeLeft(newDuration);
    };
    return (<div className="w-full max-w-md mx-auto p-6 space-y-6 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Meditation Timer</h2>
        <div className="text-4xl font-mono mb-4">{formatTime(timeLeft)}</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (minutes)</label>
          <slider_1.Slider defaultValue={[defaultDuration]} max={60} min={1} step={1} onValueChange={handleDurationChange} disabled={isRunning}/>
        </div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (<button_1.Button onClick={handleStart} className="w-24">
              Start
            </button_1.Button>) : (<button_1.Button onClick={handlePause} className="w-24" variant="secondary">
              Pause
            </button_1.Button>)}
          <button_1.Button onClick={handleReset} variant="outline" className="w-24">
            Reset
          </button_1.Button>
          <button_1.Button onClick={() => setIsMuted(!isMuted)} variant="ghost" size="icon" className={isMuted ? 'text-muted-foreground' : ''}>
            <lucide_react_1.Bell className="h-4 w-4"/>
          </button_1.Button>
        </div>
      </div>
    </div>);
}
