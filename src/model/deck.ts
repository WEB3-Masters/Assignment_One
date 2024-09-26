import * as Card from "./card.ts";

export interface Deck {
    cards: Card.Card[];
    shuffle(shuffler: (cards: Card.Card[]) => void): void;
    deal(): Card.Card | undefined;
    top(): Card.Card|undefined;
    size(): number;
}

//Function to return the deck object with props
export const createInitialDeck = (): Deck => {
    let state = {
        cards: initialiseCards()
    };

    return {
        cards: state.cards,
        shuffle: (shuffler) => {

            shuffler(state.cards);
        },
        deal: () => {
            return state.cards.pop();
        },
        top: () => {
            return state.cards[state.cards.length - 1]
        },
        size: () => {
            return state.cards.length;
        }
    };
}

//Create each of the cards
const initialiseCards = (): Card.Card[] => {

    let cards: Card.Card[] = []

    const top = (): Card.Card => cards[cards.length - 1];
    const size = (): number => cards.length;

    //Create the 4 colors
    for (let color of Card.colors) {
        //Create numbered cards (1x 0, 2x 1 – 9)
        for (let number of Card.numbers) {
            if (number === 0) {
                cards.push({ type: "NUMBERED", color, number, top, size });
            }
            else {
                cards.push({ type: 'NUMBERED', color, number, top, size });
                cards.push({ type: 'NUMBERED', color, number, top, size });
            }
        }
        //Create 2 each of the other colored cards
        for (let type of ["SKIP","REVERSE","DRAW TWO"] as const)
        {
            cards.push({ type, color, top, size })
            cards.push({ type, color, top, size })
        }
    }
    //Create 4x WILD and 4x WILD DRAW FOUR
    for (let i = 0; i <= 3; i++) {
        cards.push({type: "WILD",top,size});
        cards.push({type: "WILD DRAW FOUR", top, size});
    }
    return cards;
} 



