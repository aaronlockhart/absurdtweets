import { CorpusDataGenerator } from './corpus-data-generator';

export class Corpus {
    public data: string[] = [];

    private constructor() {
    }

    public static create(generator: CorpusDataGenerator): Promise<Corpus> {
        const prom = new Promise<Corpus>((resolve, reject) => {
            const corpus = new Corpus();
            generator.getData()
            .then((data) => {
                    corpus.processRawData(data);
                    resolve(corpus);
            })
            .catch(reason => reject(reason));
        });
        return prom;
    }

    private processRawData = (data: string[]) => {

        let brokenTweetByPeriod: string[] = new Array();
        let brokenTweetByExclamation: string[] = new Array();
        let brokenTweetByQuestion: string[] = new Array();
        let tempSentence: string = '';

        let lowerCase: string = '';
        let newData: string[] = new Array();

        data.forEach((element) => {

            brokenTweetByPeriod = new Array();
            brokenTweetByExclamation = new Array();
            brokenTweetByQuestion = new Array();

            lowerCase = element.toLowerCase();
            brokenTweetByPeriod = lowerCase.split('.');
            
            brokenTweetByPeriod.forEach((item) => {
                tempSentence = item.concat('.');
                brokenTweetByExclamation = brokenTweetByExclamation.concat(tempSentence.split('!'));
            });

            brokenTweetByExclamation.forEach((item) => {
                tempSentence = item.concat('!');
                brokenTweetByQuestion = brokenTweetByQuestion.concat(tempSentence.split('?'));
            });

            brokenTweetByQuestion.forEach((item) => {
                tempSentence = item.concat('?');
                newData = newData.concat(tempSentence);
            });
        });

        this.data = newData;
    }
}