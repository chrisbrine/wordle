// Get time until next word (midnight)
export function getNextWordTime() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
}

// Format milliseconds to HH:MM:SS
export function formatTimeRemaining(timeInMS) {
    const ms = timeInMS < 0 ? 0 : timeInMS;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((num) => num.toString().padStart(2, "0"))
        .join(":");
}
