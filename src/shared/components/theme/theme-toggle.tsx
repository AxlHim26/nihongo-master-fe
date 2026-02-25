"use client";

import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { MouseEvent } from "react";
import { useShallow } from "zustand/react/shallow";

import { useThemeStore } from "@/shared/stores/theme-store";

export default function ThemeToggle() {
  const { mode, setMode } = useThemeStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  );

  const handleChange = (_event: MouseEvent<HTMLElement>, value: string | null) => {
    if (value === "light" || value === "dark" || value === "system") {
      setMode(value);
    }
  };

  return (
    <ToggleButtonGroup
      aria-label="Theme mode"
      color="standard"
      value={mode}
      exclusive
      onChange={handleChange}
      size="small"
      className="rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] shadow-sm backdrop-blur"
      sx={{
        "& .MuiToggleButton-root.Mui-selected": {
          color: "#60A5FA",
          backgroundColor: "rgba(96,165,250,0.14)",
        },
        "& .MuiToggleButton-root.Mui-selected:hover": {
          backgroundColor: "rgba(96,165,250,0.2)",
        },
      }}
    >
      <ToggleButton value="light" aria-label="Light mode">
        <LightModeIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="system" aria-label="System mode">
        <SettingsBrightnessIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="dark" aria-label="Dark mode">
        <DarkModeIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
