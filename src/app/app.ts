import { Component } from '@angular/core';
import { PosLayoutComponent } from './components/pos-layout/pos-layout.component';

@Component({
  selector: 'app-root',
  imports: [PosLayoutComponent],
  template: '<app-pos-layout></app-pos-layout>',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'pos-frontend';
}
