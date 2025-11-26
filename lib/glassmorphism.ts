// Glassmorphism utility classes using popular design patterns
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Popular glassmorphism presets inspired by UI libraries
export const glassStyles = {
  // Primary glass card - most common use
  card: 'bg-white/70 backdrop-blur-2xl border border-white/20 shadow-xl',
  
  // Strong glass for headers and important sections
  strong: 'bg-white/80 backdrop-blur-3xl border border-white/30 shadow-2xl',
  
  // Subtle glass for backgrounds
  subtle: 'bg-white/40 backdrop-blur-xl border border-white/10 shadow-lg',
  
  // Dark glass variant
  dark: 'bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl',
  
  // Input glass style
  input: 'bg-white/60 backdrop-blur-xl border border-white/30 focus:bg-white/80 focus:border-blue-400/50',
  
  // Button glass overlay
  button: 'backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20',
  
  // Modal/Dialog glass
  modal: 'bg-white/90 backdrop-blur-3xl border border-white/40 shadow-2xl',
  
  // Sidebar glass
  sidebar: 'bg-white/60 backdrop-blur-2xl border-r border-white/20',
};

// Background patterns for glassmorphism effect
export const backgroundPatterns = {
  // Mesh gradient (popular in modern UI)
  mesh: `
    bg-slate-100
    [background-image:radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15)_0%,transparent_50%),
    radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.1)_0%,transparent_50%),
    radial-gradient(circle_at_50%_50%,rgba(147,197,253,0.08)_0%,transparent_50%)]
  `,
  
  // Dots pattern
  dots: `
    bg-slate-50
    [background-image:radial-gradient(circle,rgba(100,116,139,0.1)_1px,transparent_1px)]
    [background-size:20px_20px]
  `,
  
  // Grid pattern
  grid: `
    bg-white
    [background-image:linear-gradient(rgba(100,116,139,0.05)_1px,transparent_1px),
    linear-gradient(90deg,rgba(100,116,139,0.05)_1px,transparent_1px)]
    [background-size:50px_50px]
  `,
  
  // Noise texture
  noise: `
    bg-slate-50
    [background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")]
  `,
  
  // Waves pattern
  waves: `
    bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50
    [background-image:url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.73-5.139-1.691-8.233-2.928C65.888 13.278 60.562 12 50 12c-10.626 0-16.855 1.397-26.66 5.063l-1.767.662c-2.475.923-4.66 1.674-6.724 2.275h6.335zm0-20C13.258 2.892 8.077 4 0 4V2c5.744 0 9.951-.574 14.85-2h6.334zM77.38 0C85.239 2.966 90.502 4 100 4V2c-6.842 0-11.386-.542-16.396-2h-6.225zM0 14c8.44 0 13.718-1.21 22.272-4.402l1.768-.661C33.64 5.347 39.647 4 50 4c10.271 0 15.362 1.222 24.629 4.928C84.112 12.722 89.438 14 100 14v-2c-10.271 0-15.362-1.222-24.629-4.928C65.888 3.278 60.562 2 50 2 39.374 2 33.145 3.397 23.34 7.063l-1.767.662C13.223 10.84 8.163 12 0 12v2z' fill='%2364748b' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")]
  `,
};

// Animation utilities
export const animations = {
  float: 'animate-[float_6s_ease-in-out_infinite]',
  pulse: 'animate-[pulse_3s_ease-in-out_infinite]',
  shimmer: 'animate-[shimmer_2s_ease-in-out_infinite]',
};
