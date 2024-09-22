import { Card } from "../../src/model/card"
import { Deck } from "../../src/model/deck"
import * as hand from '../../src/model/hand'
import { Shuffler, standardShuffler } from "../../src/utils/random_utils"
import * as uno from '../../src/model/uno'

export function createInitialDeck(): Deck {
  return createInitialDeck()
}

export type HandProps = {
  players: string[]
  dealer: number
  shuffler?: Shuffler<Card>
  cardsPerPlayer?: number
}

export function createHand({
    players, 
    dealer, 
    shuffler = standardShuffler,
    cardsPerPlayer = 7
  }: HandProps): hand.Hand {
  return hand.createHand(players, dealer, shuffler, cardsPerPlayer)
}

export function createGame(props: Partial<uno.Game>): uno.Game {
  return uno.createGame(props)
}