export type GameState = {
    deck: Deck,
    discard: Deck,
    house: Hand,
    player: Hand
}

export type CardValue =  2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "jack" | "queen" | "king" | "ace";
export type Suit = "diamonds" | "hearts" | "spades" | "clubs";

export type Card = {
    value: CardValue,
    suit: Suit
}

export type Deck = Card[];

export type Hand = Card[];

export const suits: Suit[] = ["diamonds", "hearts", "spades", "clubs"]

export const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king", "ace"]