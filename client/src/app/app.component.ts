import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app works!';
  test:string = "";

  constructor(private http: Http) {
  }

  public ngOnInit() {
    this.http.get('/api/test').subscribe((response) => {
      this.test = response.text();
    });
  }
}
