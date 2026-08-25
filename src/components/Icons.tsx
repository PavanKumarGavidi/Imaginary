import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const S = ({ children, ...p }: P) => (
  <svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...p}
  >
    {children}
  </svg>
);

export const IconAperture = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v6.5M20.66 7l-5.6 3.25M20.66 17h-6.5M12 22v-6.5M3.34 17l5.6-3.25M3.34 7h6.5" />
  </S>
);

export const IconLens = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <path d="M17.5 6.5l1.2-1.2" />
  </S>
);

export const IconRings = (p: P) => (
  <S {...p}>
    <circle cx="9" cy="13.5" r="6" />
    <circle cx="15.5" cy="10.5" r="6" />
    <path d="M13.5 2.8l2-1.3 2 1.3-.5 2h-3z" />
  </S>
);

export const IconPrism = (p: P) => (
  <S {...p}>
    <path d="M12 3L2.8 19.5h18.4z" />
    <path d="M12 9.5v10M7.5 15.5h9" />
  </S>
);

export const IconHanger = (p: P) => (
  <S {...p}>
    <path d="M12 6.5a2 2 0 1 0-2-2" />
    <path d="M12 6.5v2.2L2.8 14.8a1.2 1.2 0 0 0 .7 2.2h17a1.2 1.2 0 0 0 .7-2.2L12 8.7" />
  </S>
);

export const IconSprout = (p: P) => (
  <S {...p}>
    <path d="M12 21v-8" />
    <path d="M12 13c0-4 2.5-6.5 7-6.5 0 4.5-2.5 6.5-7 6.5z" />
    <path d="M12 16c0-3-1.8-4.8-5.2-4.8 0 3.4 1.8 4.8 5.2 4.8z" />
    <path d="M7 21h10" />
  </S>
);

export const IconStage = (p: P) => (
  <S {...p}>
    <path d="M9 3h6l-1 5h-4z" />
    <path d="M10 8l-6.5 11h17L14 8" />
    <path d="M12 3v-1M4.5 5.5L6 6.5M19.5 5.5L18 6.5" />
  </S>
);

export const IconArrow = (p: P) => (
  <S {...p}>
    <path d="M6 18L18 6M9 6h9v9" />
  </S>
);

export const IconArrowR = (p: P) => (
  <S {...p}>
    <path d="M4 12h16M13 5l7 7-7 7" />
  </S>
);

export const IconKey = (p: P) => (
  <S {...p}>
    <circle cx="8" cy="15" r="4.5" />
    <path d="M11.2 11.8L20 3M16 7l3 3M13.5 9.5l2 2" />
  </S>
);

export const IconPrint = (p: P) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="13" rx="1" />
    <circle cx="17.2" cy="8" r="1.1" />
    <path d="M3 14l5-5 4 4 3-2.5 6 5" />
    <path d="M9 21h6" />
  </S>
);

export const IconClock = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </S>
);

export const IconPin = (p: P) => (
  <S {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </S>
);

export const IconPhone = (p: P) => (
  <S {...p}>
    <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10.5 20 4 13.5 3.5 5.6A1.5 1.5 0 0 1 5 4z" />
  </S>
);

export const IconMail = (p: P) => (
  <S {...p}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M3 7l9 6 9-6" />
  </S>
);

export const IconStar = (p: P) => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9z" />
  </svg>
);

export const IconCheck = (p: P) => (
  <S {...p}>
    <path d="M4.5 12.5l5 5L19.5 7" />
  </S>
);

export const IconX = (p: P) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </S>
);

export const IconTrash = (p: P) => (
  <S {...p}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
  </S>
);

export const IconDownload = (p: P) => (
  <S {...p}>
    <path d="M12 3v11M7.5 10.5L12 15l4.5-4.5M4 19h16" />
  </S>
);

export const IconSearch = (p: P) => (
  <S {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L21 21" />
  </S>
);

export const IconChevron = (p: P) => (
  <S {...p}>
    <path d="M5 9l7 7 7-7" />
  </S>
);

export const IconCalendar = (p: P) => (
  <S {...p}>
    <rect x="3" y="5" width="18" height="16" rx="1" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </S>
);

export const IconUsers = (p: P) => (
  <S {...p}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M15.5 5.6a3.5 3.5 0 0 1 0 5.8M17.8 14.9c2 .8 3.2 2.6 3.2 5.1" />
  </S>
);

export const IconFlash = (p: P) => (
  <S {...p}>
    <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5z" />
  </S>
);

export const IconMenu = (p: P) => (
  <S {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </S>
);

export const IconEye = (p: P) => (
  <S {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </S>
);

export const IconEyeOff = (p: P) => (
  <S {...p}>
    <path d="M4 4l16 16M10 6a9.8 9.8 0 0 1 2-.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3 3.6M6.1 8.3A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.3 3.3-.7" />
    <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
  </S>
);

export const IconWhatsApp = (p: P) => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.2.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.8 3.5.5 1.6 1.6 3 3 4a10 10 0 0 0 4.3 1.9c1.3.3 2.4.1 3.2-.5.5-.4.8-1 .9-1.6v-.9c-.1-.1-.3-.2-.5-.2z" />
  </svg>
);

export const IconInstagram = (p: P) => (
  <S {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
  </S>
);

export const IconFilm = (p: P) => (
  <S {...p}>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21M7.5 12h9" />
  </S>
);

export const IconBell = (p: P) => (
  <S {...p}>
    <path d="M12 3a6 6 0 0 0-6 6v3.5L4 16h16l-2-3.5V9a6 6 0 0 0-6-6z" />
    <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
  </S>
);

export const IconLogout = (p: P) => (
  <S {...p}>
    <path d="M14 4H5.5v16H14M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5" />
  </S>
);

export const IconBack = (p: P) => (
  <S {...p}>
    <path d="M20 12H4M11 5l-7 7 7 7" />
  </S>
);

