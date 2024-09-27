import {cardNumbers, colors, Card} from "./card";

export interface Deck {
    cards: Card[];
    shuffle(shuffler: (cards: Card[]) => void): void;
    deal(): Card | undefined;
    top(): Card | undefined;
    addCard(card: Card): void;
    size: number;
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
        addCard: (card) => {
        },
        size: state.cards.length
    };
}

//Create each of the cards
const initialiseCards = (): Card[] => {

    let cards: Card[] = []

    const top = (): Card => cards[cards.length - 1];
    const size = (): number => cards.length;

    //Create the 4 colors
    for (let color of colors) {
        //Create numbered cards (1x 0, 2x 1 � 9)
        for (let number of cardNumbers) {
            if (number === 0) {
                cards.push({ type: "NUMBERED", color, number, top, size });
            }
            else {
                cards.push({ type: 'NUMBERED', color, number, top, size });
                cards.push({ type: 'NUMBERED', color, number, top, size });
            }
        }
        //Create 2 each of the other colored cards
        for (let type of ["SKIP", "REVERSE", "DRAW"] as const) {
            cards.push({ type, color, top, size })
            cards.push({ type, color, top, size })
        }
    }
    //Create 4x WILD and 4x WILD DRAW FOUR
    for (let i = 0; i <= 3; i++) {
        cards.push({ type: "WILD", top, size });
        cards.push({ type: "WILD DRAW", top, size });
    }
    return cards;
}




