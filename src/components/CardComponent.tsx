import React from 'react';
import { Card } from '../models/card';

export const CardComponent: React.FC<React.PropsWithChildren<{card: Card}>> = ({ card }) => {
    return (
        <div className="card-wrapper"> 
            <div className={"card" + (card.hidden ? " hidden" : "")}>
                {card.hidden ? 
                (<img className="front"/>): 
                (<img className="front" alt={`${card.value}_of_${card.suit}`} src={require(`../assets/images/${card.value}_of_${card.suit}.svg`)} />)}                
                <img className="back" alt="card back" src={require('../assets/images/reverse_card.svg')} />
            </div>
        </div>
    )
}