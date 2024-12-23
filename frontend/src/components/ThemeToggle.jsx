import { useTheme } from "../hooks/useTheme";
import "./ThemeToggle.css";

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
            } mode`}
        >
            <div
                className={`toggle-slider ${
                    theme === "light" ? "right" : "left"
                }`}
            >
                <div className="toggle-icon" />
            </div>
        </button>
    );
}

export default ThemeToggle;
