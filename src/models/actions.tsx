type InitAction = {
    type: 'initialise'
}

type HitAction = {
    type: 'hit_me'
}

type StayAction = {
    type: 'stay'
}

export type GameAction = InitAction | HitAction | StayAction

