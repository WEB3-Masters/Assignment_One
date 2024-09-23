import { Hand, createHand } from "./hand.ts";
import { Randomizer, Shuffler, standardRandomizer, standardShuffler } from "../utils/random_utils.ts"
import { Card } from "./card.ts";

export interface Game {
    players: string[]
    playerCount: number
    targetScore: number
    createGame: (props: Partial<Game>) => Game
    currentHand: () => Hand | undefined
    winner: () => string | undefined
    score: (index: number) => number
    player: (index: number) => string
    randomizer?: Randomizer
    shuffler?: Shuffler<Card>
}

export const createGame = (props: Partial<Game> & { shuffler?: Shuffler<Card>, randomizer?: Randomizer }): Game => {
    const defaultPlayers = ['A', 'B']
    const players = props.players || defaultPlayers
    const targetScore = props.targetScore || 500
  
    if (players.length < 2) {
      throw new Error('There must be at least 2 players.')
    }
  
    const scores: number[] = Array(players.length).fill(0)
    let currentHand: Hand | undefined = undefined

    const shuffler = props.shuffler || standardShuffler
    const randomizer = props.randomizer || standardRandomizer
  
    const game: Game = {
      players,
      playerCount: players.length,
      targetScore,
      randomizer,
      shuffler,
  
      createGame(newProps: Partial<Game>) {
        return createGame({ ...props, ...newProps })
      },
  
      currentHand() {
        return currentHand
      },
  
      winner() {
        const winningScoreIndex = scores.findIndex(score => score >= targetScore)
        return winningScoreIndex >= 0 ? players[winningScoreIndex] : undefined
      },
  
      score(index: number) {
        if (index < 0 || index >= scores.length) {
          throw new Error("Player index out of bounds.")
        }
        return scores[index]
      },
  
      player(index: number) {
        if (index < 0 || index >= players.length) {
          throw new Error("Player index out of bounds.")
        }
        return players[index]
      }
    }
  
    const startNewHand = () => {
      const dealer = randomizer(players.length)
      currentHand = createHand(players, dealer, shuffler, 7)
    }
  
    startNewHand()
  
    return game
  }