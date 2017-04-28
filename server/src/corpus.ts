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
        let foundPeriod: boolean = false;
        let foundExclamation: boolean = false;
        let foundQuestion: boolean = false;

        data.forEach((element) => {

            newData = newData.concat(element.toLowerCase().replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|"));
        });

        this.data = newData;
    }
}