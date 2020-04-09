import { Matching, MATCHINGS } from '../matching/matching.model';

export class MatchingConfiguration {
    matching: Matching

    constructor() {
        this.matching = MATCHINGS.EUCLIDEAN
    }
}