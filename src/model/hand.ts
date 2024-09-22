import { Card, Color, hasColor, isValidPlay, NumberedCard } from "./card"; // Assuming isValidPlay checks card validity based on UNO rules
import { Deck, createInitialDeck } from "./deck";
import { Shuffler } from "../utils/random_utils";

export interface Hand {
    canPlay: (index: number) => boolean;
    canPlayAny: () => boolean;
    draw: () => void;
    play: (cardNo: number, chosenColor?: string) => void;
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

    const hand= {
        canPlay: (index: number) => {
            const playerHand = playerHands[state.currentPlayer];
            let hasWildDrawFour=false;
            const card=playerHand[index];


            // Play with WILD Card
            if (card.type === 'WILD'  ) return true
           
            // Play on NUMBERED Card
            if(state.currentCard.type==='NUMBERED'){
              if( hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color)) return true

              if(card.type === 'NUMBERED' && state.currentCard.type==='NUMBERED' && (card.number===state.currentCard.number)) return true
            }

            // Play on REVERSE Card
            if (state.currentCard.type === 'REVERSE'  ) {
                if( hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color)) return true
                if(card.type==='REVERSE') return true;
            }

            // Play on SKIP Card
            if(state.currentCard.type==='SKIP'){
                if( hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color)) return true
                if(card.type==='SKIP') return true
            }

            // Play on DRAW Card
            if(state.currentCard.type==='DRAW'){
                if( hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color)) return true
                if(card.type==='DRAW') return true
            }

            // Play on WILD Card
            if(state.currentCard.type==='WILD'){
                let discardPile = hand.discardPile();
                let lastCard=discardPile[discardPile.length-1]
            if(hasColor(card) && card.color === (hasColor(lastCard) && lastCard.color)) return true
            if(card.type==='WILD DRAW'){
                for (let index = 0; index < playerHand.length; index++) {
                    const cardInArray = playerHand[index];
                    if(hasColor(cardInArray) && cardInArray.color===(hasColor(lastCard) && lastCard.color)){
                        return false;
                    }
                    
                }
                return true;
            }
        }
            
        // Play with WILD DRAW Card
        if (card.type === 'WILD DRAW') {
            for (let index = 0; index < playerHand.length; index++) {
                if(
                playerHand[index].type==='DRAW' || 
                playerHand[index].type==='SKIP' || 
                playerHand[index].type==='REVERSE' || 
                playerHand[index].type==='WILD' &&
                hand.canPlay(index)
                ) {
                    return false;
                }

                const card = playerHand[index];
                if( hasColor(card) && card.color === (hasColor(state.currentCard) &&state.currentCard.color)) return false
            
                if (card.type === 'NUMBERED' && state.currentCard.type==='NUMBERED' && (card.number===state.currentCard.number)) {
                    return true;
                }
                
                }
            }
          
            return false
        },
        canPlayAny: () => {
            // return players.some((_, index) => this.canPlay(index));
            return true
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
        play: (cardNo: number, chosenColor?: string) => {
            // const playerHand = playerHands[state.currentPlayer];
            // const card = playerHand[cardNo];
        
            // // Check if the player can play this specific card
            // if (!hand.canPlay(state.currentPlayer)) {
            //     console.log("Player cannot play any card at this moment.");
            //     return;
            // }
        
            // // If the card is a wild card, set the chosen color
            // if (card.type === 'WILD' || card.type === 'WILD DRAW FOUR') {
            //     if (!chosenColor) {
            //         console.log("You must choose a color when playing a wild card.");
            //         return;
            //     }
            //     card.color = chosenColor;  // Set the color for the wild card
            // }
        
            // // Ensure the card can be played according to game rules
            // if (!canPlayCard(card)) {
            //     console.log("This card cannot be played.");
            //     return;
            // }
        
            // // Play the card
            // state.currentCard = card;      // Update the current card in the game state
            // playerHand.splice(cardNo, 1);  // Remove the card from the player's hand
            // console.log(`Player ${state.currentPlayer} played:`, card);
        
            // // Handle additional logic like changing the turn, drawing cards, etc.
            // endTurn();  // Example placeholder for end-turn logic
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
return hand;

};
