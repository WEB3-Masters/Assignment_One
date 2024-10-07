import {Card, Color, colors, hasColor} from "./card"; // Assuming isValidPlay checks card validity based on UNO rules
import { Deck, createDeck, createInitialDeck } from "./deck";
import { Shuffler } from "../utils/random_utils";

export interface Hand {
    canPlay: (index: number) => boolean;
    canPlayAny: () => boolean;
    draw: () => void;
    play: (index: number, chosenColor?: string) => Card;
    winner: () => string | undefined;
    score: () => number | undefined;
    onEnd: (callback: (event: { winner: string }) => void) => void;
    hasEnded: () => boolean;
    playerInTurn: () => number | undefined;
    playerHand: (index: number) => Card[];
    drawPile: () => Deck;
    discardPile: () => Deck;
    sayUno: (index: number) => void;
    catchUnoFailure: (params: { accuser: number; accused: number }) => boolean;
    playerCount: number;
    player:(index: number) => string
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
    discardPile: Deck;
    currentPlayer: number;
    newColor: string | undefined;
    unoCalled: boolean[];
    direction: number;
};

export const createHand = (players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Hand => {
    const drawPile = createInitialDeck();
    const discardPile: Deck=createDeck([]);

    const playerHands: Card[][] = Array.from({ length: players.length }, () => []);
    drawPile.shuffle(shuffler);

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
        newColor:undefined,
        unoCalled: Array(players.length).fill(false),
        direction: 1
    };

    // do {
    //     drawPile.shuffle(shuffler);
    //   } while (drawPile.top()?.type === 'WILD' || drawPile.top()?.type === 'WILD DRAW');

    if(players.length < 2 ) {
        throw new Error("At least two players must join the game");
    }

    if(players.length > 10) {
        throw new Error("Maximum allowed number of players is 10");
    }

    for (let i = 0; i < players.length; i++) {
        for (let j = 0; j < cardsPerPlayer; j++) {
            const card = drawPile.deal();
            if (card) {
                playerHands[i].push(card);
            }
        }
    }
    let topCard= drawPile.top()

    if (topCard.type !== 'WILD' && topCard.type !== 'WILD DRAW') {
        discardPile.addCard(topCard);
    } else {
        //TODO: Fix this
        do {
            console.log('TOP WILD ');
            drawPile.shuffle(shuffler);
            topCard = drawPile.top();
        } while (topCard?.type === 'WILD' || topCard?.type === 'WILD DRAW');
    }
    drawPile.deal()

    if(topCard.type === 'REVERSE'){
        if(dealer!==0){
        state.currentPlayer=(dealer - 1) % players.length
        }
        else{
            state.currentPlayer=(players.length-1) % players.length
        }
    }
    if(topCard.type === 'SKIP'){
        console.log('CREATE SKIP')
        state.currentPlayer=(dealer +2) % players.length
    }
    if(topCard.type === 'DRAW'){
        console.log('CREATE DRAW')
        let card = drawPile.deal();
        for (let index = 0; index < 2; index++) {
            card = drawPile.deal();
            if (card) {
                playerHands[state.currentPlayer].push(card);
            }
        }
        state.currentPlayer=(dealer +2) % players.length
        
    }

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

    const reshuffle = () => {
        const topCard = discardPile.deal();
        const discardedCards = discardPile.cards.splice(0);
        drawPile.cards = discardedCards;
        drawPile.shuffle(state.shuffler);
        discardPile.addCard(topCard);
    };

    const hand: Hand= {
        canPlay: (index: number) => {
            // state.currentPlayer=1 //heureka

            const playerHand = playerHands[state.currentPlayer];
            const topCard=discardPile.top();

            if(index<0 || index>playerHand.length-1){
                return false;
            }
            const playerCard=playerHand[index];
            console.log(topCard,' AND ',playerCard);

            // Play with WILD Card
            if (playerCard.type === 'WILD'  ) {
                console.log('WILD');
                return true
            }

            // Play on NUMBERED Card
            if(topCard?.type==='NUMBERED'){
                console.log('NUMBERED')
              if( hasColor(playerCard) && playerCard.color === (hasColor(topCard) &&topCard.color)) return true

              if(playerCard.type === 'NUMBERED' && topCard.type==='NUMBERED' && (playerCard.number===topCard.number)) return true
            }

            // Play on REVERSE Card
            if (topCard?.type === 'REVERSE'  ) {
                console.log('REVERSE')
                let a=discardPile.top()
                if( hasColor(playerCard) && playerCard.color === (hasColor(topCard) && topCard.color)) return true
                if(playerCard.type==='REVERSE') return true;
            }

            // Play on SKIP Card

            if(topCard.type==='SKIP'){
                if( hasColor(playerCard) && playerCard.color === (hasColor(topCard) &&topCard.color)) return true
                if(playerCard.type==='SKIP') return true
            }

            // Play on DRAW Card
            if(topCard.type==='DRAW'){
                console.log('DRAW')

                if((hasColor(playerCard) && playerCard.color === (hasColor(topCard) &&topCard.color)) || playerCard.type==='DRAW') {
                    return true
                }
            }

            // Play on WILD Card
            if(topCard.type==='WILD'){
                let discardPile = hand.discardPile();
                let lastCard=discardPile.top();

            if(hasColor(playerCard) && playerCard.color === (state.newColor))
                return true;

            if(playerCard.type==='WILD DRAW'){

                for (let index = 0; index < playerHand.length; index++) {
                    const cardInArray = playerHand[index];
                    if(hasColor(cardInArray) && cardInArray.color===(lastCard && hasColor(lastCard) && lastCard.color)){
                        return false;
                    }
                }
                return true;
            }
        }
            
        // Play with WILD DRAW Card
        if (playerCard.type === 'WILD DRAW') {
            console.log('Play with WILD DRAW Card');
            for (let index = 0; index < playerHand.length; index++) {
                const card = playerHand[index];

                if(
                playerHand[index].type!=='WILD DRAW' &&
                playerHand[index].type!=='DRAW' && 
                playerHand[index].type!=='SKIP' && 
                playerHand[index].type!=='REVERSE' &&
                playerHand[index].type!=='WILD' &&
                (card.type === 'NUMBERED' && topCard.type==='NUMBERED' && 
                (card.number!==topCard.number))         
                 ){
                    if(hand.canPlay(index)){
                        {
                            return false;
                        }
                    }
                }
                     
               if(hasColor(card)&&card.color===(hasColor(topCard)&&topCard.color)){
                return false;
               }
                }
                return true
            }
          
            return false
        },
        canPlayAny: () => {
            const playerHand = playerHands[state.currentPlayer];
            return playerHand.some((_, index) => hand.canPlay(index));
          },          
        draw: () => {
            if (drawPile.size === 0) {
                reshuffle();
            }

            const card = drawPile.deal();
            if (card) {
                playerHands[state.currentPlayer].push(card);
                const cardIndex = playerHands[state.currentPlayer].length - 1;
                if (!hand.canPlay(cardIndex)) {
                    // Move to next player
                    state.currentPlayer = (state.currentPlayer + state.direction + players.length) % players.length;
                }
                //TODO: Else, player can choose to play or pass
            }
        },
        play: (index: number, chosenColor?: string) => {
            const playerHand = playerHands[state.currentPlayer];
            if (index < 0 || index >= playerHand.length) {
                throw new Error("Invalid card index");
            }
            if (!hand.canPlay(index)) {
                throw new Error("Cannot play this card");
            }

            const card = playerHand[index];

            if(hasColor(card) && chosenColor){
                throw new Error("Illegal to name a color on a colored card");
            }
            if((card.type==='WILD' || card.type==='WILD DRAW') && !chosenColor){
                throw new Error("Illegal _not_ to name a color on a wild card");
            }

            const updatePlayerBy = (numberOfTurns: number) => {
                state.currentPlayer = (state.currentPlayer + numberOfTurns * state.direction + players.length) % players.length;
            }

            switch (card.type) {
                case "SKIP":
                    updatePlayerBy(2);
                    break;
                case "REVERSE":
                    state.direction *= -1;
                    if (players.length === 2) {
                        // In a 2-player game, reverse acts as a skip
                        updatePlayerBy(2);
                    } else {
                        updatePlayerBy(1)
                    }
                    break;
                case "DRAW":
                    const drawNextPlayer = (state.currentPlayer + state.direction + players.length) % players.length;

                    // Give next player 2 cards
                    for (let i = 0; i < 2; i++) {
                        const drawnCard = drawPile.deal();
                        if (drawnCard) {
                            playerHands[drawNextPlayer].push(drawnCard);
                        } else {
                            reshuffle();
                            playerHands[drawNextPlayer].push(drawPile.deal());
                        }
                    }

                    // Skip next player's turn
                    updatePlayerBy(2);
                    break;
                case "WILD DRAW":
                    if (!chosenColor || !colors.includes(chosenColor as Color)) {
                        throw new Error("You must declare a valid color when playing a wild draw card");
                    }

                    state.newColor = chosenColor;
                    const wildDrawNextPlayer = (state.currentPlayer + state.direction + players.length) % players.length;

                    // Give next player 4 cards
                    for (let i = 0; i < 4; i++) {
                        const drawnCard = drawPile.deal();
                        if (drawnCard) {
                            playerHands[wildDrawNextPlayer].push(drawnCard);
                        } else {
                            reshuffle();
                            playerHands[wildDrawNextPlayer].push(drawPile.deal());
                        }
                    }

                    // Skip next player's turn
                    updatePlayerBy(2)
                    break;
                case "WILD":
                    state.newColor = chosenColor;
                    updatePlayerBy(1)
                    break;
                default:
                    updatePlayerBy(1)
                    break;
            }

            discardPile.addCard(card); //??
            playerHand.splice(index, 1);

            return card;
        },
        winner: () => checkWinner(),
        score: () => {
            // let totalScore = 0;
            // for (let i = 0; i < players.length; i++) {
            //     if (playerHands[i].length > 0) {
            //         for (let card of playerHands[i]) {
            //             // Assuming you have a method or property `card.value` that gives the card's point value
            //             totalScore += card.value;
            //         }
            //     }
            // }
            // return totalScore;
            return undefined
        },
        onEnd: (callback) => {
        },
        hasEnded: () => state.phase === "Game-Over",
        playerInTurn: () => state.currentPlayer,
        playerHand: (index: number) => playerHands[index],
        drawPile: () => drawPile,
        discardPile: () => discardPile,
        sayUno: (index: number) => {
            if (playerHands[index].length === 1) {
                state.unoCalled[index] = true;
            }
        },
        catchUnoFailure: ({ accuser, accused }) => {
            
            return false; // Accusation failed
        },
        playerCount: state.players.length,
        player: (index: number) => {
            if (index < 0 || index >= state.players.length) {
                throw new Error("Player index out of bounds");
            }
            return state.players[index];
        },
        dealer
    };

    return hand;
};