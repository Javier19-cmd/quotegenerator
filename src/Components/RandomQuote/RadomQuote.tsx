import React, { useEffect, useState } from 'react';
import './RandomQuote.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
// Importamos iconos modernos
import { FaTwitter, FaSyncAlt, FaStar, FaHistory, FaQuoteLeft, FaCopy } from 'react-icons/fa';

interface Quote {
    text: string;
    author: string;
}

const RandomQuote: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [quote, setQuote] = useState<Quote>({
        text: 'The only limit to our realization of tomorrow is our doubts of today.',
        author: 'Franklin D. Roosevelt'
    });
    
    // Estados para persistencia
    const [favorites, setFavorites] = useState<Quote[]>(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });
    const [history, setHistory] = useState<Quote[]>(() => {
        const saved = localStorage.getItem('history');
        return saved ? JSON.parse(saved) : [];
    });

    // Estados de UI
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [showFavorites, setShowFavorites] = useState<boolean>(false);
    const [fade, setFade] = useState(false); // Para animación
    const [copied, setCopied] = useState(false); // Feedback de copiado

    useEffect(() => {
        async function loadQuotes() {
            try {
                const response = await fetch('https://type.fit/api/quotes');
                const data: Quote[] = await response.json();
                setQuotes(data);
            } catch (error) {
                console.error("Error fetching quotes", error);
            }
        }
        loadQuotes();
        // Nota: He quitado el intervalo automático de 60s. 
        // En UX de lectura, que el texto cambie solo puede ser molesto. 
        // Es mejor dejar el control al usuario.
    }, []);

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
    }, [history]);

    const random = () => {
        if (quotes.length > 0) {
            // 1. Iniciamos animación de salida
            setFade(true);
            
            setTimeout(() => {
                const index = Math.floor(Math.random() * quotes.length);
                const newQuote = quotes[index];
                setQuote(newQuote);
                
                // Actualizar historial
                setHistory(prev => {
                    // Evitar duplicados consecutivos en historial
                    if(prev.length > 0 && prev[prev.length - 1].text === newQuote.text) return prev;
                    const newHistory = [...prev, newQuote].slice(-50); // Guardar solo los últimos 50
                    return newHistory;
                });

                // 2. Terminamos animación (entrada)
                setFade(false);
                setCopied(false); // Resetear estado de copiado
            }, 300); // Tiempo que dura la transición CSS
        }
    }

    const getAuthor = (author: string) => {
        if (!author) return 'Unknown';
        const authorName = author.split(",")[0];
        return authorName === 'type.fit' ? 'Unknown' : authorName;
    }

    const twitter = () => {
        const url = `https://twitter.com/intent/tweet?text="${quote.text}" - ${getAuthor(quote.author)}`;
        window.open(url, '_blank');
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`"${quote.text}" - ${getAuthor(quote.author)}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const addToFavorites = () => {
        // Evitar duplicados en favoritos
        if (!favorites.some(fav => fav.text === quote.text)) {
            setFavorites(prev => [...prev, quote]);
        }
    }

    return (
        <div className='app-wrapper'>
            <div className='glass-container'>
                
                {/* Icono decorativo de comillas */}
                <div className="quote-icon">
                    <FaQuoteLeft />
                </div>

                {/* Área de texto con animación de opacidad */}
                <div className={`quote-content ${fade ? 'fade-out' : 'fade-in'}`}>
                    <div className="quote-text">"{quote.text}"</div>
                    <div className="line"></div>
                    <div className="quote-author">- {getAuthor(quote.author)}</div>
                </div>

                {/* Barra de Acciones Secundaria */}
                <div className="action-bar">
                    <OverlayTrigger placement="top" overlay={<Tooltip id="copy-tooltip">{copied ? "¡Copiado!" : "Copiar"}</Tooltip>}>
                        <button onClick={copyToClipboard} className={`icon-btn ${copied ? 'copied' : ''}`}>
                            <FaCopy />
                        </button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip id="tweet-tooltip">Twittear</Tooltip>}>
                        <button onClick={twitter} className="icon-btn twitter">
                            <FaTwitter />
                        </button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="top" overlay={<Tooltip id="fav-tooltip">Favoritos</Tooltip>}>
                        <button onClick={addToFavorites} className="icon-btn star">
                            <FaStar />
                        </button>
                    </OverlayTrigger>
                </div>

                {/* Botón Principal (Call to Action) */}
                <div className="main-action">
                    <button className="new-quote-btn" onClick={random}>
                        <FaSyncAlt className={fade ? 'spinning' : ''} /> Nueva Cita
                    </button>
                </div>

                {/* Footer pequeño para Historial y Ver Favoritos */}
                <div className="footer-links">
                    <span onClick={() => setShowHistory(true)}><FaHistory /> Historial</span>
                    <span onClick={() => setShowFavorites(true)}><FaStar /> Ver Favoritos</span>
                </div>
            </div>

            {/* Modals reutilizables */}
            <QuoteModal 
                show={showHistory} 
                onHide={() => setShowHistory(false)} 
                title="Historial Reciente" 
                data={history} 
                getAuthor={getAuthor}
            />
            <QuoteModal 
                show={showFavorites} 
                onHide={() => setShowFavorites(false)} 
                title="Mis Favoritos" 
                data={favorites} 
                getAuthor={getAuthor}
            />
        </div>
    )
}

// Componente auxiliar para no repetir código del Modal
const QuoteModal = ({ show, onHide, title, data, getAuthor }: any) => (
    <Modal show={show} onHide={onHide} centered className="glass-modal">
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {data.length === 0 ? <p className="text-center text-muted">Aún no hay datos aquí.</p> : (
                <ul className="list-unstyled">
                    {data.map((q: Quote, index: number) => (
                        <li key={index} className="mb-3 pb-2 border-bottom">
                            <p className="mb-1 fst-italic">"{q.text}"</p>
                            <small className="text-muted">- {getAuthor(q.author)}</small>
                        </li>
                    ))}
                </ul>
            )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="dark" onClick={onHide}>Cerrar</Button>
        </Modal.Footer>
    </Modal>
);

export default RandomQuote;