const SCORE_API_ORIGINS = [
  'https://japan-festival-2026-ardidelawi01-2135s-projects.vercel.app',
  'https://japan-festival-2026.vercel.app',
];

if (typeof window !== 'undefined') {
  window.YANMAR_SCORE_API_ORIGINS = SCORE_API_ORIGINS;
  window.YANMAR_SCORE_API_ORIGIN = SCORE_API_ORIGINS[0];
}
