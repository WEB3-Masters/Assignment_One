import {Hand} from "./hand.ts";

export interface Game {
    players: string[]
    playerCount: number
    targetScore: number
    createGame: (props: Partial<Game>) => Game
    currentHand: () => Hand | undefined
}