import { Card} from "./card";

export interface Deck {
    cards: Card[];
    playedCards: Card[];
    shuffle(shuffler: (cards: Card[]) => void): void;
    deal(): Card | undefined;
}

export const createInitialDeck = (): Deck => {
    let state = {
        cards: [],
        playedCards: []
    };

    return {
        cards: state.cards,
        playedCards: state.playedCards,
        shuffle: (shuffler) => {
            shuffler(state.cards);
        },
        deal: () => {
            return state.cards.pop();
        },
        top: () => {
            return state.cards[state.cards.length - 1]; //TODO: check if this is correct
        }
    };
}
