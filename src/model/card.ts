export const colors  = ["RED", "BLUE", "YELLOW", "GREEN"] as const;
export type Color = typeof colors[number];

interface NumberedCard {
    type: 'NUMBERED';
    color: Color;
    number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

interface SkipCard {
    type: 'SKIP';
    color: Color;
}

interface ReverseCard {
    type: 'REVERSE';
    color: Color;
}

interface DrawTwoCard {
    type: 'DRAW TWO';
    color: Color;
}

interface WildCard {
    type: 'WILD';
}

interface WildDrawCard {
    type: 'WILD DRAW FOUR';
}

interface BlankCard {
    type: 'BLANK';
}

export type Card =
    | NumberedCard
    | SkipCard
    | ReverseCard
    | DrawTwoCard
    | WildCard
    | WildDrawCard
    | BlankCard;