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
        this.app.get('/api/tweets/:twitter_handle/:count', this.apiGetTweetsHandler);
        this.app.get('/api/verify/:twitter_handle', this.apiGetVerifyHandler );
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
        this.twitter.getTweets('@realDonaldTrump', 3).then((tweet) => {
            res.send(tweet);
        });
    }

    public apiGetTweetsHandler = (req: express.Request, res: express.Response) => {
        let user = req.params['twitter_handle'];
        let count = req.params['count'];
        this.twitter.getTweets(user, count)
        .then(tweets => res.send(tweets));
    }
    /**
     * Handles get requests to /api/verify
     */

    apiGetVerifyHandler = (req: express.Request, res: express.Response) => { 
        let twitter_handle: string = '@'.concat(req.params['twitter_handle']);

        let promise = this.twitter.verifyUserExists(twitter_handle);
        promise.then((data) => {
            res.send('');
        })
        promise.catch((error) => {
            res.send(twitter_handle.concat(' does not exist'));
        });
    }

    /**
     * Handles get requests to /api/mash
     */
    public apiGetMashHandler = (req: express.Request, res: express.Response) => { 
        let twitter_handle1: string = '@'.concat(req.params['twitter_handle1']);
        let twitter_handle2: string = '@'.concat(req.params['twitter_handle2']);

        this.getCorpus(twitter_handle1, twitter_handle2, 1000).then(corpus => {
            let sentenceGenerator = new NGramRandomSentence(corpus, { length: 4, stripPunctuation: true});
            res.send(sentenceGenerator.getRandomSentence(50));
        });
    }

    /**
     * Handles get /api/corpus requests
     */
    public apiGetCorpusHandler = (req: express.Request, res: express.Response) => {
        let twitter_handle1: string = '@'.concat(req.params['twitter_handle1']);
        let twitter_handle2: string = '@'.concat(req.params['twitter_handle2']);
        let max_tweets: number = req.params['max_tweets'];
        this.getCorpus(twitter_handle1, twitter_handle2, max_tweets).then(corpus => res.send(corpus.data));
    }

    private getCorpus(twitterHandle1: string, twitterHandle2: string, maxTweets?: number): Promise<Corpus> {
        maxTweets = maxTweets || 10;
        return Corpus.create({
            getData: () => {
                return new Promise<string[]>((resolve, reject) => {
                    Promise.all([
                        this.twitter.getTweets(twitterHandle1, maxTweets),
                        this.twitter.getTweets(twitterHandle2, maxTweets)
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