import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';

@Component({
  selector: 'app-mash-tweets',
  templateUrl: './mash-tweets.component.html',
  styleUrls: ['./mash-tweets.component.css']
})
export class MashTweetsComponent implements OnInit {

    twitter_user1: string;
    twitter_user2: string;
    tweet: string;

    constructor(private http: Http) { }

    ngOnInit() {
    }

    mash(): void {
        // Call the function that takes the two handles and generates the mash
        this.http.get('/api/mash/:'.concat(this.twitter_user1.concat(':'.concat(this.twitter_user2)))).subscribe((response) => {
            this.tweet = response.text();
        });
    }

}
