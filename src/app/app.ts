import { Component } from '@angular/core';
import { PosLayout } from './components/pos-layout/pos-layout';

@Component({
  selector: 'app-root',
  imports: [PosLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'pos-frontend';
}
