import { Card, Color, hasColor, isValidPlay } from "./card.ts"; // Assuming isValidPlay checks card validity based on UNO rules
import { Deck, createInitialDeck } from "./deck.ts";
import { Shuffler } from "../utils/random_utils.ts";

export interface Hand {
    canPlay: (index: number) => boolean;
    canPlayAny: () => boolean;
    draw: () => void;
    play: (index: number, cardIndex: number) => void;
    winner: () => string | undefined;
    score: () => number | undefined;
    onEnd: (callback: (event: { winner: string }) => void) => void;
    hasEnded: () => boolean;
    playerInTurn: () => number | undefined;
    playerHand: (index: number) => Card[];
    drawPile: () => Card[];
    discardPile: () => Card[];
    sayUno: (index: number) => void;
    catchUnoFailure: (params: { accuser: number; accused: number }) => boolean;
    dealer: number;
}

type HandState = {
    phase: "Game-Start" | "In-Play" | "Game-Over";
    players: string[];
    dealer: number;
    shuffler: Shuffler<Card>;
    cards: Card[][];
    currentCard: Card;
    drawPile: Deck;
    discardPile: Card[];
    currentPlayer: number;
    unoCalled: boolean[];
};

export const createHand = (players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Hand => {
    const drawPile = createInitialDeck();
    drawPile.shuffle(shuffler);
    const discardPile: Card[] = [];
    const playerHands: Card[][] = Array.from({ length: players.length }, () => []);

    // Deal cards to players
    for (let i = 0; i < cardsPerPlayer; i++) {
        for (let j = 0; j < players.length; j++) {
            const card = drawPile.deal();
            if (card) {
                playerHands[j].push(card);
            }
        }
    }

    let state: HandState = {
        phase: "Game-Start",
        players,
        dealer,
        shuffler,
        cards: playerHands,
        currentCard: drawPile.deal()!, // The first card to play from the draw pile
        drawPile,
        discardPile,
        currentPlayer: (dealer + 1) % players.length,
        unoCalled: Array(players.length).fill(false)
    };

    const endCallbacks: ((event: { winner: string }) => void)[] = [];

    const checkWinner = () => {
        for (let i = 0; i < players.length; i++) {
            if (playerHands[i].length === 0) {
                const winner = players[i];
                endCallbacks.forEach(callback => callback({ winner }));
                state.phase = "Game-Over";
                return winner;
            }
        }
        return undefined;
    };

    return {
        canPlay: (index: number) => {
            const playerHand = playerHands[index];
            return playerHand.some((card, i) => {
                if (card.type === 'WILD' || card.type === 'WILD DRAW FOUR') {
                    // Wild cards and Wild Draw Four can always be played
                    return true;
                }
                // Add other game logic for determining if a card can be played
                return hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color) || 
                (card.type === 'NUMBERED' && state.currentCard.type === 'NUMBERED' && card.number === state.currentCard.number) ||
                card.type === state.currentCard.type;
            });
        },
        canPlayAny: () => {
            return players.some((_, index) => this.canPlay(index));
        },
        draw: () => {
            const card = drawPile.deal();
            if (card) {
                playerHands[state.currentPlayer].push(card);
            }
            checkWinner();
            // Pass the turn to the next player
            state.currentPlayer = (state.currentPlayer + 1) % players.length;
        },
        play: (index: number, cardIndex: number) => {
            const playerHand = playerHands[index];
            const cardToPlay = playerHand[cardIndex];

            if (isValidPlay(cardToPlay, state.currentCard)) {
                discardPile.push(cardToPlay);
                playerHands[index].splice(cardIndex, 1); // Remove the played card
                state.currentCard = cardToPlay; // Update the current card

                // Check for UNO
                if (playerHands[index].length === 1) {
                    state.unoCalled[index] = true; // Mark UNO called
                }

                // Check for the winner
                const winner = checkWinner();
                if (!winner) {
                    // Pass the turn to the next player
                    state.currentPlayer = (state.currentPlayer + 1) % players.length;
                }
            }
        },
        winner: () => checkWinner(),
        score: () => {
            // Implement score calculation logic
            return undefined; // Placeholder
        },
        onEnd: (callback) => {
            endCallbacks.push(callback);
        },
        hasEnded: () => state.phase === "Game-Over",
        playerInTurn: () => state.currentPlayer,
        playerHand: (index: number) => playerHands[index],
        drawPile: () => drawPile.cards,
        discardPile: () => discardPile,
        sayUno: (index: number) => {
            if (playerHands[index].length === 1) {
                state.unoCalled[index] = true;
            }
        },
        catchUnoFailure: ({ accuser, accused }) => {
            if (state.unoCalled[accused] === false) {
                // Accused player didn't say UNO
                playerHands[accuser].push(...playerHands[accused].splice(0, 2)); // Penalty: Draw two cards
                state.unoCalled[accused] = false; // Reset the UNO call
                return true; // Accusation successful
            }
            return false; // Accusation failed
        },
        dealer
    };
};
