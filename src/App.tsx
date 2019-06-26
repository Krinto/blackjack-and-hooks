import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import { Card, Deck, Hand, suits, values, Suit, CardValue, GameState } from './models/card';
import { GameAction } from './models/actions';
import { CardComponent } from './components/CardComponent';
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
  return [0];
}

const isBust = (hand: Hand): boolean => R.none(x => x <= 21, scores(hand));
const bestScore = (hand: Hand): number => R.reduce<number, number>(R.max, 0, R.reject(x => x > 21, scores(hand)));
// take a card if not bust, not on 21 already and under 17
const shouldHouseHit = (hand: Hand): boolean => !isBust(hand) && bestScore(hand) !== 21 && R.any((s) => s < 17, scores(hand));
const didPlayerWin = (playerHand: Hand, houseHand: Hand):boolean => bestScore(playerHand) > bestScore(houseHand);
const didTie = (playerHand: Hand, houseHand: Hand):boolean => bestScore(playerHand) === bestScore(houseHand);
const headLens = R.lensIndex(0);
const cardHiddenLens = R.lensProp('hidden');

const App: React.FC = () => {
  const [ gameState, dispatch ] = useReducer<(s: GameState, a: GameAction) => GameState>(reducer, {deck: [], discard: [], house: [], player: []});
  const [ roundsLost, setRoundsLost ] = useState(0);
  const [ roundsWon, setRoundsWon ] = useState(0);

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
          alert('//TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
          return {} as any;
        }
      case 'stay':
        for (let i = 0; i < state.deck.length ;i++) {
          const card = R.take(i, state.deck);
          const houseHand = [...state.house, ...card]
          if (!shouldHouseHit(houseHand)) {
            return { ...state, deck: R.drop(i, state.deck), house: R.map((c: Card) => R.set(cardHiddenLens, false, c) ,houseHand)};
          }
        }
        alert('//TODO: gameover ╭∩╮(Ο_Ο)╭∩╮');
        return {} as any;
      default:
        throw new Error();
    }
  }

  useEffect(() => {
    if (gameState.house.length > 0 && gameState.house[0].hidden && isBust(gameState.player)) {
      setTimeout(() => {
        setRoundsLost(roundsLost + 1);
        dispatch({type: 'discard_and_draw'});
        console.log("Player Bust");
      }, 3000);
    }
  }, [gameState.player]);

  useEffect(() => {
    if (gameState.house.length > 0 && gameState.house[0].hidden === true) return;
    setTimeout(() => {
      if (isBust(gameState.house)) {
        setRoundsWon(roundsWon + 1);
        dispatch({type: 'discard_and_draw'});
        console.log("House Bust");
      }
      else {
        if (didTie(gameState.player, gameState.house)){
          dispatch({type: 'discard_and_draw'});
          console.log("Tie");
        }
        else{
          if (didPlayerWin(gameState.player, gameState.house)) {
            setRoundsWon(roundsWon + 1);
            dispatch({type: 'discard_and_draw'});
            console.log("Player Wins");
          }
          else {
            setRoundsLost(roundsLost + 1);
            dispatch({type: 'discard_and_draw'});
            console.log("Player Lost");
          }
        }
      }
    }, 3000);
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
          {R.map((card) => <CardComponent card={card} key={`${card.value}_of_${card.suit}`} />, gameState.house)}
        </div>
        <div className="player-hand">
          {R.map(card => <CardComponent card={card} key={`${card.value}_of_${card.suit}`} />, gameState.player)}
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
