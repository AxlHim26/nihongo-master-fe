import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import KanjiMapList from "@/features/kanji/components/kanji-map-list";
import KanjiStats from "@/features/kanji/components/kanji-stats";

export default function KanjiOverview() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          Kanji map
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi tiến độ ghi nhớ kanji theo cấp độ JLPT
        </Typography>
      </Stack>
      <KanjiStats />
      <KanjiMapList />
    </Stack>
  );
}
