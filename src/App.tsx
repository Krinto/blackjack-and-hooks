import React, { useState, useEffect, useReducer } from 'react';
import logo from './logo.svg';
import './App.css';
import { Card, Deck, Hand, suits, values, Suit, CardValue, GameState } from './models/card';
import { GameAction } from './models/actions';
import * as R from 'ramda';
import shuffle from 'lodash.shuffle';

const App: React.FC = () => {
  const [ gameState, dispatch ] = useReducer<(s: GameState, a: GameAction) => GameState>(reducer, {deck: [], discard: [], house: [], player: []});
  const [ roundsLost, setRoundsLost ] = useState(0);
  const [ roundsWon, setRoundsWon ] = useState(0);
  const [ playersTurn, setPlayersTurn ] = useState(true);

  function reducer(state: GameState, action: GameAction): GameState {
    const initialiseDeck = (): Deck => shuffle(R.map<R.KeyValuePair<Suit, CardValue>, Card>(([suit, value]) => ({value, suit, hidden: false}), R.xprod<Suit, CardValue>(suits, values)));
    switch (action.type) {
      case 'initialise':
        const initialDeck = initialiseDeck();
        const houseInitial = R.take(2, initialDeck);
        houseInitial[0].hidden = true;
        return { ...state, deck: R.drop(4, initialDeck), house: R.take(2, initialDeck), player: R.pipe<Card[], Card[], Card[]>(R.drop(2), R.take(2))(initialDeck) };
      case 'hit_me':
        if(state.deck.length > 0) {
          const card = R.take(1, state.deck);
          return { ...state, deck: R.drop(1, state.deck), player: [...state.player, ...card]};
        }
        else {
          alert('\/\/TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
          return {} as any;
        }
      case 'stay':
        if(state.deck.length > 0) {
          const card = R.take(1, state.deck);
          //TODO keep going to 17 or bust
          return { ...state, deck: R.drop(1, state.deck), house: [...state.house, ...card]};
        }
        else {
          alert('\/\/TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
          return {} as any;
        }
      default:
        throw new Error();
    }
  }
  // TODO check if there are enough cards in the deck to get the number of cards requested
  // TODO shuffle discard back into deck

  const scores = (hand: Hand): number[] => {
    const numericValue = (v: CardValue) => {
      if (v === "ace") {
        return [1, 11]
      }
      if (v === "jack" || v === "queen" || v === "king") {
        return [10];
      }
      return [v];
    }
    
    const c = R.head(hand);
    if (c !== undefined) {
      return R.pipe<Hand, Hand, number[], R.KeyValuePair<number, number>[], number[], number[]>(
        R.tail,
        scores,
        R.xprod(numericValue(c.value)),
        R.map(([a, b]) => a + b),
        R.uniq)(hand);
    }
    return []
  }
  
  const isBust = (hand: Hand): boolean => R.none(x => x <= 21, scores(hand));
  const bestScore = (hand: Hand): number => R.reduce<number, number>(R.max, 0, R.reject(x => x > 21, scores(hand)));

  useEffect(() => {
    console.log("player: ");
    console.log(gameState.player);
  }, [gameState.player]);

  useEffect(() => {
    console.log("house: ");
    console.log(gameState.house);
  }, [gameState.house]);

  useEffect(() => {
    dispatch({type: 'initialise' });
  }, []);

  return (
    <div className="App">
      <div className="scores">
        <h1>Player: <span>{roundsWon}</span></h1>
        <h1>Dealer: <span>{roundsLost}</span></h1>
      </div>
      <div className="table">
        <div className="deck">

        </div>
        <div className="dealer-hand">
        {R.map(card => (
            <img key={`${card.value}_of_${card.suit}`} className={"card" + (card.hidden ? " hidden" : "")} alt="card" src={require(`./assets/images/${card.value}_of_${card.suit}.svg`)} />
          ), gameState.house)}
        </div>
        <div className="player-hand">
          {R.map(card => (
            <img key={`${card.value}_of_${card.suit}`} className={"card" + (card.hidden ? " hidden" : "")} alt="card" src={require(`./assets/images/${card.value}_of_${card.suit}.svg`)} />
          ), gameState.player)}
        </div>
      </div>
      <div className="player-buttons">
        <button onClick={() => dispatch({type: 'hit_me'})}>Hit Me</button>
        <button onClick={() => dispatch({type: 'stay'})}>Stay</button>
      </div>
    </div>
  );
}

export default App;
