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
        return snm.generateSentence(this.model, desiredLength);
    }
}