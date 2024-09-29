import { standardShuffler} from "../utils/random_utils";
import { cardNumbers, colors as cardColors, Card, Color, CardNumbers } from "./card";

export interface Deck {
    cards: Card[];
    shuffle(shuffler: (cards: Card[]) => void): void;
    deal(): Card | undefined;
    top(): Card | undefined;
    addCard(card: Card): void;
    readonly size: number;
    readonly colors: readonly string[];
    filter(predicate: (card: Card) => boolean): Deck;
}

export type { Card } ;
export const colors = cardColors;
type SkipCard = Extract<Card, { type: 'SKIP' }>;
type ReverseCard = Extract<Card, { type: 'REVERSE' }>;
type DrawCard = Extract<Card, { type: 'DRAW' }>;
type NumberedCard = Extract<Card, { type: 'NUMBERED' }>;
type WildCard = Extract<Card, { type: 'WILD' }>;
type WildDrawCard = Extract<Card, { type: 'WILD DRAW' }>;

// Function to return the deck object with methods
export const createInitialDeck = (): Deck => {
    return createDeck(initialiseCards());
};

// Common function to create a deck
const createDeck = (cards: Card[]): Deck => {
    let state = { cards };

    return {
        get cards() {
            return state.cards;
        },
        shuffle: (shuffler) => {
            shuffler(state.cards);
        },
        //Deals the card at index[0]
        deal: () => {
            return state.cards.shift();
        },
        //Returns the card at index[0]
        top: () => {
            return state.cards[0];
        },
        //Adds a card to the deck at index[0]
        addCard: (card) => {
            state.cards.unshift(card);
        },
        get size() {
            return state.cards.length;
        },
        colors: cardColors,
        filter: (predicate) => {
            const filteredDeck = state.cards.filter(predicate); // Including a custom filter for the test
            return createDeck(filteredDeck); // Recursively return filtered deck
        },
    };
};

// Function to initialize the deck with cards
const initialiseCards = (): Card[] => {
    let cards: Card[] = [];

    // Loop through colors and create numbered and action cards
    for (let color of cardColors) {
        // Create numbered cards (1x 0, 2x 1-9)
        for (let number of cardNumbers) {
            if (number === 0) {
                cards.push(createCard("NUMBERED",cards, color, number));
            } else {
                cards.push(createCard("NUMBERED",cards, color, number));
                cards.push(createCard("NUMBERED",cards, color, number));
            }
        }

        // Create 2 each of the other colored action cards (SKIP, REVERSE, DRAW)
        for (let type of ["SKIP", "REVERSE", "DRAW"] as const) {
            cards.push(createCard(type,cards, color));
            cards.push(createCard(type,cards, color));
        }
    }

    // Create 4x WILD and 4x WILD DRAW cards
    for (let i = 0; i < 4; i++) {
        cards.push(createCard("WILD",cards));
        cards.push(createCard("WILD DRAW",cards));
    }

    return cards;
};

// Helper function to create a card with `top` and `size` methods

const createCard = (
    type: Card['type'],
    deck: Card[],
    color?: Color,          //Colors from card.ts
    number?: CardNumbers    //CardNumbers from card.ts
): Card => {
    // Handle numbered cards (requires both color and number)
    if (type === 'NUMBERED') {
        if (!color || number === undefined) {
            throw new Error('NUMBERED cards require both color and number.');
        }
        return {
            type: 'NUMBERED',
            color,
            number,
            top: () => deck[0],
            get size() {
                return deck.length;
            },
        } as NumberedCard;
    }

    // Handle skip, reverse, and draw cards (require color but no number)
    if (['SKIP', 'REVERSE', 'DRAW'].includes(type)) {
        if (!color) {
            throw new Error(`${type} cards require a color.`);
        }
        return {
            type,
            color,
            top: () => deck[0],
            get size() {
                return deck.length;
            },
        } as SkipCard | ReverseCard | DrawCard;
    }

    // Handle wild and wild draw cards (no color or number required)
    if (['WILD', 'WILD DRAW'].includes(type)) {
        return {
            type,
            top: () => deck[0],
            get size() {
                return deck.length;
            },
        } as WildCard | WildDrawCard;
    }

    throw new Error(`Invalid card type: ${type}`);
};