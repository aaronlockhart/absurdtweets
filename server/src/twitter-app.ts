import * as twitterClient from 'twitter-node-client';
import 'rxjs/add/operator/toPromise';

export class TwitterApp {

    private apiKey = 'oaKzxL5dP8xDL6cxtbm6Tsw70';
    private apiSecret = 'OJqHlO2OKHNV1BSjdSmrBzLJLbwbjeuBvYxTuYbb0JCShKtjDO';
    private accessToken = '230759937-5N5BIc8E2gXmFBYqT1O0tNnrpbuLPEzYt5Sf4nyh';
    private accessSecret = '5UARfOVoRHyOuQzGCfAmGntScDbuV3fWVsFelug19g7dv';
    private twitter;
    
    constructor() {
        this.twitter = new twitterClient.Twitter();    
    }
    getLatestTweet(username: string): Promise<string> {

    }
}