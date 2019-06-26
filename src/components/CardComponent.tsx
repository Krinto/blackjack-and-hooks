import React from 'react';
import { Card } from '../models/card';

export const CardComponent: React.FC<React.PropsWithChildren<{card: Card}>> = ({ card }) => {
    return <img key={`${card.value}_of_${card.suit}`} className={"card" + (card.hidden ? " hidden" : "")} alt="card" src={require(`../assets/images/${card.value}_of_${card.suit}.svg`)} />
}