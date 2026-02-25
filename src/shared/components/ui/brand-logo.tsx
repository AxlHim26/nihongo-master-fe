import * as React from "react";

import { cn } from "@/shared/utils/cn";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  subtitleClassName?: string;
  withLabel?: boolean;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: {
    icon: "h-9 w-9 rounded-xl",
    title: "text-[1.05rem]",
    subtitle: "text-[11px]",
  },
  md: {
    icon: "h-11 w-11 rounded-2xl",
    title: "text-[1.25rem]",
    subtitle: "text-xs",
  },
  lg: {
    icon: "h-12 w-12 rounded-2xl",
    title: "text-[1.4rem]",
    subtitle: "text-sm",
  },
} as const;

export default function BrandLogo({
  className,
  iconClassName,
  labelClassName,
  subtitleClassName,
  withLabel = true,
  subtitle,
  size = "sm",
}: BrandLogoProps) {
  const config = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex items-center justify-center border border-blue-200/60 bg-gradient-to-br from-[#79A8FF] to-[#3D73F3] shadow-[0_10px_24px_-14px_rgba(37,99,235,0.9)]",
          config.icon,
          iconClassName,
        )}
      >
        <svg
          viewBox="0 0 40 40"
          className="h-[66%] w-[66%]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 24.5C10 17.0442 16.0442 11 23.5 11H31"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.92"
          />
          <path
            d="M27 7L31 11L27 15"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.92"
          />
          <path
            d="M10 30L18.2 22L22.8 26.6L31 18.5"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.4 9.4L8.6 11.7L10.9 12.9L8.6 14.1L7.4 16.4L6.2 14.1L3.9 12.9L6.2 11.7L7.4 9.4Z"
            fill="white"
            fillOpacity="0.85"
          />
        </svg>
      </span>

      {withLabel ? (
        <div className={cn("flex min-w-0 flex-col", labelClassName)}>
          <span className={cn("font-semibold leading-none", config.title)}>
            <span className="text-slate-900 dark:text-white">Mirai</span>
            <span className="text-[#3D73F3] dark:text-[#60A5FA]">Go</span>
          </span>
          {subtitle ? (
            <span
              className={cn(
                "mt-1 text-slate-500 dark:text-[#A1A1AA]",
                config.subtitle,
                subtitleClassName,
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
