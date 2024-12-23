export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.jsx?$": "vite-jest",
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
