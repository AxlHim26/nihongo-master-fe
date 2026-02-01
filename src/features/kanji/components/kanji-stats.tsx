import MapIcon from "@mui/icons-material/Map";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StarIcon from "@mui/icons-material/Star";

import { kanjiClusters } from "@/core/data/kanji-map";
import StatCard from "@/shared/components/ui/stat-card";

const totalKanji = kanjiClusters.reduce((sum, cluster) => sum + cluster.kanjiCount, 0);
const masteredKanji = Math.round(
  kanjiClusters.reduce((sum, cluster) => sum + (cluster.kanjiCount * cluster.progress) / 100, 0),
);

export default function KanjiStats() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatCard
        icon={<MapIcon fontSize="small" />}
        label="Cụm kiến thức"
        value={kanjiClusters.length}
        tone="neutral"
      />
      <StatCard icon={<MenuBookIcon fontSize="small" />} label="Kanji" value={totalKanji} />
      <StatCard icon={<StarIcon fontSize="small" />} label="Đã học" value={masteredKanji} />
    </div>
  );
}
