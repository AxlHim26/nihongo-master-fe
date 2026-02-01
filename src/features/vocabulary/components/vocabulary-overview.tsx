import Stack from "@mui/material/Stack";

import VocabularyHero from "@/features/vocabulary/components/vocabulary-hero";
import VocabularyLibrary from "@/features/vocabulary/components/vocabulary-library";

export default function VocabularyOverview() {
  return (
    <Stack spacing={5}>
      <VocabularyHero />
      <VocabularyLibrary />
    </Stack>
  );
}
