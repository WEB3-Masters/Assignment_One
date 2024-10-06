import { Card, Color, hasColor } from "./card"; // Assuming isValidPlay checks card validity based on UNO rules
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
};

export const createHand = (players: string[], dealer: number, shuffler: Shuffler<Card>, cardsPerPlayer: number): Hand => {
    const drawPile = createInitialDeck();
    drawPile.shuffle(shuffler);

    // do {
    //     drawPile.shuffle(shuffler);
    //   } while (drawPile.top()?.type === 'WILD' || drawPile.top()?.type === 'WILD DRAW');

    const playerHands: Card[][] = Array.from({ length: players.length }, () => []);
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
    let topCard=drawPile.top()
    const discardPile: Deck=createDeck([]);
    
    if (topCard.type !== 'WILD' && topCard.type !== 'WILD DRAW') {
        console.log('TOP NO WILD ');
        discardPile.addCard(topCard);
    } else {
    do {
        console.log('TOP WILD ');
        drawPile.shuffle(shuffler);
        topCard = drawPile.top();
    } while (topCard?.type === 'WILD' || topCard?.type === 'WILD DRAW');
    }
    drawPile.deal()

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
        unoCalled: Array(players.length).fill(false)
    };
    if(topCard.type === 'REVERSE' ){
        console.log('CREATE REVERSE')
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

    const hand: Hand= {
        canPlay: (index: number) => {
            // state.currentPlayer=1 //heureka

            const playerHand = playerHands[state.currentPlayer];
            const topCard=discardPile.top();
            console.log('Player Hand', state.currentPlayer);

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
            if(hasColor(playerCard) && playerCard.color === (state.newColor)) return true
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
            const card = drawPile.deal();
            if (card) {
                playerHands[state.currentPlayer].push(card);
            }
            checkWinner();
            // Pass the turn to the next player
            state.currentPlayer = (state.currentPlayer + 1) % players.length;
        },
        play: (index: number, chosenColor?: string) => {
            const playerHand = playerHands[state.currentPlayer];
            let direction=1;
            const card = playerHand[index];
            // if (index < 0 || index >= playerHand.length) {
            //     throw new Error("Invalid card index");
            //   }

            if(hand.canPlay(index)) {
                console.log('CAN PLAY');
                if(hasColor(card) && chosenColor){
                    throw new Error("Illegal to name a color on a colored card");
                }
                if((card.type==='WILD' || card.type==='WILD DRAW') && !chosenColor){
                    throw new Error("Illegal _not_ to name a color on a wild card");
                }
    
                if(card.type==='SKIP'){
                    state.currentPlayer+=direction*2
                }
                if(card.type==='REVERSE'){
                    direction*=-1;
                    state.currentPlayer+=direction*1
                    }
                if(card.type==='DRAW'){
                    state.currentPlayer+=direction*2
                    for (let index = 0; index < 2; index++) {
                        hand.draw();
                    }
                }
                if(card.type==='WILD DRAW'){
                    state.currentPlayer+=direction*2
                    for (let index = 0; index < 4; index++) {
                        hand.draw();
                    }
                 }
                if(card.type==='WILD'){
                    console.log('Play with wild');
                    state.newColor=chosenColor;
                    state.currentPlayer+=direction*1
                }
                else{
                    state.currentPlayer+=direction*1
                }
                discardPile.addCard(card); //??
                playerHand.splice(index, 1);
                }
                else{
                    hand.draw();
                }
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