"use client";

import AddIcon from "@mui/icons-material/Add";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useQuery } from "@tanstack/react-query";

import { getVocabularyLibrary } from "@/features/vocabulary/services/vocabulary-service";
import EmptyState from "@/shared/components/ui/empty-state";

export default function VocabularyLibrary() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["vocabulary", "library"],
    queryFn: getVocabularyLibrary,
  });

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Bộ từ của bạn
        </Typography>
        <EmptyState
          icon={<FolderOffIcon />}
          title="Đang tải thư viện..."
          description="Vui lòng chờ trong giây lát."
        />
      </Stack>
    );
  }

  if (isError) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Bộ từ của bạn
        </Typography>
        <EmptyState
          icon={<FolderOffIcon />}
          title="Không thể tải thư viện"
          description="Vui lòng thử lại sau."
        />
      </Stack>
    );
  }

  if (!data || data.sets.length === 0) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          Bộ từ của bạn
        </Typography>
        <EmptyState
          icon={<FolderOffIcon />}
          title="Chưa có nội dung nào"
          description="Tạo bộ từ mới để bắt đầu học."
          action={
            <Button variant="text" startIcon={<AddIcon />}>
              Tạo bộ từ mới
            </Button>
          }
        />
        <EmptyState icon={<FolderOffIcon />} title="Thư mục này trống" className="py-12" />
      </Stack>
    );
  }

  return null;
}
