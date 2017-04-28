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

        let newData: string[] = new Array();

        data.forEach((element) => {

            newData = newData.concat(element.toLowerCase().replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|"));
        });

        this.data = newData;
    }
}