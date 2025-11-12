"use client";
import { useState, useEffect, useRef } from "react";

interface characterResult {
    character: string,
    pinyin: string,
    definition: string,
}

const COOKIE_NAME = "addedWords";

// Remove tones from pinyin (convert tone marks to base letters)
const removeTones = (pinyin: string): string => {
    // Map of tone-marked vowels to their base forms
    const toneMap: { [key: string]: string } = {
        'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
        'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
        'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
        'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
        'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
        'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
        'Ā': 'A', 'Á': 'A', 'Ǎ': 'A', 'À': 'A',
        'Ē': 'E', 'É': 'E', 'Ě': 'E', 'È': 'E',
        'Ī': 'I', 'Í': 'I', 'Ǐ': 'I', 'Ì': 'I',
        'Ō': 'O', 'Ó': 'O', 'Ǒ': 'O', 'Ò': 'O',
        'Ū': 'U', 'Ú': 'U', 'Ǔ': 'U', 'Ù': 'U',
        'Ǖ': 'Ü', 'Ǘ': 'Ü', 'Ǚ': 'Ü', 'Ǜ': 'Ü'
    };
    
    return pinyin.split('').map(char => toneMap[char] || char).join('');
};

// Cookie helper function
const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
};

const PlayClient = () => {
    const [addedWords, setAddedWords] = useState<characterResult[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentWord, setCurrentWord] = useState<characterResult | null>(null);
    const [userInput, setUserInput] = useState("");
    const [score, setScore] = useState({ correct: 0 });
    const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
    const [gameOver, setGameOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isCheckingRef = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load added words from cookies on mount
    useEffect(() => {
        const savedWords = getCookie(COOKIE_NAME);
        if (savedWords) {
            try {
                const parsed = JSON.parse(savedWords) as characterResult[];
                setAddedWords(parsed);
            } catch (error) {
                console.error("Error parsing saved words from cookie:", error);
            }
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!gameStarted || gameOver || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setGameOver(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStarted, gameOver, timeRemaining]);

    // Auto-check answer when user types
    useEffect(() => {
        if (!gameStarted || gameOver || !currentWord || isCheckingRef.current) return;

        const userAnswer = userInput.trim().toLowerCase();
        const correctAnswer = removeTones(currentWord.pinyin.toLowerCase());
        const userAnswerNoTones = removeTones(userAnswer);

        // Only check if user has typed something
        if (userAnswer.length === 0) return;

        // Check if answer is correct (tone-invariant)
        if (userAnswerNoTones === correctAnswer) {
            isCheckingRef.current = true;
            setIsProcessing(true);
            // Increment score
            setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
            
            // Advance immediately
            setTimeout(() => {
                if (addedWords.length > 0) {
                    const randomIndex = Math.floor(Math.random() * addedWords.length);
                    setCurrentWord(addedWords[randomIndex]);
                }
                setUserInput("");
                isCheckingRef.current = false;
                setIsProcessing(false);
                // Small delay before focusing to ensure input is cleared
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 50);
            }, 100);
        }
    }, [userInput, currentWord, gameStarted, gameOver, addedWords]);

    // Get random word
    const getRandomWord = () => {
        if (addedWords.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * addedWords.length);
        return addedWords[randomIndex];
    };

    // Start game
    const startGame = () => {
        if (addedWords.length === 0) {
            alert("Please add some words in Settings first!");
            return;
        }
        setGameStarted(true);
        setGameOver(false);
        setScore({ correct: 0 });
        setTimeRemaining(60);
        setCurrentWord(getRandomWord());
        setUserInput("");
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Reset game
    const resetGame = () => {
        setGameStarted(false);
        setGameOver(false);
        setCurrentWord(null);
        setUserInput("");
        setScore({ correct: 0 });
        setTimeRemaining(60);
    };


    // Calculate stats
    const wordsPerMinute = timeRemaining < 60 ? Math.round((score.correct / (60 - timeRemaining)) * 60) : 0;

    if (!gameStarted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-8">
                <div className="max-w-2xl w-full space-y-6">
                    <h1 className="text-4xl font-bold text-white mb-2 text-center">Pinyin Challenge</h1>
                    <p className="text-gray-400 text-center mb-8">Test your knowledge of Chinese characters and pinyin!</p>
                    
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg p-6 space-y-4">
                        <div className="text-gray-300 space-y-2">
                            <p className="text-sm">• You'll be shown Chinese characters</p>
                            <p className="text-sm">• Type the pinyin (without tones)</p>
                            <p className="text-sm">• You have 60 seconds</p>
                            <p className="text-sm">• Answer as many as you can!</p>
                        </div>
                        
                        {addedWords.length === 0 ? (
                            <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    No words added yet. Go to Settings to add words first!
                                </p>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                                <p className="text-cyan-400 text-sm">
                                    Ready to play with <span className="font-bold">{addedWords.length}</span> word{addedWords.length !== 1 ? 's' : ''}!
                                </p>
                            </div>
                        )}
                        
                        <button
                            onClick={startGame}
                            disabled={addedWords.length === 0}
                            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                                addedWords.length === 0
                                    ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105'
                            }`}
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-8">
                <div className="max-w-2xl w-full space-y-6">
                    <h1 className="text-4xl font-bold text-white mb-2 text-center">Game Over!</h1>
                    
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                                <div className="text-3xl font-bold text-cyan-400">{score.correct}</div>
                                <div className="text-sm text-gray-300 mt-1">Correct</div>
                            </div>
                            <div className="text-center p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                                <div className="text-3xl font-bold text-purple-400">{wordsPerMinute}</div>
                                <div className="text-sm text-gray-300 mt-1">Words per Minute</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={startGame}
                                className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={resetGame}
                                className="flex-1 py-3 rounded-lg font-semibold bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600/50 transition-all duration-300"
                            >
                                Back to Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-8">
            <div className="max-w-4xl w-full space-y-6">
                {/* Stats Bar */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
                            <span className="text-green-400 font-semibold">✓ {score.correct}</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                        <span className="text-orange-400 font-semibold text-xl">{timeRemaining}s</span>
                    </div>
                </div>

                {/* Game Area */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-lg p-12 text-center space-y-8">
                    {/* Character Display */}
                    <div className="space-y-4">
                        <div className="text-8xl font-bold text-white mb-4 tracking-wide">
                            {currentWord?.character}
                        </div>
                        <div className="text-sm text-gray-400">
                            {currentWord?.definition}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="space-y-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type pinyin here..."
                            className={`w-full px-6 py-4 text-2xl text-center rounded-lg bg-gray-800/50 border transition-all duration-200 ${
                                currentWord && removeTones(userInput.trim().toLowerCase()) === removeTones(currentWord.pinyin.toLowerCase())
                                    ? 'border-green-500/50 ring-2 ring-green-500/50'
                                    : 'border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                            } text-white placeholder-gray-500`}
                            autoFocus
                            autoComplete="off"
                            disabled={isProcessing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayClient;
