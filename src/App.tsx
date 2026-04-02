import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 70;

const TRACKS = [
  { id: 1, title: 'SYS.AUDIO.01_NEON', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'SYS.AUDIO.02_PULSE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'SYS.AUDIO.03_SYNTH', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

const generateFood = () => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
};

export default function App() {
  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(generateFood());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGamePaused, setIsGamePaused] = useState(false);

  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle Keyboard Input for Snake
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ') {
        setIsGamePaused(p => !p);
        return;
      }

      if (gameOver || isGamePaused) return;

      setDirection(prev => {
        switch (e.key) {
          case 'ArrowUp': return prev.y === 1 ? prev : { x: 0, y: -1 };
          case 'ArrowDown': return prev.y === -1 ? prev : { x: 0, y: 1 };
          case 'ArrowLeft': return prev.x === 1 ? prev : { x: -1, y: 0 };
          case 'ArrowRight': return prev.x === -1 ? prev : { x: 1, y: 0 };
          default: return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isGamePaused]);

  // Game Loop
  useEffect(() => {
    if (gameOver || isGamePaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [direction, food, gameOver, isGamePaused, highScore]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsGamePaused(false);
  };

  // Music Player Controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const skipBack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex]);

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <div className="crt min-h-screen bg-black text-[#00ffff] font-mono flex flex-col items-center justify-center p-4 overflow-hidden relative selection:bg-[#ff00ff] selection:text-black">
      <div className="absolute inset-0 noise-bg z-0"></div>
      
      <header className="mb-8 text-center z-10 screen-tear">
        <h1 className="glitch-text text-2xl md:text-4xl uppercase tracking-tighter" data-text="SYS.SNAKE // AUDIO.PROTOCOL">
          SYS.SNAKE // AUDIO.PROTOCOL
        </h1>
        <p className="text-[#ff00ff] mt-2 text-xs tracking-widest uppercase font-pixel">STATUS: ONLINE // AWAITING_INPUT</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start z-10 w-full max-w-6xl justify-center">
        
        {/* Game Section */}
        <div className="flex-1 flex flex-col items-center w-full max-w-md mx-auto border-4 border-[#00ffff] p-4 bg-black relative shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00ffff] animate-pulse"></div>
          
          {/* Score Header */}
          <div className="flex justify-between w-full mb-4 px-2 font-pixel text-[10px] text-[#ff00ff]">
            <div>MEM_ALLOC: <span className="text-[#00ffff] text-sm">{score}B</span></div>
            <div>PEAK_MEM: <span className="text-[#00ffff] text-sm">{highScore}B</span></div>
          </div>

          {/* Grid */}
          <div 
            className="relative bg-black border-2 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.3)]"
            style={{ width: `${GRID_SIZE * 20}px`, height: `${GRID_SIZE * 20}px` }}
          >
            {/* Grid Lines */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(to right, #00ffff 1px, transparent 1px), linear-gradient(to bottom, #00ffff 1px, transparent 1px)`,
                backgroundSize: `20px 20px`
              }}
            />

            {/* Food */}
            <div
              className="absolute bg-[#ff00ff] shadow-[0_0_15px_#ff00ff]"
              style={{
                width: '20px', height: '20px',
                left: `${food.x * 20}px`, top: `${food.y * 20}px`
              }}
            />

            {/* Snake */}
            {snake.map((segment, index) => {
              const isHead = index === 0;
              return (
                <div
                  key={index}
                  className={`absolute ${isHead ? 'bg-[#ffffff] shadow-[0_0_20px_#00ffff] z-10' : 'bg-[#00ffff]'}`}
                  style={{
                    width: '20px', height: '20px',
                    left: `${segment.x * 20}px`, top: `${segment.y * 20}px`,
                    border: '1px solid #000'
                  }}
                />
              );
            })}

            {/* Overlays */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 border-4 border-[#ff00ff] screen-tear">
                <h2 className="glitch-text text-xl mb-4" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                <p className="text-[#00ffff] font-pixel text-[10px] mb-6">SECTORS_CORRUPTED: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-4 py-3 border-2 border-[#00ffff] text-[#00ffff] font-pixel text-[10px] hover:bg-[#00ffff] hover:text-black transition-none uppercase shadow-[0_0_15px_rgba(0,255,255,0.5)] cursor-pointer"
                >
                  [ REBOOT_SEQUENCE ]
                </button>
              </div>
            )}

            {isGamePaused && !gameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
                <h2 className="text-[#ff00ff] font-pixel text-lg animate-pulse">PROCESS_SUSPENDED</h2>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center text-[#00ffff] font-pixel text-[8px] uppercase tracking-widest opacity-70">
            INPUT: ARROW_KEYS // INTERRUPT: SPACEBAR
          </div>
        </div>

        {/* Audio Section */}
        <div className="flex-1 w-full max-w-md mx-auto border-4 border-[#ff00ff] p-6 bg-black relative shadow-[0_0_30px_rgba(255,0,255,0.2)]">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#ff00ff] animate-pulse"></div>

          <h3 className="font-pixel text-[10px] text-[#00ffff] mb-6 border-b-2 border-[#00ffff] pb-2 flex justify-between">
            <span>AUDIO_SUBSYSTEM_v2.0</span>
            <span className="text-[#ff00ff] animate-pulse">REC</span>
          </h3>
          
          <div className="mb-6 border-2 border-[#00ffff] p-4 relative overflow-hidden bg-[#001111]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
            <h4 className="font-pixel text-[10px] text-[#ff00ff] mb-2 truncate">ACTIVE_STREAM:</h4>
            <p className="text-2xl text-[#00ffff] truncate font-bold uppercase tracking-widest">{currentTrack.title}</p>
            
            <div className="h-8 mt-6 flex gap-1 items-end">
              {/* Visualizer */}
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#00ffff] shadow-[0_0_5px_#00ffff]" 
                  style={{ 
                    height: isPlaying ? `${Math.random() * 100}%` : '10%', 
                    animation: isPlaying ? `glitch-bar ${0.1 + Math.random()*0.3}s infinite steps(2)` : 'none' 
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mb-8 font-pixel text-[10px]">
            <button 
              onClick={skipBack} 
              className="border-2 border-[#00ffff] px-3 py-3 text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-none active:translate-y-1 cursor-pointer"
            >
              [ &lt;&lt; ]
            </button>
            <button 
              onClick={togglePlay} 
              className="border-4 border-[#ff00ff] px-6 py-3 text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black shadow-[0_0_15px_#ff00ff] transition-none active:translate-y-1 cursor-pointer"
            >
              {isPlaying ? '[ SUSPEND ]' : '[ EXECUTE ]'}
            </button>
            <button 
              onClick={skipForward} 
              className="border-2 border-[#00ffff] px-3 py-3 text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-none active:translate-y-1 cursor-pointer"
            >
              [ &gt;&gt; ]
            </button>
            <button 
              onClick={toggleMute} 
              className="border-2 border-[#ff00ff] px-3 py-3 text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black transition-none active:translate-y-1 cursor-pointer"
            >
              {isMuted ? 'MUTE:ON' : 'MUTE:OFF'}
            </button>
          </div>

          <div className="border-t-2 border-[#ff00ff] pt-4">
            <h4 className="font-pixel text-[10px] text-[#ff00ff] mb-3">INDEXED_MODULES:</h4>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <button 
                  key={track.id} 
                  onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }} 
                  className={`w-full text-left px-3 py-2 font-pixel text-[8px] uppercase border cursor-pointer ${idx === currentTrackIndex ? 'bg-[#00ffff] text-black border-[#00ffff]' : 'text-[#00ffff] border-transparent hover:border-[#ff00ff] hover:text-[#ff00ff]'}`}
                >
                  {idx === currentTrackIndex ? '> ' : '  '}{track.title}
                </button>
              ))}
            </div>
          </div>

          <audio 
            ref={audioRef} 
            src={currentTrack.url} 
            onEnded={skipForward}
            loop={false}
          />
        </div>
      </div>
    </div>
  );
}
