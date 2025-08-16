import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Sun, Moon, Monitor } from 'lucide-angular';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-full">
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">
          Settings
        </h2>
      </div>

      <div class="p-6 space-y-8">
        <!-- Theme Settings Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Appearance
          </h3>

          <div class="space-y-4">
            <!-- Theme Selection -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-gray-600 dark:text-gray-400"
                >Theme</label
              >
              <div class="grid grid-cols-2 gap-3">
                <button
                  (click)="setTheme('light')"
                  [class]="
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ' +
                    (themeService.currentTheme() === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500')
                  "
                >
                  <div
                    class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
                  >
                    <lucide-icon
                      [img]="sunIcon"
                      class="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                    />
                  </div>
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >Light</span
                  >
                </button>

                <button
                  (click)="setTheme('dark')"
                  [class]="
                    'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ' +
                    (themeService.currentTheme() === 'dark'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500')
                  "
                >
                  <div
                    class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  >
                    <lucide-icon
                      [img]="moonIcon"
                      class="w-5 h-5 text-gray-600 dark:text-gray-300"
                    />
                  </div>
                  <span
                    class="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >Dark</span
                  >
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Settings Sections -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
            System
          </h3>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Notifications</span
              >
              <div class="w-10 h-6 rounded-full bg-blue-600">
                <div
                  class="w-4 h-4 bg-white rounded-full shadow transform translate-x-4 mt-1"
                ></div>
              </div>
            </div>

            <div
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <span class="text-sm text-gray-600 dark:text-gray-400"
                >Auto-save</span
              >
              <div class="w-10 h-6 rounded-full bg-gray-300">
                <div
                  class="w-4 h-4 bg-white rounded-full shadow transform translate-x-1 mt-1"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- About Section -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
            About
          </h3>
          <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              POS System v1.0.0<br />
              Developed by Rao Muhammad Huzaifa
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Settings {
  readonly sunIcon = Sun;
  readonly moonIcon = Moon;
  readonly monitorIcon = Monitor;

  protected themeService = inject(ThemeService);

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
