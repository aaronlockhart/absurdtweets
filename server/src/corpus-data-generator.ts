export interface CorpusDataGenerator {
    getData(): Promise<string[]>;
}