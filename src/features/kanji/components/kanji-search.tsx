"use client";

import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { SyntheticEvent } from "react";

import hanvietMapRaw from "@/features/kanji/data/hanviet-map.json";
import {
  kanjiGroupLabel,
  type KanjiSearchEntry,
  kanjiSearchOptions,
} from "@/features/kanji/data/kanji-search";

const hanvietMap = hanvietMapRaw as Record<string, string>;

const filterOptions = createFilterOptions<KanjiSearchEntry>({
  stringify: (option) => {
    const mStr =
      typeof option.meaning === "string"
        ? option.meaning
        : option.meaning?.["vi"] || option.meaning?.["en"] || "";
    return `${option.kanji} ${option.reading} ${mStr}`;
  },
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
              <Typography
                variant="body2"
                fontWeight={600}
                className="flex items-center gap-2 text-[var(--app-fg)]"
              >
                <span>{option.reading || "Chưa có cách đọc"}</span>
                {hanvietMap[option.kanji] && (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {hanvietMap[option.kanji]}
                  </span>
                )}
              </Typography>
              <Typography variant="caption" className="text-[var(--app-muted)]">
                {typeof option.meaning === "string"
                  ? option.meaning
                  : option.meaning?.["vi"] || option.meaning?.["en"] || "Chưa có nghĩa"}
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
