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

    // Format elapsed time
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const elapsedTimeFormatted = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // Calculate and format remaining time
    const timeRemaining = maxTime ? maxTime - seconds : null;
    const isNearEnd = timeRemaining !== null && timeRemaining <= 30; // Last 30 seconds
    const hasTimeLimit = maxTime !== undefined && maxTime > 0;

    // Format remaining time in MM:SS
    const formatRemainingTime = (remainingSeconds: number) => {
        if (remainingSeconds <= 0) return "00:00";
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`font-mono text-lg ${isNearEnd ? 'text-red-600 font-bold' : ''}`}>
            {/* Show elapsed time */}
            <div>
                Elapsed: {elapsedTimeFormatted}
            </div>
            
            {/* Show remaining time if maxTime is provided */}
            {hasTimeLimit && timeRemaining !== null && (
                <div className={`text-sm ${isNearEnd ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    {timeRemaining > 0 ? (
                        <>Remaining: {formatRemainingTime(timeRemaining)}</>
                    ) : (
                        <span className="text-red-600 font-bold">Time up!</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Timer;