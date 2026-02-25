import FlagIcon from "@mui/icons-material/Flag";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import EmptyState from "@/shared/components/ui/empty-state";

type PracticeComingSoonProps = {
  title: string;
  description?: string;
};

export default function PracticeComingSoon({
  title,
  description = "Tính năng này sẽ sớm ra mắt.",
}: PracticeComingSoonProps) {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={700}>
        {title}
      </Typography>
      <EmptyState icon={<FlagIcon />} title="Đang phát triển" description={description} />
    </Stack>
  );
}
