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
        let finalSentence: string = '';
        // Find the last punctuation (., ! or ?)
        let lastIndexOfPeriod = generatedSentence.lastIndexOf('.');
        let lastIndexOfExclamation = generatedSentence.lastIndexOf('!');
        let lastIndexOfQuestion = generatedSentence.lastIndexOf('?');

        let lastIndexOfPunctuation = Math.max(lastIndexOfPeriod, lastIndexOfExclamation, lastIndexOfQuestion);

        //return generatedSentence.substring(0, lastIndexOfPunctuation+1);
        generatedSentence = generatedSentence.substring(0, lastIndexOfPunctuation+1);

        // Now capitalize every sentence
        let indexOfPunctuation: number = 0;
        let tempSubStr: string = '';
        let isFirstSentence: boolean = true;
        let charAtIndex: number = 0;
        let tempFinalSentence: string = '';
        // Before we start, lets save the final sentence to be the generated sentence, in case there is no punctuation found
        finalSentence = generatedSentence;

        while(true) {
            indexOfPunctuation = generatedSentence.search('[.!?]');
            if(indexOfPunctuation == -1) {
                break;
            }
            tempSubStr = generatedSentence.substring(0, indexOfPunctuation+1);

            if(isFirstSentence) {
                charAtIndex = 0;
                isFirstSentence = false;
            }
            else {
                charAtIndex = 1;
            }

            let firstChar = tempSubStr.substring(0,charAtIndex+1);
            firstChar = firstChar.toUpperCase();
            tempSubStr = firstChar.concat(tempSubStr.substring(charAtIndex+1));
            tempFinalSentence = tempFinalSentence.concat(tempSubStr);
            generatedSentence = generatedSentence.substring(indexOfPunctuation+1);
        }

        if(tempFinalSentence != '') {
            finalSentence = tempFinalSentence;
        }

        return finalSentence;
    }
}