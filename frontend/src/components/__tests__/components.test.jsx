import { render } from "@testing-library/react";
import { it, expect, vi } from "vitest"; // Use `vi` for mocks
import Header from "../Header";
import Grid from "../Grid";

it("renders the Header component correctly", () => {
    const mockOnInstructionsClick = vi.fn();
    const mockOnStatsClick = vi.fn();

    const container = render(
        <Header
            onInstructionsClick={mockOnInstructionsClick}
            onStatsClick={mockOnStatsClick}
        />
    ).baseElement;

    // Find buttons using ARIA labels
    const title = container.querySelector("header h1");

    // Assert that te inner text is correct
    expect(title).toHaveTextContent("WORDLE");
});

it("renders the Grid component with correct number of rows", () => {
    const mockGameData = {
        attempts: ["TEST", "GUESS", "", "", ""],
        word: "GUESS",
        currentAttempt: 2,
    };

    const container = render(<Grid gameData={mockGameData} />).baseElement;

    // Find rows using the classname grid-row
    const rows = container.querySelectorAll(".grid-row");
    expect(rows.length).toBe(5);
});
