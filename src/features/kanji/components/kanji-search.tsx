"use client";

import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SyntheticEvent } from "react";

import {
  kanjiGroupLabel,
  type KanjiSearchEntry,
  kanjiSearchOptions,
} from "@/features/kanji/data/kanji-search";

const filterOptions = createFilterOptions<KanjiSearchEntry>({
  stringify: (option) => `${option.kanji} ${option.reading} ${option.meaning}`,
  limit: 120,
});

type KanjiSearchProps = {
  value: KanjiSearchEntry | null;
  onChange: (value: KanjiSearchEntry | null) => void;
};

export default function KanjiSearch({ value, onChange }: KanjiSearchProps) {
  const handleChange = (_event: SyntheticEvent, nextValue: KanjiSearchEntry | null) => {
    onChange(nextValue);
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      options={kanjiSearchOptions}
      filterOptions={filterOptions}
      groupBy={(option) => kanjiGroupLabel[option.group]}
      getOptionLabel={(option) => option.kanji}
      isOptionEqualToValue={(option, current) => option.kanji === current.kanji}
      renderOption={(props, option) => (
        <li {...props} key={`${option.kanji}-${option.reading}`}>
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-lg font-semibold">
              {option.kanji}
            </div>
            <div>
              <Typography variant="body2" fontWeight={600} className="text-[var(--app-fg)]">
                {option.reading || "Chưa có cách đọc"}
              </Typography>
              <Typography variant="caption" className="text-[var(--app-muted)]">
                {option.meaning || "Chưa có nghĩa"}
              </Typography>
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => {
        const { InputLabelProps: _InputLabelProps, ...rest } = params;
        return (
          <TextField
            {...rest}
            label="Tìm kanji"
            placeholder="Nhập kanji hoặc nghĩa"
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        );
      }}
    />
  );
}
