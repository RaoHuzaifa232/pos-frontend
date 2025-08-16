import { Component, inject } from '@angular/core';
import { PosLayout } from './components/pos-layout/pos-layout';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [PosLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'pos-frontend';
  protected themeService = inject(ThemeService);
}
