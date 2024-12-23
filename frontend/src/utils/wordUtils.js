// Get status for each letter in a guess compared to target word
export function getGuessStatuses(guess, targetWord) {
    // Handle undefined/null inputs
    if (!guess || !targetWord) {
        return Array(5).fill(""); // Default to 5 empty statuses
    }

    if (guess.length !== targetWord.length) {
        return Array(targetWord.length).fill("");
    }

    const statuses = Array(targetWord.length).fill("absent");
    const targetLetterCount = {};

    // First, mark correct letters
    for (let i = 0; i < targetWord.length; i++) {
        const targetLetter = targetWord[i];
        targetLetterCount[targetLetter] =
            (targetLetterCount[targetLetter] || 0) + 1;

        if (guess[i] === targetLetter) {
            statuses[i] = "correct";
            targetLetterCount[targetLetter]--;
        }
    }

    // Then, mark present letters (up to remaining count)
    for (let i = 0; i < targetWord.length; i++) {
        if (statuses[i] === "correct") continue;

        const guessLetter = guess[i];
        if (
            targetLetterCount[guessLetter] &&
            targetLetterCount[guessLetter] > 0
        ) {
            statuses[i] = "present";
            targetLetterCount[guessLetter]--;
        }
    }

    return statuses;
}
