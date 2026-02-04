import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

import type { AgentSettings } from "@/features/practice/types/agent";

type AgentSettingsProps = {
  settings: AgentSettings;
  onChange: (next: Partial<AgentSettings>) => void;
};

const sliderSx = {
  "& .MuiSlider-thumb": { height: 14, width: 14 },
  "& .MuiSlider-rail": { opacity: 0.2 },
};

export default function AgentSettings({ settings, onChange }: AgentSettingsProps) {
  return (
    <Box className="space-y-4">
      <div>
        <Typography variant="caption" color="text.secondary">
          Fillers
        </Typography>
        <Slider
          value={settings.fillerFrequency}
          min={0}
          max={100}
          onChange={(_, value) => onChange({ fillerFrequency: value as number })}
          valueLabelDisplay="auto"
          sx={sliderSx}
        />
      </div>
      <div>
        <Typography variant="caption" color="text.secondary">
          Politeness
        </Typography>
        <Slider
          value={settings.politeness}
          min={0}
          max={100}
          onChange={(_, value) => onChange({ politeness: value as number })}
          valueLabelDisplay="auto"
          sx={sliderSx}
        />
      </div>
      <div>
        <Typography variant="caption" color="text.secondary">
          Emotional
        </Typography>
        <Slider
          value={settings.emotional}
          min={0}
          max={100}
          onChange={(_, value) => onChange({ emotional: value as number })}
          valueLabelDisplay="auto"
          sx={sliderSx}
        />
      </div>
    </Box>
  );
}
