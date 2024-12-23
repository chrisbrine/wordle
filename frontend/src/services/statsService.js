import { getStats, updateStats } from "./api";

export const DEFAULT_STATS = {
    gamesPlayed: 0,
    gamesWon: 0,
    // currentStreak: 0,
    // maxStreak: 0,
    // guessDistribution: {
    //   1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    // }
};

export async function getStatistics() {
    try {
        const stats = await getStats();
        if (stats) {
            return {
                gamesPlayed: stats.played,
                gamesWon: stats.won,
            };
        }
    } catch (error) {
        console.error("Error getting statistics:", error);
    }
}

export async function updateStatistics(stats) {
    await updateStats({
        played: stats.gamesPlayed,
        won: stats.gamesWon,
    });
}
