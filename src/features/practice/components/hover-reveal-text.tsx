"use client";

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

interface HoverRevealTextProps {
  text: string;
  enabled: boolean;
}

export default function HoverRevealText({ text, enabled }: HoverRevealTextProps) {
  // This is a simplified version. In a real scenario, you'd parse Kanji and wrap them 
  // with tooltips using the MegaLLM/Kanji dictionary integration.
  // For the sake of this gamification plan, we simulate the toggle behavior.

  if (!enabled) {
    return <Typography variant="h6" className="leading-loose font-medium">{text}</Typography>;
  }

  // Simulate parsing Kanji and adding a subtle underline to indicate hoverability
  // We'll just add a global class to the text for now that shows it's interactive
  return (
    <Typography 
      variant="h6" 
      className="leading-loose font-medium"
      sx={{
        '& span.kanji': {
          borderBottom: '2px dotted #94a3b8',
          cursor: 'help',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb'
          }
        }
      }}
    >
      {/* Mock wrapping some characters if they look like kanji for demonstration */}
      {text.split('').map((char, index) => {
        // Simple regex to check if character is Kanji (CJK Unified Ideographs)
        const isKanji = /[\u4e00-\u9faf]/.test(char);
        return isKanji ? (
          <span key={index} className="kanji" title="Click or hover to reveal meaning (Simulated)">
            {char}
          </span>
        ) : (
          <span key={index}>{char}</span>
        );
      })}
    </Typography>
  );
}
