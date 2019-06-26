type InitAction = {
    type: 'initialise'
}

type HitAction = {
    type: 'hit_me'
}

type StayAction = {
    type: 'stay'
}

type DiscardDrawAction = {
    type: 'discard_and_draw'
}

export type GameAction = InitAction | HitAction | StayAction | DiscardDrawAction

