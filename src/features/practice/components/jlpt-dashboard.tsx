"use client";

import { useState } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  CardActionArea,
  LinearProgress,
  Chip,
  Button
} from "@mui/material";
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { useRouter } from "next/navigation";

// Demo data for the dashboard
const LEVELS = [
  { id: "N5", title: "JLPT N5", desc: "Basic Japanese", progress: 80, color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-500/20" },
  { id: "N4", title: "JLPT N4", desc: "Elementary Japanese", progress: 45, color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/20" },
  { id: "N3", title: "JLPT N3", desc: "Intermediate Japanese", progress: 15, color: "from-amber-400 to-orange-500", shadow: "shadow-amber-500/20" },
  { id: "N2", title: "JLPT N2", desc: "Pre-Advanced Japanese", progress: 0, color: "from-rose-400 to-pink-500", shadow: "shadow-rose-500/20" },
  { id: "N1", title: "JLPT N1", desc: "Advanced Japanese", progress: 0, color: "from-fuchsia-500 to-purple-600", shadow: "shadow-purple-500/20" },
];

export default function JlptDashboard() {
  const router = useRouter();
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  const handleStartPractice = (level: string) => {
    router.push(`/practice/jlpt/${level}`);
  };

  return (
    <Container maxWidth="lg" className="py-8 min-h-[calc(100vh-64px)] space-y-8">
      {/* Header Section */}
      <Box className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
        
        <Grid container spacing={4} alignItems="center" className="relative z-10">
          <Grid item xs={12} md={8} className="space-y-4">
            <Typography variant="h3" fontWeight={800} className="tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              JLPT Dojo
            </Typography>
            <Typography variant="h6" className="text-slate-300 font-medium max-w-xl">
              Chinh phục kỳ thi năng lực tiếng Nhật qua các bài tập tương tác, giải thích chi tiết và theo dõi tiến độ chuẩn hóa.
            </Typography>
            <Box className="pt-4 flex gap-4">
              <Button 
                variant="contained" 
                size="large"
                startIcon={<SchoolRoundedIcon />}
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-2.5 font-bold shadow-blue-500/30"
                onClick={() => handleStartPractice("placement")}
              >
                Kiểm tra xếp lớp
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                className="rounded-full px-6 py-2.5 font-bold border-slate-500 text-slate-200 hover:border-slate-300 hover:bg-white/5"
              >
                Lịch sử làm bài
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} className="hidden md:flex justify-center">
            <WorkspacePremiumRoundedIcon className="text-9xl text-blue-400 opacity-80" />
          </Grid>
        </Grid>
      </Box>

      {/* Levels Grid */}
      <Box className="space-y-6">
        <Typography variant="h5" fontWeight={700} className="text-slate-800 dark:text-slate-100 px-2">
          Chọn cấp độ ôn tập
        </Typography>
        
        <Grid container spacing={3}>
          {LEVELS.map((level) => (
            <Grid item xs={12} sm={6} md={4} key={level.id}>
              <Card 
                className={`h-full rounded-2xl transition-all duration-300 transform 
                  ${hoveredLevel === level.id ? '-translate-y-2 ' + level.shadow : 'shadow-md'}
                  bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/50
                `}
                onMouseEnter={() => setHoveredLevel(level.id)}
                onMouseLeave={() => setHoveredLevel(null)}
              >
                <CardActionArea 
                  className="h-full p-2"
                  onClick={() => handleStartPractice(level.id)}
                >
                  <CardContent className="space-y-4">
                    <Box className="flex justify-between items-start">
                      <Box 
                        className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${level.color} text-white shadow-lg`}
                      >
                        <Typography variant="h6" fontWeight={800}>{level.id}</Typography>
                      </Box>
                      {level.progress === 100 ? (
                        <Chip label="Mastered" size="small" color="success" className="font-bold" />
                      ) : level.progress > 0 ? (
                        <Chip label="In Progress" size="small" color="primary" className="font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
                      ) : null}
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" fontWeight={700} className="mb-1 dark:text-white">
                        {level.title}
                      </Typography>
                      <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                        {level.desc}
                      </Typography>
                    </Box>

                    <Box className="pt-4 space-y-2">
                      <Box className="flex justify-between items-center">
                        <Typography variant="caption" fontWeight={600} className="text-slate-600 dark:text-slate-300">
                          Tiến độ hoàn thành
                        </Typography>
                        <Typography variant="caption" fontWeight={700} className="text-blue-600 dark:text-blue-400">
                          {level.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={level.progress} 
                        className="h-2 rounded-full bg-slate-100 dark:bg-slate-700"
                        sx={{
                          '& .MuiLinearProgress-bar': {
                            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                            className: level.color,
                            borderRadius: '9999px'
                          }
                        }}
                      />
                    </Box>

                    <Box className={`flex items-center text-blue-600 dark:text-blue-400 font-semibold pt-2 transition-opacity duration-300 ${hoveredLevel === level.id ? 'opacity-100' : 'opacity-0'}`}>
                      Bắt đầu ngay <PlayArrowRoundedIcon fontSize="small" className="ml-1" />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
