import React, { useEffect, useState } from 'react'
import './RandomQuote.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Modal, Button } from 'react-bootstrap'
import twitter_icon from '../Assets/twitter.png'
import reload_icon from '../Assets/reload.png'
import star_icon from '../Assets/star.png'
import history_icon from '../Assets/history.png'
import history_fav_icon from '../Assets/history_fav.png'

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
    const [favorites, setFavorites] = useState<Quote[]>(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [history, setHistory] = useState<Quote[]>(() => {
        const saved = localStorage.getItem('history');
        return saved ? JSON.parse(saved) : [];
    });
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [showFavorites, setShowFavorites] = useState<boolean>(false);

    useEffect(() => {
      async function loadQuotes() {
          const response = await fetch('https://type.fit/api/quotes');
          const quotes: Quote[] = await response.json();
          setQuotes(quotes);
      }
      loadQuotes();
  
      const intervalId = setInterval(loadQuotes, 60000); // Carga citas adicionales cada minuto
      return () => clearInterval(intervalId); // Limpia el intervalo cuando el componente se desmonta
  }, []);
  

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
    }, [history]);

    const random = () => {
        if (quotes.length > 0) {
            const index = Math.floor(Math.random() * quotes.length);
            const newQuote = quotes[index];
            setQuote(newQuote);
            setHistory(prevHistory => {
                const updatedHistory = [...prevHistory, newQuote];
                localStorage.setItem('history', JSON.stringify(updatedHistory));
                return updatedHistory;
            });
        }
    }

    const twitter = () => {
        const url = `https://twitter.com/intent/tweet?text="${quote.text}" - ${quote.author.split(",")[0]}`;
        window.open(url, '_blank');
    }

    const addToFavorites = () => {
        setFavorites(prevFavorites => {
            const updatedFavorites = [...prevFavorites, quote];
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            return updatedFavorites;
        });
    }

    const toggleHistoryModal = () => {
        setShowHistory(!showHistory);
    }

    const toggleFavoritesModal = () => {
        setShowFavorites(!showFavorites);
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
                        <img src={star_icon} onClick={addToFavorites} className="social-icon" alt="Favorite" />
                        <img src={history_icon} className="social-icon" alt="History" onClick={toggleHistoryModal} />
                        <img src={history_fav_icon} className="social-icon" alt="Favorites" onClick={toggleFavoritesModal} />
                    </div>
                </div>
            </div>

            <Modal show={showHistory} onHide={toggleHistoryModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Historial de citas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        {history.map((q, index) => (
                            <li key={index}>"{q.text}" - {q.author.split(",")[0]}</li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleHistoryModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showFavorites} onHide={toggleFavoritesModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Lista de favoritos</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        {favorites.map((q, index) => (
                            <li key={index}>"{q.text}" - {q.author.split(",")[0]}</li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleFavoritesModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default RandomQuote
