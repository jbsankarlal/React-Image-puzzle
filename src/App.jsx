import React, { useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

const ROWS = 3;
const COLS = 3;

const Glitter = ({ stopFalling }) => {
  const [glitters, setGlitters] = useState([]);

  useEffect(() => {
    if (!stopFalling) {
      const interval = setInterval(() => {
        const newGlitters = [...glitters];
        newGlitters.push({
          id: Date.now(),
          left: Math.random() * window.innerWidth,
          opacity: Math.random(),
          duration: Math.random() * 2 + 1,
        });
        setGlitters(newGlitters);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [glitters, stopFalling]);

  // Stop the glitter falling after 10 seconds
  useEffect(() => {
    if (stopFalling) {
      setTimeout(() => {
        setGlitters([]); // Clear glitters after 10 seconds
      }, 10000);
    }
  }, [stopFalling]);

  return (
    <div className="glitters">
      {glitters.map((glitter) => (
        <div
          key={glitter.id}
          className="glitter"
          style={{
            left: glitter.left,
            opacity: glitter.opacity,
            animationDuration: `${glitter.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const Tile = ({ id, src, index, moveTile }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: 'tile',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveTile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: 'tile',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));
  return (
    <div ref={ref} className="tile" style={{ opacity }}>
      <img src={src} alt={`Tile ${id}`} />
    </div>
  );
};

const App = () => {
  const [tiles, setTiles] = useState([]);
  const [solved, setSolved] = useState(false);
  const [stopFalling, setStopFalling] = useState(false);

  useEffect(() => {
    initializeTiles();
  }, []);

  useEffect(() => {
    if (solved) {
      // Set stopFalling to true after 10 seconds
      const timer = setTimeout(() => {
        setStopFalling(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [solved]);

  const initializeTiles = () => {
    const tempTiles = [];
    for (let i = 1; i <= ROWS * COLS; i++) {
      tempTiles.push(i);
    }
    tempTiles.sort(() => Math.random() - 0.5);
    setTiles(tempTiles);
    setSolved(false);
    setStopFalling(false); // Reset stopFalling state
  };

  const moveTile = (dragIndex, hoverIndex) => {
    const newTiles = [...tiles];
    const draggedTile = newTiles[dragIndex];
    newTiles[dragIndex] = newTiles[hoverIndex];
    newTiles[hoverIndex] = draggedTile;
    setTiles(newTiles);
    checkIfSolved(newTiles);
  };

  const checkIfSolved = (currentTiles) => {
    if (JSON.stringify(currentTiles) === JSON.stringify(Array.from({ length: ROWS * COLS }, (_, i) => i + 1))) {
      setSolved(true);
    }
  };

  return (
    <div className="app">
      <h1>Puzzle Matching Game</h1>
      <div className="board">
        {tiles.map((tile, index) => (
          <Tile key={index} id={tile} src={`src/images/${tile}.jpg`} index={index} moveTile={moveTile} />
        ))}
      </div>
      {solved && (
        <>
          <div className="message">Congratulations! You solved the puzzle!</div>
          <Glitter stopFalling={stopFalling} />
        </>
      )}
      <button onClick={initializeTiles}>Restart</button>
    </div>
  );
};

export default App;
