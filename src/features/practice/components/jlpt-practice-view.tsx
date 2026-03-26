"use client";

import { useState, useEffect } from "react";
import { 
  Box, Container, Typography, Button, LinearProgress, Switch, FormControlLabel, Fade, Paper 
} from "@mui/material";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LightbulbCircleRoundedIcon from '@mui/icons-material/LightbulbCircleRounded';
import { useRouter } from "next/navigation";
import HoverRevealText from "./hover-reveal-text";

interface Option {
  key: string;
  text: string;
}

interface Question {
  id: number;
  prompt: string;
  explanation: string;
  options: Option[];
  correctOptionKey?: string; // MOCKED for frontend demo purposes if backend doesn't send it immediately
}

// Simulated data for demo since backend might not be fully seeded with explanations yet
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: "この機械は使い方を間違うと（危険）です。",
    explanation: "「危険」được đọc là きけん (kiken), nghĩa là 'nguy hiểm'.\nCác đáp án khác sai vì:\n- きごけん: Không có từ này.\n- きげん: 機嫌 (Tâm trạng) hoặc 期限 (Kỳ hạn).\n- きこん: 既婚 (Đã kết hôn).",
    correctOptionKey: "2",
    options: [
      { key: "1", text: "きごけん" },
      { key: "2", text: "きけん" },
      { key: "3", text: "きげん" },
      { key: "4", text: "きこん" }
    ]
  },
  {
    id: 2,
    prompt: "大切なことを（忘れない）ようにメモしておきます。",
    explanation: "「忘れない」đọc là わすれない (wasurenai), nghĩa là 'không quên'. Chữ Hán là VONG (quên).",
    correctOptionKey: "4",
    options: [
      { key: "1", text: "忘れれない" },
      { key: "2", text: "亡れない" },
      { key: "3", text: "怒れない" },
      { key: "4", text: "忘れない" }
    ]
  }
];

export default function JlptPracticeView({ level, type }: { level: string, type: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [enableHoverReveal, setEnableHoverReveal] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleSelectOption = (key: string) => {
    if (isCorrect) return; // Already passed this question

    setSelectedOption(key);
    
    // Evaluate (In a real app, you might evaluate via API, but for quick Practice Mode, frontend evaluation is faster)
    if (key === currentQuestion.correctOptionKey) {
      setIsCorrect(true);
      setIsWrong(false);
    } else {
      setIsWrong(true);
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsWrong(false);
      setIsCorrect(false);
    } else {
      // Finished
      router.push('/practice/jlpt');
    }
  };

  if (!currentQuestion) return null;

  return (
    <Container maxWidth="md" className="py-8 min-h-[calc(100vh-64px)] flex flex-col animate-fade-in">
      {/* Header */}
      <Box className="flex items-center justify-between mb-8">
        <Button 
          startIcon={<ArrowBackRoundedIcon />} 
          onClick={() => router.push(`/practice/jlpt/${level.toLowerCase()}`)}
          className="text-slate-500 rounded-full dark:text-slate-400"
        >
          Trở lại
        </Button>
        <Typography variant="h6" fontWeight={700} className="text-slate-700 dark:text-slate-200">
          {level} - {type.replace('_', ' ')}
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={enableHoverReveal} 
              onChange={(e) => setEnableHoverReveal(e.target.checked)} 
              color="primary"
            />
          }
          label={<Typography variant="body2" className="text-slate-500 font-medium whitespace-nowrap">Tra từ (Hover)</Typography>}
          className="m-0"
        />
      </Box>

      {/* Progress */}
      <Box className="mb-10 space-y-2">
        <Box className="flex justify-between text-sm font-bold text-slate-500">
          <span>Câu {currentIndex + 1} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          className="h-3 rounded-full bg-slate-100 dark:bg-slate-800"
          sx={{ '& .MuiLinearProgress-bar': { borderRadius: '9999px', backgroundColor: '#3b82f6' } }}
        />
      </Box>

      {/* Main Quiz Area */}
      <Box className="flex-1 flex flex-col">
        {/* Question Prompt */}
        <Paper elevation={0} className="p-8 mb-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm">
          <HoverRevealText text={currentQuestion.prompt} enabled={enableHoverReveal} />
        </Paper>

        {/* Options */}
        <Box className="space-y-4">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            const isCurrentlyCorrect = isSelected && isCorrect;
            const isCurrentlyWrong = isSelected && isWrong;

            return (
              <Box 
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`
                  p-5 rounded-2xl cursor-pointer transition-all duration-300 transform active:scale-[0.98]
                  border-2 flex items-center justify-between
                  ${isCurrentlyCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : ''}
                  ${isCurrentlyWrong ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 animate-shake' : ''}
                  ${!isSelected && !isCorrect ? 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200' : ''}
                  ${isCorrect && !isSelected ? 'opacity-50 pointer-events-none border-slate-200 dark:border-slate-700 text-slate-400' : ''}
                `}
              >
                <Typography variant="body1" fontWeight={600} className="text-lg">
                  {opt.key}. {opt.text}
                </Typography>
                
                {isCurrentlyCorrect && <CheckCircleRoundedIcon className="text-emerald-500" />}
                {isCurrentlyWrong && <CancelRoundedIcon className="text-rose-500" />}
              </Box>
            );
          })}
        </Box>

        {/* Explanation & Next Button */}
        <Box className="mt-8 min-h-[150px]">
          <Fade in={isWrong || isCorrect}>
            <Box>
              {(isWrong || isCorrect) && (
                <Paper elevation={0} className="p-6 rounded-2xl bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 mb-6">
                  <Box className="flex items-start gap-4">
                    <LightbulbCircleRoundedIcon className="text-blue-500 mt-1" fontSize="large" />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} className="text-blue-900 dark:text-blue-200 mb-2">
                        Giải thích chi tiết
                      </Typography>
                      <Typography variant="body1" className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {currentQuestion.explanation || "Chưa có giải thích cho câu hỏi này."}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
              
              {isCorrect && (
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 text-lg font-bold shadow-lg shadow-blue-500/30"
                  onClick={handleNext}
                >
                  {currentIndex < questions.length - 1 ? "Tiếp tục" : "Hoàn thành"}
                </Button>
              )}
            </Box>
          </Fade>
        </Box>
      </Box>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}} />
    </Container>
  );
}
