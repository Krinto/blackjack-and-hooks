import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import { Card, Deck, Hand, suits, values, Suit, CardValue, GameState } from './models/card';
import { GameAction } from './models/actions';
import * as R from 'ramda';
import shuffle from 'lodash.shuffle';

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
  return [0]
}

const isBust = (hand: Hand): boolean => R.none(x => x <= 21, scores(hand));
const bestScore = (hand: Hand): number => R.reduce<number, number>(R.max, 0, R.reject(x => x > 21, scores(hand)));
// take a card if not bust, not on 21 already and under 17
const shouldHouseHit = (hand: Hand): boolean => !isBust(hand) && bestScore(hand) !== 21 && R.any((s) => s < 17, scores(hand));
const didPlayerWin = (playerHand: Hand, houseHand: Hand):boolean => bestScore(playerHand) > bestScore(houseHand);
const didTie = (playerHand: Hand, houseHand: Hand):boolean => bestScore(playerHand) === bestScore(houseHand);

const App: React.FC = () => {
  const [ gameState, dispatch ] = useReducer<(s: GameState, a: GameAction) => GameState>(reducer, {deck: [], discard: [], house: [], player: []});
  const [ roundsLost, setRoundsLost ] = useState(0);
  const [ roundsWon, setRoundsWon ] = useState(0);
  const [ playersTurn, setPlayersTurn ] = useState(true);

  function reducer(state: GameState, action: GameAction): GameState {
    const initialiseDeck = (): Deck => R.pipe<R.KeyValuePair<Suit, CardValue>[], Deck, Deck>(
      R.map(([suit, value]) => ({value, suit, hidden: false})),
      shuffle
    )(R.xprod<Suit, CardValue>(suits, values));
    
    switch (action.type) {
      case 'discard_and_draw':
      case 'initialise':
        const initialDeck = initialiseDeck();
        const houseInitial = R.take(2, initialDeck);
        houseInitial[0].hidden = true;
        return { ...state, deck: R.drop(4, initialDeck), house: R.take(2, initialDeck), player: R.pipe<Card[], Card[], Card[]>(R.drop(2), R.take(2))(initialDeck) };
      case 'hit_me':
        if (state.deck.length > 0) {
          const card = R.take(1, state.deck);
          return { ...state, deck: R.drop(1, state.deck), player: [...state.player, ...card]};
        }
        else {
          alert('\/\/TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
          return {} as any;
        }
      case 'stay':
        state.house[0].hidden = false;
        for (let i = 0; i < state.deck.length ;i++) {
          const card = R.take(i, state.deck);
          const houseHand = [...state.house, ...card]
          if (!shouldHouseHit(houseHand)) {
            return { ...state, deck: R.drop(i, state.deck), house: houseHand};
          }
        }
        alert('\/\/TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
        return {} as any;
      default:
        throw new Error();
    }
  }
  // TODO check if there are enough cards in the deck to get the number of cards requested
  // TODO shuffle discard back into deck

  useEffect(() => {
    if (gameState.house.length > 0 && gameState.house[0].hidden && isBust(gameState.player)) {
      setRoundsLost(roundsLost + 1);
      dispatch({type: 'discard_and_draw'});
    }
  }, [gameState.player]);

  useEffect(() => {
    if(gameState.house.length > 0 && gameState.house[0].hidden === true) return;
    if (isBust(gameState.house)) {
      setRoundsWon(roundsWon + 1);
      dispatch({type: 'discard_and_draw'});
    }
    else {
      //TODO check who won
      if(didTie(gameState.player, gameState.house)){
        dispatch({type: 'discard_and_draw'});
      }
      else{
        if(didPlayerWin(gameState.player, gameState.house)) {
          setRoundsWon(roundsWon + 1);
          dispatch({type: 'discard_and_draw'});
        }
        else {
          setRoundsLost(roundsLost + 1);
          dispatch({type: 'discard_and_draw'});
        }
      }
    }
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
