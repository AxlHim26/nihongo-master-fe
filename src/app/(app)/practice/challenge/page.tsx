import FlagIcon from "@mui/icons-material/Flag";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Metadata } from "next";

import EmptyState from "@/shared/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Thử thách 50 ngày",
  description: "Lộ trình luyện tập 50 ngày",
};

export default function PracticeChallengePage() {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        Thử thách 50 ngày
      </Typography>
      <EmptyState
        icon={<FlagIcon />}
        title="Đang phát triển"
        description="Tính năng này sẽ sớm ra mắt."
      />
    </Stack>
  );
}
