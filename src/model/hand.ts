import { Card, Color } from "./card";
import { Shuffler } from "../utils/random_utils";
import { createInitialDeck } from "./deck";

export interface Hand {
    canPlay: (index: number) => boolean;
    canPlayAny: () => boolean;
    draw: () => void;
    play: (index: number, color?: Color) => void;
    winner: () => string | undefined;
    score: () => number | undefined;
    onEnd: (callback: (event: { winner: string }) => void) => void;
    hasEnded: () => boolean;
    playerInTurn: () => number | undefined;
    playerHand: (index: number) => Card[];
    drawPile: () => Card[];
    discardPile: () => Card[];
    sayUno: (index: number) => void;
    catchUnoFailure: (params: { accuser: number, accused: number }) => boolean;
    dealer: number;
}
type WaitingState = {
    phase: string;
    players: string[];
    dealer: number;
    card: Card;
    playerHands: Card[][];
    drawPile: Card[];
    discardPile: Card[];
    unoStatus: Set<number>;
};

type InPlayState = {
    phase: string;
    players: string[];
    dealer: number;
    card: Card;
    playerHands: Card[][];
    drawPile: Card[];
    discardPile: Card[];
    currentPlayer: number;
    unoStatus: Set<number>;
};

type GameOverState = {
    phase: string;
    players: string[];
    dealer: number;
    card: Card;
    playerHands: Card[][];
    drawPile: Card[];
    discardPile: Card[];
    winner: number;
};

type HandState = WaitingState | InPlayState | GameOverState;

export const createHand = (players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Hand => {
    let currentState: HandState = {
        phase,
        players,
        dealer,
        card: {} as Card,
        playerHands: [],
        drawPile: [],
        discardPile: [],
        unoStatus: new Set()
    };

    const initializeDeck = () => {
        const deck = createInitialDeck();
        shuffler(deck.cards);
        return deck.cards;
    };

    const dealCards = (deck: Card[]) => {
        const hands = players.map(() => deck.splice(0, cardsPerPlayer));
        currentState.playerHands = hands;
    };

    const startHand = () => {
        const deck = initializeDeck();
        dealCards(deck);
        currentState.drawPile = deck;
        currentState.discardPile = [currentState.drawPile.pop()!];
        currentState.phase = "in-play";
        currentState.currentPlayer = dealer;
    };

    const endHand = (winner: number) => {
        currentState.phase = "game-over";
        (currentState as GameOverState).winner = winner;
        // Notify listeners
    };

    return {
        canPlay: (index: number) => {
            if (currentState.phase !== "in-play") return false;
            const playerHand = currentState.playerHands[index];
            return playerHand.some(card => 
                card.color === currentState.card.color || card.type === state.card.type
            );
        },
        canPlayAny: () => {
            if (currentState.phase !== "in-play") return false;
            return currentState.playerHands[currentState.currentPlayer].some(card => 
                card.color === currentState.card.color || card.type === currentState.card.type
            );
        },
        draw: () => {
            if (currentState.phase !== "in-play") return;
            const card = currentState.drawPile.pop();
            if (card) {
                currentState.playerHands[currentState.currentPlayer].push(card);
            }
            if (currentState.drawPile.length === 0) {
            }
        },
        play: (index: number, color?: Color) => {
            if (currentState.phase !== "in-play" || currentState.currentPlayer !== index) return;
            const card = currentState.playerHands[index].find(c => 
                color ? c.color === color : c.color === currentState.card.color || c.type === currentState.card.type
            );
            if (card) {
                currentState.playerHands[index] = currentState.playerHands[index].filter(c => c !== card);
                currentState.discardPile.push(card);
                currentState.card = card;
                if (currentState.playerHands[index].length === 0) {
                    endHand(index);
                }
            }
        },
        winner: () => {
            if (currentState.phase === "game-over") {
                return (currentState as GameOverState).players[(currentState as GameOverState).winner];
            }
            return undefined;
        },
        score: () => {
            if (currentState.phase === "game-over") {
                return currentState.playerHands.flat().reduce((acc, card) => acc + card.number, 0);
            }
            return undefined;
        },
        onEnd: (callback: (event: { winner: string }) => void) => {
        },
        hasEnded: () => currentState.phase === "game-over",
        playerInTurn: () => currentState.phase === "in-play" ? currentState.currentPlayer : undefined,
        playerHand: (index: number) => currentState.playerHands[index],
        drawPile: () => currentState.drawPile,
        discardPile: () => currentState.discardPile,
        sayUno: (index: number) => {
            if (currentState.phase === "in-play") {
                currentState.unoStatus.add(index);
            }
        },
        catchUnoFailure: ({ accuser, accused }) => {
            if (currentState.unoStatus.has(accused)) {
                return false; 
            }
            currentState.playerHands[accused].push(...currentState.drawPile.splice(0, 2));
            return true; 
        },
        dealer: dealer
    };
};