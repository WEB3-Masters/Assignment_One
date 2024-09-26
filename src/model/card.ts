export const colors  = ["RED", "BLUE", "YELLOW", "GREEN"] as const;
export type Color = typeof colors[number];
export const cardnumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

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
    size: () => number;
}

export type Card =
    | NumberedCard
    | SkipCard
    | ReverseCard
    | DrawTwoCard
    | WildCard
    | WildDrawCard
    | BlankCard ;