import { Card} from "./card";

export interface Deck {
    cards: Card[];
    shuffle(shuffler: (cards: Card[]) => void): void;
    deal(): Card | undefined;
}

export const createInitialDeck = (): Deck => {
    let state = {
        cards: []
    };

    return {
        cards: state.cards,
        shuffle: (shuffler) => {
            shuffler(state.cards);
        },
        deal: () => {
            return state.cards.pop();
        }
    };
}
