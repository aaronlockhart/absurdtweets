import { Corpus } from './corpus'
import * as express from "express";
import { TwitterApp } from './twitter-app';

export class Server {
    public app: express.Application;
    private twitter: TwitterApp;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.twitter = new TwitterApp();
        this.config();
        this.routes();
        this.api();
    }

    public api() {
        this.app.get('/api/test', this.apiGetTestHandler);
        this.app.get('/api/corpus', this.apiGetCorpusHandler)
    }

    public config() {

    }

    public routes() {
        this.app.use(express.static('../client/dist'));
        this.app.get('/api/mash/:twitter_handle1:twitter_handle2', (req, res) => this.MashTheTweets )
    }

    /**
     * Handles get requests to /api/test
     */
    public apiGetTestHandler = (req: express.Request, res: express.Response) => {
        this.twitter.getLatestTweetsByCount('@realDonaldTrump', '3').then((tweet) => {
            res.send(tweet);
        });
    }

    public MashTheTweets(req: express.Request, res: express.Response) {
        let twitter_handle1: string = req.param('twitter_handle1');
        let twitter_handle2: string = req.param('twitter_handle2');
        res.send(twitter_handle1.concat(
                ' This will be an awesome mashup of tweets. Someday. Maybe. Lets hope so. '.concat(
                twitter_handle2)));
    }


    /**
     * Handles get /api/corpus requests
     */
    public apiGetCorpusHandler = (req: express.Request, res: express.Response) => {
        this.getCorpus('@realDonalTrump', '@GordonRamsay', 100).then(corpus => res.send(corpus.data));
    }

    private getCorpus(twitterUserOne: string, twitterUserTwo: string, maxTweets?: number): Promise<Corpus> {
        maxTweets = maxTweets || 10;
        return Corpus.create({
                getData: () => {
                    return new Promise<string[]>((resolve, reject) => {
                        Promise.all([
                            this.twitter.getLatestTweetsByCount(twitterUserOne, maxTweets),
                            this.twitter.getLatestTweetsByCount(twitterUserTwo, maxTweets)
                        ]).then(results => {
                            const flattened = [].concat.apply([], results);
                            resolve(flattened);
                        })
                        .catch(reason => reject(reason));
                    });
                }
            });
    }
}