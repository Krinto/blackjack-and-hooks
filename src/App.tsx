import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Card, Deck, Hand, suits, values, Suit, CardValue } from './models/card';
import { map, xprod, head, tail, partition } from 'ramda';
import * as R from 'ramda';
import shuffle from 'lodash.shuffle';

const App: React.FC = () => {
  const [ deck, setDeck ] = useState<Deck>([]);
  const [ discard, setDiscard ] = useState<Card[]>([]);
  const [ house, setHouse ] = useState<Hand>([]);
  const [ player, setPlayer ] = useState<Hand>([]);
  const [ roundLost, setRoundsLost ] = useState(0);
  const [ roundWon, setRoundsWon ] = useState(0);

  const initialiseDeck = (): Deck => shuffle(map(([suit, value]) => ({value, suit}), xprod<Suit, CardValue>(suits, values)));

  const draw = (cards: number, hand: Hand, setHand: React.Dispatch<React.SetStateAction<Card[]>>) => {
    const topCard = head(deck)
    if (topCard !== undefined) {
      setHand([...hand, topCard])
      setDeck(tail(deck))
    }
    else {
      console.error('you fucked up')
    }
  }
  const playerTurn = () => {

  }

  const houseTurn = () => {
    // TODO take turns

    // TODO clean up and draw for next turn
    
    playerTurn()
  }

  const checkScore = (hand: Hand): Number[] => {
    const numericValue = (v: CardValue) => {
      if (v === "ace") {
        throw Error('not so smart are you now, typescript type-system? ╭∩╮(Ο_Ο)╭∩╮') // TODO
      }
      if (v === "jack" || v === "queen" || v === "king") {
        return 10;
      }
      return v;
    }

    const [aces, not] = partition<Card>((c: Card) => c.value === "ace", hand);
    const a = 0;
    const b = R.sum(map((c: Card) => numericValue(c.value))(not))
  }

  const stay = () => {
    houseTurn();
  }

  const hitMe = () => {
    draw(1, player, setPlayer);
    checkScore(player);
    // TODO if bust you lose
  }
  
  useEffect(() => {
    setDeck(initialiseDeck());
    draw(2, house, setHouse);
    draw(2, player, setPlayer);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
