import React, { useEffect, useState } from 'react'
import './RandomQuote.css'
import twitter_icon from '../Assets/twitter.png'
import reload_icon from '../Assets/reload.png'

// Define the type for the quote object
interface Quote {
  text: string;
  author: string;
}

const RandomQuote: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [quote, setQuote] = useState<Quote>({
        text: 'Difficulties increase the nearer we get to the goal.',
        author: 'Johann Wolfgang von Goethe'
    });

    useEffect(() => {
        async function loadQuotes() {
            const response = await fetch('https://type.fit/api/quotes');
            const quotes: Quote[] = await response.json();
            setQuotes(quotes);
        }
        loadQuotes();
    }, []);

    const random = () => {
        if (quotes.length > 0) {
            const index = Math.floor(Math.random() * quotes.length);
            setQuote(quotes[index]);
        }
    }

    const twitter = () => {
        const url = `https://twitter.com/intent/tweet?text="${quote.text}" - ${quote.author.split(",")[0]}`;
        window.open(url, '_blank');
    }

    return (
        <div className='container'>
          <div className="quote">{quote.text}</div>
          <div>
            <div className="line"></div>
            <div className="bottom">
              <div className="author">{quote.author.split(",")[0]}</div>
              <div className="icons">
                <img src={reload_icon} onClick={random} className='reload-icon' alt="Reload" />
                <img src={twitter_icon} onClick={twitter} className="twitter-icon" alt="Twitter" />
              </div>
            </div>
          </div>
        </div>
    )      
}

export default RandomQuote
