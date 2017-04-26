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

    }

    public config() {

    }

    public routes() {
        this.app.use(express.static('client'));
        this.app.get('/test', this.routeTestHandler);
    }

    /**
     * Handles requests to /test
     */
    private routeTestHandler(req: express.Request, res: express.Response) {
        this.twitter.getLatestTweet('@realDonaldTrump').then((tweet) => {
            res.send(tweet);
        });
    }
}