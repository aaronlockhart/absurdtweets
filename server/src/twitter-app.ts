import { Twitter } from 'twitter-node-client';
import 'rxjs/add/operator/toPromise';

export class TwitterApp {

    private apiKey = 'oaKzxL5dP8xDL6cxtbm6Tsw70';
    private apiSecret = 'OJqHlO2OKHNV1BSjdSmrBzLJLbwbjeuBvYxTuYbb0JCShKtjDO';
    private accessToken = '230759937-5N5BIc8E2gXmFBYqT1O0tNnrpbuLPEzYt5Sf4nyh';
    private accessSecret = '5UARfOVoRHyOuQzGCfAmGntScDbuV3fWVsFelug19g7dv';
    private twitter;
    private tweetMap: Map<string, Array<string>>;
    private tweetMaxIDMap: Map<string, number>;
    
    constructor() {
        this.twitter = new Twitter({consumerKey: this.apiKey, consumerSecret: this.apiSecret,
                                    accessToken: this.accessToken, accessTokenSecret: this.accessSecret,
                                    callbackUrl: '' });
        this.tweetMap = new Map();
        this.tweetMaxIDMap = new Map();                                    
    }

    updateTweetMap(username: string, tweet: string, tweetID: number): void {

        let tweets: string[];
        let currentMaxID: number;

        if(this.tweetMap.has(username)) {
            tweets = this.tweetMap.get(username);
            tweets.push(tweet);
            this.tweetMap.set(username, tweets);
            currentMaxID = this.tweetMaxIDMap.get(username);
            if(currentMaxID < tweetID) {
                this.tweetMaxIDMap.set(username, tweetID);
            }
        }
        else {
            this.tweetMap.set(username, new Array(tweet));
            this.tweetMaxIDMap.set(username, tweetID);
        }
    }

    getLatestTweet(username: string): Promise<string[]> {
        return this.getLatestTweetsByCount(username, '1');
    }

    verifyUserExists(username: string): Promise<boolean> {
        
        return new Promise<boolean>((resolve, reject) => {
            this.twitter.getUser({screen_name: username},
            (error, response, body) => reject(error),
            (data) => resolve(data)
            )
        });
    }

    // This function will cache the max number of tweets allowed (3200) since the specified ID
    // and also cache them in the map
    // Function returns the current maxID
    cacheTweets(username: string, sinceID: number): number {
        let maxRequests: number = 1500;
        let requestCount: number = 0;
        let moreTweets: Boolean = true;
        let maxID: number = 0;
        let mySinceID: number = 0;
        
        if(sinceID) {
            mySinceID = sinceID;
        }

        do {
            if(maxID > mySinceID) {
                mySinceID = maxID;
            }
            this.twitter.getUserTimeline({screen_name: username, since_id: mySinceID},
            (error, response, body) => {},
            (data) => {
        
                let tweets: string[] = new Array();
                let i: number = 0;
                let obj = JSON.parse(data) as [any];

                for(let item of obj) {
                    let tweet = this.removeUselessThings(item.text);
                    tweets.push(tweet);
                    let tweetID = item.id;
                    if(tweetID > maxID) {
                        maxID = tweetID;
                    }
                    i++;
                }
                if(i == 0) {
                    moreTweets = false;
                }
                else {
                    if(this.tweetMap.has(username)) {
                        let oldTweets: string[] = this.tweetMap.get(username);
                        let newTweets: string[] = oldTweets.concat(tweets);
                        this.tweetMap.set(username, newTweets);
                    }
                    else {
                        this.tweetMap.set(username, tweets);
                    }
                    this.tweetMaxIDMap.set(username, maxID);
                }
                //resolve(tweets);
            });

            requestCount++;
            if(requestCount >= maxRequests) {
                moreTweets = false;
            }

        }while(moreTweets);

        return maxID;
    }


    // We can only retrieve the latest 3200 tweets from the timeline
    getLatestTweetsByCount(username: string, count: string | number): Promise<string[]> {

        return new Promise<string[]>((resolve, reject) => {
            
            this.twitter.getUserTimeline({screen_name: username, count: count},
            (error, response, body) => reject(error),
            (data) => {
        
                let tweets: string[] = new Array();
                let obj = JSON.parse(data) as [any];

                for(let item of obj) {
                    let tweet = this.removeUselessThings(item.text);
                    tweets.push(tweet);
                    //console.log('Tweet [%s]', tweet);
                }
                resolve(tweets);
            })
        });
    }

    removeUselessThings(tweet: string): string {
        let cleanedTweet: string = this.removeStringOccurances(tweet, "@");
        cleanedTweet = this.removeStringOccurances(cleanedTweet, "[\\n\\t]");
        return this.removeStringOccurances(cleanedTweet, "http");   
    }

    removeStringOccurances(tweet: string, pattern: string): string {

        let regex = new RegExp(pattern,'gi');
        let result, indices:number[] = [];
        while ( (result = regex.exec(tweet)) ) {
            indices.push(result.index);
        }

        // Go to each index and find the next index of whitespace
        let indexWS: number = 0;
        let finalTweet: string = '';
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