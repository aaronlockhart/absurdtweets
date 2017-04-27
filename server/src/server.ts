import { Corpus } from './corpus'
import * as express from "express";
import { TwitterApp } from './twitter-app';
import { NGramRandomSentence } from './ngram-random-sentence';

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
        this.app.get('/api/corpus/:twitter_handle1/:twitter_handle2/:max_tweets', this.apiGetCorpusHandler);
        this.app.get('/api/corpus/:twitter_handle1/:twitter_handle2', this.apiGetCorpusHandler);
        this.app.get('/api/mash/:twitter_handle1/:twitter_handle2', this.apiGetMashHandler );
    }

    public config() {

    }

    public routes() {
        this.app.use(express.static('../client/dist'));
    }

    /**
     * Handles get requests to /api/test
     */
    public apiGetTestHandler = (req: express.Request, res: express.Response) => {
        this.twitter.getLatestTweetsByCount('@realDonaldTrump', '3').then((tweet) => {
            res.send(tweet);
        });
    }

    /**
     * Handles get requests to /api/mash
     */
    public apiGetMashHandler = (req: express.Request, res: express.Response) => { 
        let twitter_handle1: string = req.params['twitter_handle1'];
        let twitter_handle2: string = req.params['twitter_handle2'];
        this.getCorpus(twitter_handle1, twitter_handle2, 1000).then(corpus => {
            let sentenceGenerator = new NGramRandomSentence(corpus, { length: 4, stripPunctuation: true});
            res.send(sentenceGenerator.getRandomSentence(50));
        });
    }

    /**
     * Handles get /api/corpus requests
     */
    public apiGetCorpusHandler = (req: express.Request, res: express.Response) => {
        let twitter_handle1: string = req.params['twitter_handle1'];
        let twitter_handle2: string = req.params['twitter_handle2'];
        let max_tweets: number = req.params['max_tweets'];
        this.getCorpus(twitter_handle1, twitter_handle2, max_tweets).then(corpus => res.send(corpus.data));
    }

    private getCorpus(twitterHandle1: string, twitterHandle2: string, maxTweets?: number): Promise<Corpus> {
        maxTweets = maxTweets || 10;
        return Corpus.create({
            getData: () => {
                return new Promise<string[]>((resolve, reject) => {
                    Promise.all([
                        this.twitter.getLatestTweetsByCount(twitterHandle1, maxTweets),
                        this.twitter.getLatestTweetsByCount(twitterHandle2, maxTweets)
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