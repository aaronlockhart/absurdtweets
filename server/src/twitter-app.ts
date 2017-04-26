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

        return new Promise<string[]>((resolve, reject) => {
            this.twitter.getUserTimeline({screen_name: username, count: count},
            (error, response, body) => reject(error),
            (data) => {
        
                let tweets: string[] = new Array();
                let i: number;
                let obj = JSON.parse(data) as [any];

                for(let item of obj) {
                    let tweet = this.removeUselessThings(item.text);
                    tweets.push(tweet);
                    console.log('Tweet [%s]', tweet);
                }
                resolve(tweets);
            })
        });
    }

    removeUselessThings(tweet: string): string {
        let cleanedTweet: string = this.removeStringOccurances(tweet, "@");
        return this.removeStringOccurances(cleanedTweet, "http");   
    }

    removeStringOccurances(tweet: string, pattern: string): string {
        let finalTweet: string = '';
        let regex = new RegExp(pattern,'gi');
        let result, indices:number[] = [];
        while ( (result = regex.exec(tweet)) ) {
            indices.push(result.index);
        }

        // Go to each index and find the next index of whitespace
        let indexWS: number = 0;
        let stringToRemove: string;
        for (let index of indices)
        {
            finalTweet = finalTweet.concat(tweet.substring(indexWS, index));
            indexWS = tweet.indexOf(' ', index);
        }
        // Was there an orhphaned indexWS left? Lets fix that
        if(indexWS >= 0) {
            finalTweet = finalTweet.concat(tweet.substring(indexWS));
        }

        return finalTweet;
    }
}