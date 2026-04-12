import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

declare const BACKEND_URL: string;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  backendMessage = signal<string>('Loading...');

  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<{ message: string }>(`${BACKEND_URL}/`).subscribe({
      next: (res) => this.backendMessage.set(res.message),
      error: () => this.backendMessage.set('Failed to reach backend')
    });
  }
}
