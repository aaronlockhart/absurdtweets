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
    tweet: string = '';
    error: string = '';
    title = 'Mash them tweets!';

    constructor(private http: Http) { }

    ngOnInit() {
    }

    mash(): void {

        let user1: string = this.twitter_user1;
        let user2: string = this.twitter_user2;

        let atIndex: number = this.twitter_user1.indexOf('@');
        if(atIndex >= 0) {
          user1 = this.twitter_user1.replace('@', '');
        }

        atIndex = this.twitter_user2.indexOf('@');
        if(atIndex >= 0) {
          user2 = this.twitter_user2.replace('@', '');
        }

        // Call the verify function to check if handles exist
        this.http.get('/api/verify/'.concat(user1)).subscribe((response) => {
            this.error = response.text();
        });
        this.http.get('/api/verify/'.concat(user2)).subscribe((response) => {
            this.error = this.error.concat(response.text());
        });

        // Call the function that takes the two handles and generates the mash
        this.http.get('/api/mash/'.concat(user1.concat('/'.concat(user2)))).subscribe((response) => {
            this.tweet = response.text();
        });
    }

}
