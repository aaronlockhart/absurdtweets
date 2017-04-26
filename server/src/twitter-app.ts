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
    getLatestTweet(username: string): Promise<string> {
        return this.twitter.getUserTimeline({screen_name: username, count: '1'}, this.error, this.success)
               .toPromise()
               .then(response => response as string);
    }

    error(error, response, body): void {
        console.log('ERROR [%s]', error);
    }

    success(data): void {
        console.log('Data [%s]', data);
    }
}