'use client'
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Confetti {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    shape: 'circle' | 'square' | 'triangle';
    delay: number;
}

const Background: React.FC = () => {
    const [confetti, setConfetti] = useState<Confetti[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    const generateRandomConfetti = () => {
        const newConfetti: Confetti[] = [];

        // Generate multiple confetti pieces
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * dimensions.width;
            const y = -100 - Math.random() * 200; // Start above viewport
            const size = Math.random() * 10 + 4;
            const speed = Math.random() * 4 + 5;
            const rotation = Math.random() * 360;
            const rotationSpeed = Math.random() * 360 + 180;
            const color = `hsl(${Math.random() * 360}, 85%, 65%)`;
            const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const delay = Math.random() * 10;

            newConfetti.push({
                id: i,
                x,
                y,
                size,
                speed,
                color,
                rotation,
                rotationSpeed,
                shape,
                delay
            });
        }

        setConfetti(newConfetti);
    };

    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window !== 'undefined') {
                setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }
        };

        updateDimensions();
        generateRandomConfetti();

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, []);

    useEffect(() => {
        if (dimensions.width && dimensions.height) {
            generateRandomConfetti();
        }
    }, [dimensions]);

    const getShapeComponent = (piece: Confetti) => {
        const baseStyle = {
            width: piece.size,
            height: piece.size,
        };

        switch (piece.shape) {
            case 'circle':
                return (
                    <div
                        style={{
                            ...baseStyle,
                            backgroundColor: piece.color,
                            borderRadius: '50%',
                        }}
                    />
                );
            case 'square':
                return (
                    <div
                        style={{
                            ...baseStyle,
                            backgroundColor: piece.color,
                            borderRadius: '2px',
                        }}
                    />
                );
            case 'triangle':
                return (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${piece.size * 0.6}px solid transparent`,
                            borderRight: `${piece.size * 0.6}px solid transparent`,
                            borderBottom: `${piece.size * 1.2}px solid ${piece.color}`,
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <AnimatePresence>
                {confetti.map((piece) => (
                    <motion.div
                        key={piece.id}
                        className="absolute"
                        initial={{
                            x: piece.x,
                            y: piece.y,
                            rotate: piece.rotation,
                            scale: 0,
                            opacity: 0,
                        }}
                        animate={{
                            x: [
                                piece.x,
                                piece.x + Math.sin(piece.id) * 50,
                                piece.x + Math.sin(piece.id + 1) * 30,
                                piece.x + Math.sin(piece.id + 2) * 40,
                            ],
                            y: dimensions.height + 100,
                            rotate: piece.rotation + piece.rotationSpeed,
                            scale: [0, 1, 1, 0.8],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            duration: piece.speed,
                            delay: piece.delay,
                            ease: "easeOut",
                            repeat: Infinity,
                            repeatDelay: Math.random() * 2,
                            times: [0, 0.1, 0.9, 1],
                        }}
                        style={{
                            left: 0,
                            top: 0,
                        }}
                    >
                        {getShapeComponent(piece)}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Floating background particles */}
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={`bg-particle-${i}`}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * 4 + 2,
                        height: Math.random() * 4 + 2,
                        backgroundColor: `hsl(${Math.random() * 360}, 60%, 80%)`,
                        left: Math.random() * dimensions.width,
                        top: Math.random() * dimensions.height,
                    }}
                    animate={{
                        x: [0, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, 0],
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            {/* Sparkle effect */}
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={`sparkle-${i}`}
                    className="absolute"
                    style={{
                        left: Math.random() * dimensions.width,
                        top: Math.random() * dimensions.height,
                    }}
                    animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 4,
                        ease: "easeInOut",
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            backgroundColor: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                        }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default Background;