import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

import {
  type AgentSettings,
  type ProficiencyLevel,
  proficiencyLevelOptions,
} from "@/features/practice/types/agent";

type AgentSettingsProps = {
  settings: AgentSettings;
  onChange: (next: Partial<AgentSettings>) => void;
};

const sliderSx = {
  "& .MuiSlider-thumb": {
    height: 14,
    width: 14,
    backgroundColor: "var(--app-card)",
    border: "2px solid var(--app-primary)",
    boxShadow: "none",
  },
  "& .MuiSlider-track": {
    border: "none",
    backgroundColor: "var(--app-primary)",
  },
  "& .MuiSlider-rail": {
    opacity: 1,
    backgroundColor: "var(--app-border)",
  },
  "& .MuiSlider-valueLabel": {
    backgroundColor: "var(--app-card)",
    color: "var(--app-fg)",
    border: "1px solid var(--app-border)",
  },
};

const selectSx = {
  "& .MuiInputLabel-root": {
    color: "var(--app-muted)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--app-fg)",
  },
  "& .MuiOutlinedInput-root": {
    color: "var(--app-fg)",
    backgroundColor: "var(--app-surface-2)",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--app-border)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--app-active-border)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "var(--app-active-border)",
    },
  },
};

export default function AgentSettings({ settings, onChange }: AgentSettingsProps) {
  return (
    <Box className="space-y-4">
      <div>
        <FormControl size="small" fullWidth sx={selectSx}>
          <InputLabel id="practice-level-label">Trình độ</InputLabel>
          <Select
            labelId="practice-level-label"
            value={settings.proficiencyLevel}
            label="Trình độ"
            onChange={(event) =>
              onChange({
                proficiencyLevel: event.target.value as ProficiencyLevel,
              })
            }
          >
            {proficiencyLevelOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div>
        <Typography variant="caption" color="text.secondary">
          Tốc độ nói
        </Typography>
        <Slider
          value={settings.speechRate}
          min={70}
          max={130}
          step={5}
          onChange={(_, value) => onChange({ speechRate: value as number })}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          sx={sliderSx}
        />
      </div>
    </Box>
  );
}
