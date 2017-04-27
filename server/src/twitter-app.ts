import { Twitter } from 'twitter-node-client';
import 'rxjs/add/operator/toPromise';

export interface Tweets {
    screen_name: string;
    text: string[];
    max_id: number;
}

export class TwitterApp {

    private apiKey = 'oaKzxL5dP8xDL6cxtbm6Tsw70';
    private apiSecret = 'OJqHlO2OKHNV1BSjdSmrBzLJLbwbjeuBvYxTuYbb0JCShKtjDO';
    private accessToken = '230759937-5N5BIc8E2gXmFBYqT1O0tNnrpbuLPEzYt5Sf4nyh';
    private accessSecret = '5UARfOVoRHyOuQzGCfAmGntScDbuV3fWVsFelug19g7dv';
    private twitter;
    private tweetMap: Map<string, Array<string>>;
    private tweetMaxIDMap: Map<string, number>;
    static readonly maxTweetsPerTimelineRequest = 200;
    
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

    public getLatestTweet(username: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.getLatestTweetsByCount(username, '1')
            .then((tweets) => resolve(tweets.text))
            .catch(reason => reject(reason));
        });
    }

    /**
     * Gets a given number of tweets for a specific user
     * @param username The username to retrieve tweets for.
     * @param count The total number of tweets to retrieve.
     */
    public getTweets(username: string, count: number): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let results: string[] = [];
            let remaining = count; 
            let nextCount = remaining >= TwitterApp.maxTweetsPerTimelineRequest ? TwitterApp.maxTweetsPerTimelineRequest : remaining; 
            let lastPromise: Promise<Tweets> = this.getLatestTweetsByCount(username, nextCount);
            remaining -= nextCount;

            while (remaining > 0)
            {
                nextCount = remaining >= TwitterApp.maxTweetsPerTimelineRequest ? TwitterApp.maxTweetsPerTimelineRequest : remaining; 

                lastPromise.then(tweets => {
                    results = results.concat(tweets.text);
                    lastPromise = this.getLatestTweetsByCount(username, nextCount, tweets.max_id);
                })
                .catch(reason => reject(reason));

                remaining -= nextCount;
            }

            lastPromise.then(tweets => {
                results = results.concat(tweets.text);
                resolve(results);
            })
            .catch(reason => reject(reason));
        });
    }

    public verifyUserExists(username: string): Promise<boolean> {
        
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
    getLatestTweetsByCount(username: string, count: string | number, maxId?: number): Promise<Tweets> {
        
        return new Promise<Tweets>((resolve, reject) => {

            this.twitter.getUserTimeline({screen_name: username, count: count, max_id: maxId},
            (error, response, body) => reject(error),
            (data) => {
        
                let tweets: string[] = new Array();
                let obj = JSON.parse(data) as [{id: number, text: string}];
                let max_id = 0;
                for(let item of obj) {
                    if (item.id > max_id) {
                        max_id = item.id;
                    }

                    let tweet = this.removeUselessThings(item.text);
                    tweets.push(tweet);
                    //console.log('Tweet [%s]', tweet);
                }
                resolve({screen_name: username, max_id: max_id, text: tweets});
            })
        });
    }

    private removeUselessThings(tweet: string): string {
        let cleanedTweet: string = this.removeStringOccurances(tweet, "@");
        cleanedTweet = this.removeStringOccurances(cleanedTweet, "[\\n\\t]");
        return this.removeStringOccurances(cleanedTweet, "http");   
    }

    private removeStringOccurances(tweet: string, pattern: string): string {

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