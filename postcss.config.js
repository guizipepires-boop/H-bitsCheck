@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  @apply bg-surface text-text;
}

/* Hide scrollbars for charts and containers when not needed */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}