import { Randomizer, Shuffler, standardShuffler } from '../../src/utils/random_utils'
import * as deck from '../../src/model/deck'
import * as hand from '../../src/model/hand'
import * as uno from '../../src/model/uno'
import {Card} from "../../src/model/card";

export function createInitialDeck(): deck.Deck {
    return deck.createInitialDeck()
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
