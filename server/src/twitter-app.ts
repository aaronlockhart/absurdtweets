import { Twitter } from 'twitter-node-client';
import 'rxjs/add/operator/toPromise';

export class TwitterApp {

    private apiKey = 'oaKzxL5dP8xDL6cxtbm6Tsw70';
    private apiSecret = 'OJqHlO2OKHNV1BSjdSmrBzLJLbwbjeuBvYxTuYbb0JCShKtjDO';
    private accessToken = '230759937-5N5BIc8E2gXmFBYqT1O0tNnrpbuLPEzYt5Sf4nyh';
    private accessSecret = '5UARfOVoRHyOuQzGCfAmGntScDbuV3fWVsFelug19g7dv';
    private twitter;
    
    constructor() {
        this.twitter = new Twitter({consumerKey: this.apiKey, consumerSecret: this.apiSecret,
                                    accessToken: this.accessToken, accessTokenSecret: this.accessSecret,
                                    callbackUrl: '' });
    }
    getLatestTweet(username: string): Promise<string[]> {
        return this.getLatestTweetsByCount(username, '1');
    }

    // We can only retrieve the latest 3200 tweets from the timeline
    getLatestTweetsByCount(username: string, count: string): Promise<string[]> {
        return this.twitter.getUserTimeline({screen_name: username, count: count}, this.error, this.success)
               .toPromise()
               .then(response => response as string[]);
    }

    error(error, response, body): void {
        console.log('ERROR [%s]', error);
    }

    success = (data) => {
        
        let tweets: string[] = new Array();
        let i: number;
        let obj = JSON.parse(data) as [any];

        for(let item of obj) {
            let tweet = this.removeLinks(item.text);
            tweets.push(tweet);
            console.log('Tweet [%s]', tweet);
        }
    }

    // getOnlyTheTweet(data): string {
        
    //     //let obj = JSON.parse(data);
    //     //let item = obj[0];
    //     //let obj1 = JSON.parse(item);
    //     return 
    // }

    removeLinks(tweet: string): string {

        let index = tweet.indexOf('http');

        if(index >= 0) {
             return tweet.substring(0, index);
        }
        return tweet;
    }
}