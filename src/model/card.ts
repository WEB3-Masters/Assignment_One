export const colors  = ["RED", "BLUE", "YELLOW", "GREEN"] as const;
export type Color = typeof colors[number];

interface NumberedCard extends CardBase{
    type: 'NUMBERED';
    color: Color;
    number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

interface SkipCard extends CardBase{
    type: 'SKIP';
    color: Color;
}

interface ReverseCard extends CardBase{
    type: 'REVERSE';
    color: Color;
}

interface DrawTwoCard extends CardBase{
    type: 'DRAW TWO';
    color: Color;
}

interface WildCard extends CardBase{
    type: 'WILD';
}

interface WildDrawCard extends CardBase{
    type: 'WILD DRAW FOUR';
}

interface BlankCard extends CardBase{
    type: 'BLANK';
}

interface CardBase {
    top: () => Card;
    size: number;
}

export function hasColor(card: Card): card is Extract<Card, { color: Color }> {
    return 'color' in card;
}

export type Card =
    | NumberedCard
    | SkipCard
    | ReverseCard
    | DrawTwoCard
    | WildCard
    | WildDrawCard
    | BlankCard ;

export function isValidPlay(cardToPlay: Card, currentCard: Card): boolean {
    // Check if the current card is a Wild or Wild Draw Four card
    if (currentCard.type === 'WILD' || currentCard.type === 'WILD DRAW FOUR') {
        return true; // Any card can be played on a Wild card
    }

    // Check if the card has the same color or number as the current card
    if (hasColor(cardToPlay) && hasColor(currentCard)) {
        // Ensure that both cards are of type NumberedCard to compare numbers
        if (cardToPlay.type === 'NUMBERED' && currentCard.type === 'NUMBERED') {
            return cardToPlay.color === currentCard.color || cardToPlay.number === currentCard.number;
        } else {
            return cardToPlay.color === currentCard.color; // Compare colors for non-numbered cards
        }
    }

    return false; // If none of the conditions are met, the play is invalid
}
