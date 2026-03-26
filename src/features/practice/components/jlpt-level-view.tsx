"use client";

import { Box, Container, Typography, Grid, Card, CardActionArea, CardContent, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import SpellcheckRoundedIcon from '@mui/icons-material/SpellcheckRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const CATEGORIES = [
  { id: "LANGUAGE_KNOWLEDGE", title: "Từ vựng & Kanji", icon: <SpellcheckRoundedIcon fontSize="large" />, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: "GRAMMAR_KNOWLEDGE", title: "Ngữ pháp", icon: <TranslateRoundedIcon fontSize="large" />, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  { id: "READING", title: "Đọc hiểu", icon: <AutoStoriesRoundedIcon fontSize="large" />, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
  { id: "LISTENING", title: "Nghe hiểu", icon: <HeadphonesRoundedIcon fontSize="large" />, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
];

export default function JlptLevelView({ level }: { level: string }) {
  const router = useRouter();

  const handleStartPractice = (categoryId: string) => {
    // Navigate to actual practice view
    router.push(`/practice/jlpt/${level.toLowerCase()}/quiz?type=${categoryId}`);
  };

  const isPlacement = level === "PLACEMENT";

  return (
    <Container maxWidth="lg" className="py-8 space-y-8 animate-fade-in">
      <Button 
        startIcon={<ArrowBackRoundedIcon />} 
        onClick={() => router.push('/practice/jlpt')}
        className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 mb-4"
      >
        Quay lại Dojo
      </Button>

      <Box className="text-center space-y-4 max-w-2xl mx-auto">
        {isPlacement ? (
          <>
            <Typography variant="h3" fontWeight={800} className="text-slate-800 dark:text-white">
              Kiểm tra Xếp lớp
            </Typography>
            <Typography variant="body1" className="text-slate-500 dark:text-slate-400">
              Bạn chưa biết mình ở trình độ nào? Hãy làm một bài test ngắn 15 phút để hệ thống đánh giá và gợi ý lộ trình phù hợp nhất nhé!
            </Typography>
            <Box className="pt-8">
              <Button 
                variant="contained" 
                size="large"
                className="bg-blue-600 rounded-full px-12 py-3 text-lg font-bold shadow-lg shadow-blue-500/30"
                onClick={() => router.push('/practice/jlpt/placement/quiz')}
              >
                Bắt đầu Bài test
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h3" fontWeight={800} className="text-slate-800 dark:text-white">
              Cấp độ <span className="text-blue-600 dark:text-blue-400">{level}</span>
            </Typography>
            <Typography variant="body1" className="text-slate-500 dark:text-slate-400 pb-8">
              Chọn một kỹ năng bạn muốn luyện tập hôm nay bằng Mini-set (10-15 câu), hoặc thử sức với một đề thi thử (Full Mock Test).
            </Typography>
            
            <Typography variant="h6" fontWeight={700} align="left" className="text-slate-700 dark:text-slate-200 mb-4">
              🎓 Luyện tập Kỹ năng (Mini-sets)
            </Typography>
            <Grid container spacing={3} className="text-left">
              {CATEGORIES.map((cat) => (
                <Grid item xs={12} sm={6} key={cat.id}>
                  <Card className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/80">
                    <CardActionArea onClick={() => handleStartPractice(cat.id)} className="p-4 flex flex-row items-center gap-4">
                      <Box className={`w-16 h-16 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                        {cat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700} className="dark:text-white">
                          {cat.title}
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                          10-15 câu hỏi
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Premium Full Mock Test Section */}
            <Box className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
              <Box className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <Box className="space-y-2 flex-1">
                  <Typography variant="h5" fontWeight={800} className="flex items-center gap-2">
                    <AssessmentRoundedIcon /> Đề Thi Thử Toàn Diện (Mock Test)
                  </Typography>
                  <Typography variant="body2" className="text-indigo-100">
                    Trải nghiệm cảm giác thi thật với cấu trúc đề thi thời gian thực, đánh giá chính xác năng lực hiện tại của bạn.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  className="bg-white text-indigo-700 hover:bg-slate-100 font-bold px-8 py-3 rounded-full whitespace-nowrap shadow-lg"
                  onClick={() => router.push(`/practice/jlpt/${level.toLowerCase()}/mock`)}
                >
                  Thi Thử Ngay
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
