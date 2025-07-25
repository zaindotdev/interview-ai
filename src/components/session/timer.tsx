import React, { useEffect, useState } from 'react'

interface TimerProps {
    callStarted: boolean
    setTimer: React.Dispatch<React.SetStateAction<number>>
    onTimeUp?: () => void // Callback when time limit is reached
    maxTime?: number // Maximum time in seconds
}

const Timer: React.FC<TimerProps> = ({ 
    callStarted, 
    setTimer, 
    onTimeUp,
    maxTime 
}) => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!callStarted) {
            setSeconds(0);
            setTimer(0);
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => {
                const newSeconds = prev + 1;
                setTimer(newSeconds);
                
                // Check if we've reached the time limit
                if (maxTime && newSeconds >= maxTime && onTimeUp) {
                    onTimeUp();
                }
                
                return newSeconds;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [callStarted, setTimer, maxTime, onTimeUp]);

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Show time remaining if maxTime is provided
    const timeRemaining = maxTime ? maxTime - seconds : null;
    const isNearEnd = timeRemaining !== null && timeRemaining <= 30; // Last 30 seconds

    return (
        <div className={`font-mono text-lg ${isNearEnd ? 'text-red-600 font-bold' : ''}`}>
            {formatted}
            {timeRemaining !== null && (
                <div className="text-xs text-gray-500">
                    {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Time up!'}
                </div>
            )}
        </div>
    );
};

export default Timer;