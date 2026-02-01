import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import GrammarLevelList from "@/features/grammar/components/grammar-level-list";
import GrammarStats from "@/features/grammar/components/grammar-stats";

export default function GrammarOverview() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Ngữ pháp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Khám phá và học ngữ pháp tiếng Nhật
        </Typography>
      </Stack>
      <GrammarStats />
      <GrammarLevelList />
    </Stack>
  );
}
