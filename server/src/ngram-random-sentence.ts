import { Corpus } from './corpus';
import * as snm from 'simple-ngram-markov'; 

export class NGramRandomSentence {
    private model: any;

    constructor(private corpus: Corpus, options: {length: number, stripPunctuation: boolean}) {
        this.model = snm.createModel(options);
        for (let sentence of this.corpus.data) {
            snm.addSentenceToModel(this.model, sentence);
        }
    }

    public getRandomSentence(desiredLength: number): string {

        let generatedSentence: string = snm.generateSentence(this.model, desiredLength);

        // Find the last punctuation (., ! or ?)
        let lastIndexOfPeriod = generatedSentence.lastIndexOf('.');
        let lastIndexOfExclamation = generatedSentence.lastIndexOf('!');
        let lastIndexOfQuestion = generatedSentence.lastIndexOf('?');

        let lastIndexOfPunctuation = Math.max(lastIndexOfPeriod, lastIndexOfExclamation, lastIndexOfQuestion);

        return generatedSentence.substring(0, lastIndexOfPunctuation+1);
    }
}