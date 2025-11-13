"use client";
import { useState, useEffect } from "react";

interface characterResult {
    character: string,
    pinyin: string,
    definition: string,
}

const COOKIE_NAME = "addedWords";

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
};

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

const deleteCookie = (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

const SettingsClient = () => {

    const [searchingPinyin, setSearchingPinyin] = useState<string>("");
    const [characterResults, setCharacterResults] = useState<characterResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addedWords, setAddedWords] = useState<characterResult[]>([]);
    const [hasLoadedFromCookie, setHasLoadedFromCookie] = useState(false);

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
        setHasLoadedFromCookie(true);
    }, []);

    // Save added words to cookies whenever they change (but only after initial load)
    useEffect(() => {
        if (!hasLoadedFromCookie) return;

        if (addedWords.length > 0) {
            setCookie(COOKIE_NAME, JSON.stringify(addedWords));
        } else {
            // Delete cookie if list is empty
            deleteCookie(COOKIE_NAME);
        }
    }, [addedWords, hasLoadedFromCookie]);

    useEffect(() => {
        const searchCharacters = async () => {
            if (searchingPinyin.length === 0) {
                setCharacterResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(searchingPinyin)}`);
                console.log(response);
                if (response.ok) {
                    const data = await response.json();
                    setCharacterResults(data.items || []);
                } else {
                    console.error("Search failed");
                    setCharacterResults([]);
                }
            } catch (error) {
                console.error("Error searching:", error);
                setCharacterResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the search
        const timeoutId = setTimeout(() => {
            searchCharacters();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchingPinyin]);

    const onSearchChange = (query: string) => {
        setSearchingPinyin(query);
    }

    const addWord = (word: characterResult) => {
        // Check if word is already added (by character)
        if (!addedWords.some(w => w.character === word.character)) {
            setAddedWords([...addedWords, word]);
        }
    }

    const removeWord = (word: characterResult) => {
        setAddedWords(addedWords.filter(w => w.character !== word.character));
    }

    const toggleWord = (word: characterResult) => {
        const isAdded = addedWords.some(w => w.character === word.character);
        if (isAdded) {
            removeWord(word);
        } else {
            addWord(word);
        }
    }

    return (
        // <div className="flex flex-col justify-center items-center h-screen">
        //     <div className="text-xl">
        //         Settings
        //     </div>
        // </div>
        <div className="grid grid-cols-2 h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
            <div className="m-4 text-xl flex flex-col gap-4 h-full min-h-0">
                <h1 className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded-lg text-white font-semibold border border-gray-600/50 shadow-lg flex-shrink-0">Add Words</h1>
                <input
                    type="text"
                    placeholder="Search words..."
                    className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 flex-shrink-0"
                    value={searchingPinyin}
                    onChange={(e) => { onSearchChange(e.target.value) }}
                />
                {isLoading && (
                    <div className="text-sm text-cyan-400 flex items-center gap-2 flex-shrink-0">
                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                        Searching...
                    </div>
                )}
                {!isLoading && characterResults.length > 0 && (
                    <div className="flex flex-col flex-1 min-h-0 space-y-2">
                        <div className="text-sm font-semibold text-gray-300 flex-shrink-0">Results ({characterResults.length}):</div>
                        <div className="flex-1 overflow-y-auto space-y-3 py-3 min-h-0 mb-5">
                            {characterResults.map((result, index) => {
                                const isAdded = addedWords.some(w => w.character === result.character);
                                return (
                                    <div
                                        key={index}
                                        className="group relative p-4 pr-12 rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-cyan-500/20 hover:-translate-y-1"
                                    >
                                        {/* Glowing effect on hover */}
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

                                        {/* Content */}
                                        <div className="relative z-10">
                                            <div className="text-2xl font-bold text-white mb-1 tracking-wide">{result.character}</div>
                                            <div className="text-sm font-medium text-cyan-400 mb-2 uppercase tracking-wider">{result.pinyin}</div>
                                            <div className="text-sm text-gray-300 leading-relaxed">{result.definition}</div>
                                        </div>

                                        {/* Add/Remove toggle button */}
                                        <button
                                            onClick={() => toggleWord(result)}
                                            className={`absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isAdded
                                                    ? 'bg-green-500/20 border border-green-500/50 hover:bg-red-500/30 hover:border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:scale-110'
                                                    : 'bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(6,182,212,0.5)] hover:scale-110'
                                                }`}
                                        >
                                            {isAdded ? (
                                                <svg className="w-5 h-5 text-green-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Subtle corner accent */}
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {!isLoading && searchingPinyin.length > 0 && characterResults.length === 0 && (
                    <div className="text-sm text-gray-400 mt-4 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 flex-shrink-0">No results found</div>
                )}
            </div>
            <div className="m-4 text-xl flex flex-col gap-4 h-full min-h-0">
                <h1 className="bg-gradient-to-r from-gray-800 to-gray-700 p-3 rounded-lg text-white font-semibold border border-gray-600/50 shadow-lg flex-shrink-0">Added Words ({addedWords.length})</h1>
                {addedWords.length > 0 ? (
                    <div className="flex flex-col flex-1 min-h-0 space-y-2">
                        <div className="flex-1 overflow-y-auto space-y-3 py-5 min-h-0 mb-5">
                            {addedWords.map((word, index) => (
                                <div
                                    key={index}
                                    className="group relative p-4 pr-12 rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-green-700/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-green-500/20 hover:-translate-y-1"
                                >
                                    {/* Glowing effect on hover */}
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        <div className="text-2xl font-bold text-white mb-1 tracking-wide">{word.character}</div>
                                        <div className="text-sm font-medium text-green-400 mb-2 uppercase tracking-wider">{word.pinyin}</div>
                                        <div className="text-sm text-gray-300 leading-relaxed">{word.definition}</div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => removeWord(word)}
                                        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 hover:border-red-500 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] hover:scale-110 transition-all duration-300"
                                    >
                                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    {/* Subtle corner accent */}
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-green-500/30 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 flex-shrink-0">No words added yet</div>
                )}
            </div>
        </div>
    )
}

export default SettingsClient