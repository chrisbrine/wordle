import { API_BASE_URL } from "../constants";
import { getBrowserId } from "./browserIdService";

const pendingRequests = new Map(); // Keeps track of ongoing requests
const RETRY_DELAY = 2000; // Retry delay in milliseconds
const MAX_RETRIES = 3; // Maximum retry attempts

// Utility function to add debounce
const debounce = (funcName, callback) => {
    const DEBOUNCE_TIME = 5000; // Debounce period (5 seconds)

    if (pendingRequests.has(funcName)) {
        console.warn(`Debouncing API request: ${funcName}`);
        return false; // Skip if the function is debounced
    }

    // Set debounce timeout
    pendingRequests.set(
        funcName,
        setTimeout(() => {
            pendingRequests.delete(funcName);
        }, DEBOUNCE_TIME)
    );

    return callback(); // Execute the provided function
};

// Utility function for retries
const retryRequest = async (func, retries = MAX_RETRIES) => {
    try {
        return await func();
    } catch (error) {
        if (retries > 0) {
            console.warn(
                `Retrying request (${
                    MAX_RETRIES - retries + 1
                }/${MAX_RETRIES})`
            );
            await new Promise((resolve) =>
                setTimeout(resolve, RETRY_DELAY)
            );
            return retryRequest(func, retries - 1);
        } else {
            console.error("Request failed after retries:", error);
            throw error;
        }
    }
};

// Universal function to send API requests to the Lambda backend
const sendAPI = async (funcName, data = {}) => {
    return debounce(funcName, async () => {
        try {
            const params = {
                queryStringParameters: {
                    function: funcName,
                    browser_id: getBrowserId(),
                    data,
                },
            };

            const fetchRequest = async () => {
                const response = await fetch(API_BASE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(params),
                });

                if (!response.ok) {
                    throw new Error(
                        `HTTP error! Status: ${response.status}`
                    );
                }

                return await response.json();
            };

            // Retry logic wrapped around fetchRequest
            return await retryRequest(fetchRequest);
        } catch (error) {
            console.error(`Error in ${funcName}:`, error);
            return false;
        }
    });
};

// API Methods

export const getWord = async () => {
    const result = (await sendAPI("get-word")) || { word: "ERROR" };
    result.word = result.word.toUpperCase();
    return result;
};

export const getStats = async () => {
    return (await sendAPI("get-stats")) || { played: 0, won: 0 };
};

export const updateStats = async (stats) => {
    return await sendAPI("update-stats", stats);
};

export const addGuess = async (currentWord, guess) => {
    return await sendAPI("add-guess", {
        currentWord,
        guess,
    });
};

export const getGuesses = async () => {
    return (await sendAPI("get-guesses")) || { guesses: [] };
};

export default {
    getWord,
    getStats,
    updateStats,
    addGuess,
    getGuesses,
};
