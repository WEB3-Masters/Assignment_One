import {Card} from "./card.ts";

export interface Deck {
    cards: Card[];
    shuffle(shuffler: (cards: Card[]) => void): void;
    deal(): Card | undefined;
    createInitialDeck(): Deck;
}

