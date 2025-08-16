import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'pos-theme';

  // Signal for current theme
  currentTheme = signal<Theme>('system');

  // Signal for whether dark mode is enabled
  isDarkMode = signal<boolean>(false);

  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();

    // Effect to update document classes when theme changes
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  private initializeTheme(): void {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;

    if (
      savedTheme &&
      (savedTheme === 'light' ||
        savedTheme === 'dark' ||
        savedTheme === 'system')
    ) {
      this.currentTheme.set(savedTheme);
    } else {
      // Default to system preference
      this.currentTheme.set('system');
    }

    this.updateDarkMode();
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Apply system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }

    // Update localStorage
    localStorage.setItem(this.THEME_KEY, theme);

    // Update isDarkMode signal
    this.updateDarkMode();
  }

  private updateDarkMode(): void {
    const theme = this.currentTheme();
    let isDark = false;

    if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = theme === 'dark';
    }

    this.isDarkMode.set(isDark);
  }

  toggleTheme(): void {
    const current = this.currentTheme();
    let newTheme: Theme;

    if (current === 'system') {
      // If system, toggle to light
      newTheme = 'light';
    } else if (current === 'light') {
      // If light, toggle to dark
      newTheme = 'dark';
    } else {
      // If dark, toggle to system
      newTheme = 'system';
    }

    this.currentTheme.set(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }
}
