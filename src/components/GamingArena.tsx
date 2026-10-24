import { useState, useEffect, useRef } from "react";
import {
  Gamepad2,
  Trophy,
  Swords,
  RotateCcw,
  Bot,
  User,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { gameAudio } from "../utils/gameAudio";
import { UserProfile } from "../types";

// Types
type ActiveGame = "chess" | "connect4" | "tictactoe";
type GameMode = "bot" | "local";
type BotDifficulty = "easy" | "medium" | "hard";

interface MatchRecord {
  id: string;
  game: ActiveGame;
  opponent: string;
  result: "win" | "loss" | "draw";
  ratingChange: number;
  timestamp: string;
}

// ==========================================
// 1. TIC-TAC-TOE ENGINE & COMPONENT
// ==========================================
function TicTacToeGame({
  language,
  onGameOver,
}: {
  language: "ar" | "en";
  onGameOver: (result: "win" | "loss" | "draw") => void;
}) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // Player is X (Cyan), Bot/P2 is O (Amber)
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("bot");
  const [difficulty, setDifficulty] = useState<BotDifficulty>("medium");
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });

  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (squares: (string | null)[]) => {
    for (const combo of winningCombos) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: combo };
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return { winner: "draw", line: null };
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    gameAudio.playMove();

    const res = checkWinner(newBoard);
    if (res) {
      finalizeGame(res.winner, res.line);
      return;
    }

    if (gameMode === "bot" && isXNext) {
      setIsXNext(false);
      // Trigger Bot move after short natural delay
      setTimeout(() => {
        makeBotMove(newBoard);
      }, 400);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const makeBotMove = (currentBoard: (string | null)[]) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((v): v is number => v !== null);

    if (emptyIndices.length === 0) return;

    let targetIdx = emptyIndices[0];

    if (difficulty === "easy") {
      targetIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    } else {
      // Check if Bot ("O") can win now
      for (const idx of emptyIndices) {
        const copy = [...currentBoard];
        copy[idx] = "O";
        if (checkWinner(copy)?.winner === "O") {
          targetIdx = idx;
          break;
        }
      }

      // Block player ("X") win
      if (targetIdx === emptyIndices[0]) {
        for (const idx of emptyIndices) {
          const copy = [...currentBoard];
          copy[idx] = "X";
          if (checkWinner(copy)?.winner === "X") {
            targetIdx = idx;
            break;
          }
        }
      }

      // Hard mode: take center
      if (difficulty === "hard" && currentBoard[4] === null) {
        targetIdx = 4;
      }
    }

    const botBoard = [...currentBoard];
    botBoard[targetIdx] = "O";
    setBoard(botBoard);
    gameAudio.playMove();

    const botRes = checkWinner(botBoard);
    if (botRes) {
      finalizeGame(botRes.winner, botRes.line);
    } else {
      setIsXNext(true);
    }
  };

  const finalizeGame = (resWinner: string, line: number[] | null) => {
    setWinner(resWinner);
    setWinningLine(line);

    if (resWinner === "X") {
      gameAudio.playVictory();
      setStats((s) => ({ ...s, wins: s.wins + 1 }));
      onGameOver("win");
    } else if (resWinner === "O") {
      gameAudio.playDefeat();
      setStats((s) => ({ ...s, losses: s.losses + 1 }));
      onGameOver("loss");
    } else {
      gameAudio.playMove();
      setStats((s) => ({ ...s, draws: s.draws + 1 }));
      onGameOver("draw");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  const isAr = language === "ar";

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto w-full">
      {/* Game Header Controls */}
      <div className="flex items-center justify-between w-full bg-black/40 border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setGameMode("bot");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === "bot"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>VS Bot</span>
          </button>
          <button
            onClick={() => {
              setGameMode("local");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === "local"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-white/40 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>2P Local</span>
          </button>
        </div>

        {gameMode === "bot" && (
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value as BotDifficulty);
              resetGame();
            }}
            className="bg-[#101420] border border-white/10 rounded-xl px-2.5 py-1 text-[10px] font-mono text-cyan-300 focus:outline-none"
          >
            <option value="easy">{isAr ? "مبتدئ" : "Easy"}</option>
            <option value="medium">{isAr ? "متوسط" : "Medium"}</option>
            <option value="hard">{isAr ? "محترف لا يقهر" : "Invincible"}</option>
          </select>
        )}

        <button
          onClick={resetGame}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
          title="Reset Game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Score Tracker */}
      <div className="grid grid-cols-3 gap-3 w-full text-center">
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-2xl">
          <span className="text-[9px] font-mono uppercase text-cyan-400 block font-bold">
            {isAr ? "أنت (X)" : "You (X)"}
          </span>
          <span className="text-xl font-black text-cyan-300">{stats.wins}</span>
        </div>
        <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl">
          <span className="text-[9px] font-mono uppercase text-white/40 block font-bold">
            {isAr ? "تعادل" : "Ties"}
          </span>
          <span className="text-xl font-black text-white/80">{stats.draws}</span>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-2xl">
          <span className="text-[9px] font-mono uppercase text-amber-400 block font-bold">
            {gameMode === "bot" ? (isAr ? "الروبوت (O)" : "Bot (O)") : (isAr ? "الخصم (O)" : "P2 (O)")}
          </span>
          <span className="text-xl font-black text-amber-300">{stats.losses}</span>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="relative p-3 rounded-3xl bg-black/60 border border-white/10 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="grid grid-cols-3 gap-3 w-72 h-72 sm:w-80 sm:h-80">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={!!cell || !!winner}
                className={`relative rounded-2xl flex items-center justify-center font-black text-4xl sm:text-5xl transition-all cursor-pointer border ${
                  isWinningCell
                    ? "bg-gradient-to-tr from-cyan-500/30 to-purple-600/30 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105"
                    : cell
                    ? "bg-white/5 border-white/10 cursor-default"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/10 hover:border-cyan-500/30"
                }`}
              >
                {cell === "X" && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  >
                    ✕
                  </motion.span>
                )}
                {cell === "O" && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  >
                    ◯
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>

        {/* Winner Banner Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-3 p-6 z-20 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                {winner === "draw" ? (
                  <Sparkles className="w-7 h-7 text-white/70" />
                ) : (
                  <Trophy className="w-7 h-7 text-yellow-400 animate-bounce" />
                )}
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider">
                {winner === "draw"
                  ? isAr ? "تعادل تكتيكي!" : "Tactical Stalemate!"
                  : winner === "X"
                  ? isAr ? "نصر ساحق لـ X!" : "Victory to X!"
                  : isAr ? "فوز الخصم O!" : "Victory to O!"}
              </h3>
              <p className="text-xs text-white/50 font-mono">
                {winner === "X"
                  ? isAr ? "+25 نقطة تصنيف Vexora" : "+25 Vexora MMR Earned"
                  : winner === "O"
                  ? isAr ? "-15 نقطة تصنيف Vexora" : "-15 Vexora MMR"
                  : isAr ? "لا تغيير في النقاط" : "No MMR change"}
              </p>
              <button
                onClick={resetGame}
                className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
              >
                {isAr ? "جولة جديدة" : "Play Again"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Turn indicator */}
      {!winner && (
        <div className="flex items-center gap-2 font-mono text-xs text-white/60">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>
            {isAr ? "الدور الحالي:" : "Current Turn:"}{" "}
            <strong className={isXNext ? "text-cyan-400" : "text-amber-400"}>
              {isXNext ? "Player X" : gameMode === "bot" ? "Cyber Bot O" : "Player O"}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. CONNECT FOUR ENGINE & COMPONENT
// ==========================================
function ConnectFourGame({
  language,
  onGameOver,
}: {
  language: "ar" | "en";
  onGameOver: (result: "win" | "loss" | "draw") => void;
}) {
  const ROWS = 6;
  const COLS = 7;
  // board[row][col], row 0 is top, row 5 is bottom
  const [grid, setGrid] = useState<(string | null)[][]>(() =>
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null))
  );
  const [isPlayer1, setIsPlayer1] = useState(true); // P1 is Cyan ("C"), P2/Bot is Amber ("A")
  const [winner, setWinner] = useState<string | null>(null);
  const [winningCoords, setWinningCoords] = useState<[number, number][] | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("bot");
  const [isDropping, setIsDropping] = useState(false);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  const checkWinner = (b: (string | null)[][]): { winner: string; coords: [number, number][] } | null => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = b[r][c];
        if (val && val === b[r][c + 1] && val === b[r][c + 2] && val === b[r][c + 3]) {
          return {
            winner: val,
            coords: [
              [r, c],
              [r, c + 1],
              [r, c + 2],
              [r, c + 3],
            ],
          };
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        const val = b[r][c];
        if (val && val === b[r + 1][c] && val === b[r + 2][c] && val === b[r + 3][c]) {
          return {
            winner: val,
            coords: [
              [r, c],
              [r + 1, c],
              [r + 2, c],
              [r + 3, c],
            ],
          };
        }
      }
    }
    // Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const val = b[r][c];
        if (val && val === b[r + 1][c + 1] && val === b[r + 2][c + 2] && val === b[r + 3][c + 3]) {
          return {
            winner: val,
            coords: [
              [r, c],
              [r + 1, c + 1],
              [r + 2, c + 2],
              [r + 3, c + 3],
            ],
          };
        }
      }
    }
    // Diagonal Down-Left
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 3; c < COLS; c++) {
        const val = b[r][c];
        if (val && val === b[r + 1][c - 1] && val === b[r + 2][c - 2] && val === b[r + 3][c - 3]) {
          return {
            winner: val,
            coords: [
              [r, c],
              [r + 1, c - 1],
              [r + 2, c - 2],
              [r + 3, c - 3],
            ],
          };
        }
      }
    }
    // Draw
    if (b.every((row) => row.every((c) => c !== null))) {
      return { winner: "draw", coords: [] };
    }
    return null;
  };

  const dropDisc = (col: number, playerVal: string, currentGrid: (string | null)[][]) => {
    const newGrid = currentGrid.map((row) => [...row]);
    // find bottom-most empty slot
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newGrid[r][col]) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return null; // column full

    newGrid[targetRow][col] = playerVal;
    return { newGrid, row: targetRow };
  };

  const handleColumnClick = (col: number) => {
    if (winner || isDropping) return;

    const result = dropDisc(col, isPlayer1 ? "C" : "A", grid);
    if (!result) return;

    setIsDropping(true);
    gameAudio.playDrop();
    setGrid(result.newGrid);

    const winCheck = checkWinner(result.newGrid);
    if (winCheck) {
      finalizeGame(winCheck.winner, winCheck.coords);
      setIsDropping(false);
      return;
    }

    if (gameMode === "bot" && isPlayer1) {
      setIsPlayer1(false);
      setTimeout(() => {
        makeBotMove(result.newGrid);
      }, 500);
    } else {
      setIsPlayer1(!isPlayer1);
      setIsDropping(false);
    }
  };

  const makeBotMove = (currentGrid: (string | null)[][]) => {
    const validCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (!currentGrid[0][c]) validCols.push(c);
    }
    if (validCols.length === 0) {
      setIsDropping(false);
      return;
    }

    // Smart priority: check if Bot ("A") can win
    let chosenCol = validCols[0];
    for (const c of validCols) {
      const sim = dropDisc(c, "A", currentGrid);
      if (sim && checkWinner(sim.newGrid)?.winner === "A") {
        chosenCol = c;
        break;
      }
    }
    // Check if Bot must block Player ("C")
    if (chosenCol === validCols[0]) {
      for (const c of validCols) {
        const sim = dropDisc(c, "C", currentGrid);
        if (sim && checkWinner(sim.newGrid)?.winner === "C") {
          chosenCol = c;
          break;
        }
      }
    }
    // Otherwise prefer center columns
    if (chosenCol === validCols[0] && validCols.includes(3)) {
      chosenCol = 3;
    }

    const botResult = dropDisc(chosenCol, "A", currentGrid);
    if (botResult) {
      gameAudio.playDrop();
      setGrid(botResult.newGrid);
      const winCheck = checkWinner(botResult.newGrid);
      if (winCheck) {
        finalizeGame(winCheck.winner, winCheck.coords);
      } else {
        setIsPlayer1(true);
      }
    }
    setIsDropping(false);
  };

  const finalizeGame = (resWinner: string, coords: [number, number][]) => {
    setWinner(resWinner);
    setWinningCoords(coords);

    if (resWinner === "C") {
      gameAudio.playVictory();
      setScores((s) => ({ ...s, p1: s.p1 + 1 }));
      onGameOver("win");
    } else if (resWinner === "A") {
      gameAudio.playDefeat();
      setScores((s) => ({ ...s, p2: s.p2 + 1 }));
      onGameOver("loss");
    } else {
      gameAudio.playMove();
      onGameOver("draw");
    }
  };

  const resetGame = () => {
    setGrid(
      Array(ROWS)
        .fill(null)
        .map(() => Array(COLS).fill(null))
    );
    setIsPlayer1(true);
    setWinner(null);
    setWinningCoords(null);
    setIsDropping(false);
  };

  const isAr = language === "ar";

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto w-full">
      {/* Controls */}
      <div className="flex items-center justify-between w-full bg-black/40 border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setGameMode("bot");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === "bot"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>VS Bot</span>
          </button>
          <button
            onClick={() => {
              setGameMode("local");
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
              gameMode === "local"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-white/40 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>2P Local</span>
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-cyan-400 font-bold">{scores.p1}</span>
          <span className="text-white/20">:</span>
          <span className="text-amber-400 font-bold">{scores.p2}</span>
        </div>

        <button
          onClick={resetGame}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Connect 4 Matrix Board */}
      <div className="relative p-4 rounded-3xl bg-[#080d1a] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full">
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {Array(COLS)
            .fill(null)
            .map((_, colIdx) => (
              <div
                key={colIdx}
                onClick={() => handleColumnClick(colIdx)}
                className="flex flex-col gap-2 sm:gap-3 cursor-pointer group"
              >
                {Array(ROWS)
                  .fill(null)
                  .map((_, rowIdx) => {
                    const cellVal = grid[rowIdx][colIdx];
                    const isWinDisc = winningCoords?.some(
                      ([r, c]) => r === rowIdx && c === colIdx
                    );
                    return (
                      <div
                        key={rowIdx}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all ${
                          isWinDisc
                            ? "border-white bg-gradient-to-tr from-cyan-400 to-amber-300 shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-110 z-10 animate-pulse"
                            : cellVal === "C"
                            ? "bg-gradient-to-tr from-cyan-500 to-blue-500 border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.7)]"
                            : cellVal === "A"
                            ? "bg-gradient-to-tr from-amber-500 to-orange-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.7)]"
                            : "bg-black/60 border-white/10 group-hover:border-cyan-500/40"
                        }`}
                      >
                        {cellVal && (
                          <div className="w-4 h-4 rounded-full bg-white/25 pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
        </div>

        {/* Win Banner */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-3 p-6 z-20 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <Trophy className="w-7 h-7 text-yellow-400 animate-bounce" />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wider">
                {winner === "C"
                  ? isAr ? "نصر رباعي لـ Cyan!" : "Cyan Connected 4!"
                  : winner === "A"
                  ? isAr ? "نصر رباعي لـ Amber!" : "Amber Connected 4!"
                  : isAr ? "تعادل كامل!" : "Grid Stalemated!"}
              </h3>
              <button
                onClick={resetGame}
                className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                {isAr ? "جولة جديدة" : "Next Round"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Turn indicator */}
      {!winner && (
        <div className="flex items-center gap-2 font-mono text-xs text-white/60">
          <span
            className={`w-3 h-3 rounded-full ${
              isPlayer1 ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
            }`}
          />
          <span>
            {isAr ? "الدور لـ" : "Turn:"}{" "}
            <strong className={isPlayer1 ? "text-cyan-400" : "text-amber-400"}>
              {isPlayer1 ? "Player (Cyan)" : gameMode === "bot" ? "Cyber Bot (Amber)" : "Player 2 (Amber)"}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. CHESS ENGINE & COMPONENT (8x8)
// ==========================================
type PieceType = "p" | "r" | "n" | "b" | "q" | "k";
type PieceColor = "w" | "b"; // w: Cyan/White, b: Obsidian/Black

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

const INITIAL_CHESS_BOARD: (ChessPiece | null)[][] = [
  [
    { type: "r", color: "b" },
    { type: "n", color: "b" },
    { type: "b", color: "b" },
    { type: "q", color: "b" },
    { type: "k", color: "b" },
    { type: "b", color: "b" },
    { type: "n", color: "b" },
    { type: "r", color: "b" },
  ],
  Array(8)
    .fill(null)
    .map(() => ({ type: "p" as PieceType, color: "b" as PieceColor })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill(null)
    .map(() => ({ type: "p" as PieceType, color: "w" as PieceColor })),
  [
    { type: "r", color: "w" },
    { type: "n", color: "w" },
    { type: "b", color: "w" },
    { type: "q", color: "w" },
    { type: "k", color: "w" },
    { type: "b", color: "w" },
    { type: "n", color: "w" },
    { type: "r", color: "w" },
  ],
];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: "♔",
    q: "♕",
    r: "♖",
    b: "♗",
    n: "♘",
    p: "♙",
  },
  b: {
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟",
  },
};

function ChessGame({
  language,
  onGameOver,
}: {
  language: "ar" | "en";
  onGameOver: (result: "win" | "loss" | "draw") => void;
}) {
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(INITIAL_CHESS_BOARD);
  const [turn, setTurn] = useState<PieceColor>("w");
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [legalMoves, setLegalMoves] = useState<[number, number][]>([]);
  const [capturedWhite, setCapturedWhite] = useState<ChessPiece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPiece[]>([]);
  const [winner, setWinner] = useState<PieceColor | "draw" | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("bot");
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [whiteTimer, setWhiteTimer] = useState(300); // 5 minutes blitz
  const [blackTimer, setBlackTimer] = useState(300);

  // Turn clock
  useEffect(() => {
    if (winner) return;
    const interval = setInterval(() => {
      if (turn === "w") {
        setWhiteTimer((t) => {
          if (t <= 1) {
            setWinner("b");
            gameAudio.playDefeat();
            onGameOver("loss");
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTimer((t) => {
          if (t <= 1) {
            setWinner("w");
            gameAudio.playVictory();
            onGameOver("win");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, winner]);

  // Compute legal moves for a given piece at [r, c]
  const getMovesForSquare = (
    r: number,
    c: number,
    currentBoard: (ChessPiece | null)[][]
  ): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];
    const color = piece.color;
    const enemyColor = color === "w" ? "b" : "w";

    const inBounds = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8;

    // PAWN
    if (piece.type === "p") {
      const dir = color === "w" ? -1 : 1;
      const startRow = color === "w" ? 6 : 1;
      // Step 1
      if (inBounds(r + dir, c) && !currentBoard[r + dir][c]) {
        moves.push([r + dir, c]);
        // Step 2
        if (r === startRow && inBounds(r + 2 * dir, c) && !currentBoard[r + 2 * dir][c]) {
          moves.push([r + 2 * dir, c]);
        }
      }
      // Diagonal captures
      [-1, 1].forEach((dc) => {
        const nr = r + dir;
        const nc = c + dc;
        if (inBounds(nr, nc) && currentBoard[nr][nc]?.color === enemyColor) {
          moves.push([nr, nc]);
        }
      });
    }

    // KNIGHT
    if (piece.type === "n") {
      const offsets = [
        [-2, -1],
        [-2, 1],
        [-1, -2],
        [-1, 2],
        [1, -2],
        [1, 2],
        [2, -1],
        [2, 1],
      ];
      offsets.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          if (!currentBoard[nr][nc] || currentBoard[nr][nc]?.color === enemyColor) {
            moves.push([nr, nc]);
          }
        }
      });
    }

    // SLIDING PIECES (Rook, Bishop, Queen)
    const addRayMoves = (directions: [number, number][]) => {
      directions.forEach(([dr, dc]) => {
        let nr = r + dr;
        let nc = c + dc;
        while (inBounds(nr, nc)) {
          if (!currentBoard[nr][nc]) {
            moves.push([nr, nc]);
          } else {
            if (currentBoard[nr][nc]?.color === enemyColor) {
              moves.push([nr, nc]);
            }
            break; // ray blocked
          }
          nr += dr;
          nc += dc;
        }
      });
    };

    if (piece.type === "r") {
      addRayMoves([
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
    }
    if (piece.type === "b") {
      addRayMoves([
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    }
    if (piece.type === "q") {
      addRayMoves([
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    }

    // KING
    if (piece.type === "k") {
      const kingDirs = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ];
      kingDirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (inBounds(nr, nc)) {
          if (!currentBoard[nr][nc] || currentBoard[nr][nc]?.color === enemyColor) {
            moves.push([nr, nc]);
          }
        }
      });
    }

    return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (winner) return;

    // If a piece is already selected, check if clicked square is in legal moves
    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isLegal) {
        executeMove(sr, sc, r, c);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    // Selecting own piece
    const piece = board[r][c];
    if (piece && piece.color === turn) {
      setSelectedSquare([r, c]);
      const moves = getMovesForSquare(r, c, board);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const executeMove = (
    fromR: number,
    fromC: number,
    toR: number,
    toC: number,
    isBot: boolean = false
  ) => {
    const newBoard = board.map((row) => [...row]);
    const movingPiece = newBoard[fromR][fromC];
    const capturedPiece = newBoard[toR][toC];

    if (!movingPiece) return;

    // Pawn promotion to Queen
    if (movingPiece.type === "p" && (toR === 0 || toR === 7)) {
      movingPiece.type = "q";
    }

    newBoard[toR][toC] = movingPiece;
    newBoard[fromR][fromC] = null;

    if (capturedPiece) {
      gameAudio.playCapture();
      if (capturedPiece.color === "w") {
        setCapturedWhite((w) => [...w, capturedPiece]);
      } else {
        setCapturedBlack((b) => [...b, capturedPiece]);
      }
      // Check if King captured
      if (capturedPiece.type === "k") {
        const winColor = movingPiece.color;
        setWinner(winColor);
        if (winColor === "w") {
          gameAudio.playVictory();
          onGameOver("win");
        } else {
          gameAudio.playDefeat();
          onGameOver("loss");
        }
        setBoard(newBoard);
        return;
      }
    } else {
      gameAudio.playMove();
    }

    setBoard(newBoard);
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const notation = `${movingPiece.type.toUpperCase()}${files[toC]}${8 - toR}`;
    setMoveHistory((h) => [...h, notation]);

    const nextTurn = turn === "w" ? "b" : "w";
    setTurn(nextTurn);

    // If bot mode and next turn is Black
    if (gameMode === "bot" && nextTurn === "b") {
      setTimeout(() => {
        makeChessBotMove(newBoard);
      }, 600);
    }
  };

  const makeChessBotMove = (currentBoard: (ChessPiece | null)[][]) => {
    // Collect all valid moves for Black
    const allMoves: { from: [number, number]; to: [number, number]; weight: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === "b") {
          const moves = getMovesForSquare(r, c, currentBoard);
          moves.forEach(([tr, tc]) => {
            const target = currentBoard[tr][tc];
            let weight = 0;
            if (target) {
              if (target.type === "k") weight = 1000;
              else if (target.type === "q") weight = 90;
              else if (target.type === "r") weight = 50;
              else if (target.type === "b" || target.type === "n") weight = 30;
              else if (target.type === "p") weight = 10;
            }
            // slight bonus for moving toward center
            if (tr >= 2 && tr <= 5 && tc >= 2 && tc <= 5) weight += 2;
            allMoves.push({ from: [r, c], to: [tr, tc], weight });
          });
        }
      }
    }

    if (allMoves.length === 0) {
      setWinner("w");
      gameAudio.playVictory();
      onGameOver("win");
      return;
    }

    // Sort by weight descending
    allMoves.sort((a, b) => b.weight - a.weight);
    // Take best move (or random between top 3)
    const bestMove = allMoves[0];
    executeMove(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1], true);
  };

  const resetGame = () => {
    setBoard(INITIAL_CHESS_BOARD);
    setTurn("w");
    setSelectedSquare(null);
    setLegalMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWinner(null);
    setIsCheck(false);
    setMoveHistory([]);
    setWhiteTimer(300);
    setBlackTimer(300);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const isAr = language === "ar";

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-4xl mx-auto">
      {/* Left / Main Board Area */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        {/* Opponent (Black) HUD */}
        <div className="flex items-center justify-between w-full p-3 rounded-2xl bg-[#090e18] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black">
              {gameMode === "bot" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-black text-white block">
                {gameMode === "bot" ? (isAr ? "الذكاء الاصطناعي CyberBot" : "Cyber Bot AI") : "Player 2 (Obsidian)"}
              </span>
              <div className="flex gap-1 text-xs text-white/50">
                {capturedWhite.map((p, i) => (
                  <span key={i} className="text-cyan-400">
                    {PIECE_SYMBOLS.w[p.type]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              turn === "b"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse"
                : "bg-white/5 text-white/40 border-white/5"
            }`}
          >
            {formatTime(blackTimer)}
          </div>
        </div>

        {/* 8x8 Chessboard */}
        <div className="relative p-2.5 rounded-3xl bg-black/80 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
          <div className="grid grid-cols-8 grid-rows-8 w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden border border-white/10">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selectedSquare?.[0] === r && selectedSquare?.[1] === c;
                const isLegal = legalMoves.some(([mr, mc]) => mr === r && mc === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleSquareClick(r, c)}
                    className={`relative flex items-center justify-center cursor-pointer select-none transition-all ${
                      isSelected
                        ? "bg-cyan-500/40 shadow-inner"
                        : isDark
                        ? "bg-[#0b1220]"
                        : "bg-[#182338]"
                    }`}
                  >
                    {/* Legal Move Dot indicator */}
                    {isLegal && (
                      <span
                        className={`absolute w-3.5 h-3.5 rounded-full ${
                          cell ? "ring-4 ring-cyan-400/80 bg-red-500/50" : "bg-cyan-400/70"
                        } shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10`}
                      />
                    )}

                    {/* Chess Piece Symbol */}
                    {cell && (
                      <span
                        className={`text-2xl sm:text-3xl font-serif leading-none select-none ${
                          cell.color === "w"
                            ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                            : "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                        }`}
                      >
                        {PIECE_SYMBOLS[cell.color][cell.type]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Winner Banner */}
          <AnimatePresence>
            {winner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-3 p-6 z-20 text-center"
              >
                <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                <h3 className="text-xl font-black uppercase text-white tracking-wider">
                  {winner === "w"
                    ? isAr ? "كش مات! فوز ساحق للقطع المضيئة!" : "Checkmate! Cyan Victory!"
                    : isAr ? "كش مات! فوز القطع السوداء!" : "Checkmate! Obsidian Victory!"}
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  {winner === "w"
                    ? isAr ? "+35 تصنيف Vexora Grandmaster" : "+35 Vexora Grandmaster MMR"
                    : isAr ? "-20 تصنيف Vexora" : "-20 Vexora MMR"}
                </p>
                <button
                  onClick={resetGame}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs font-mono uppercase tracking-widest cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  {isAr ? "بدء تحدي جديد" : "Rematch"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player (White / Cyan) HUD */}
        <div className="flex items-center justify-between w-full p-3 rounded-2xl bg-[#090e18] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">
                {isAr ? "أنت (Cyan White)" : "You (Cyan White)"}
              </span>
              <div className="flex gap-1 text-xs text-white/50">
                {capturedBlack.map((p, i) => (
                  <span key={i} className="text-purple-400">
                    {PIECE_SYMBOLS.b[p.type]}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
              turn === "w"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse"
                : "bg-white/5 text-white/40 border-white/5"
            }`}
          >
            {formatTime(whiteTimer)}
          </div>
        </div>
      </div>

      {/* Right / Sidebar: Move notation & Controls */}
      <div className="w-full lg:w-64 bg-black/40 border border-white/5 rounded-3xl p-4 flex flex-col gap-4 max-h-96">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">
            {isAr ? "سجل النقلات" : "Move History"}
          </span>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs scrollbar-hide">
          {moveHistory.length === 0 ? (
            <p className="text-white/20 text-center py-8 text-[10px] uppercase font-mono">
              {isAr ? "لا توجد نقلات بعد" : "No moves recorded"}
            </p>
          ) : (
            moveHistory.map((m, idx) => (
              <div key={idx} className="flex justify-between py-1 px-2 rounded hover:bg-white/5 text-white/70">
                <span className="text-white/30 text-[10px]">#{idx + 1}</span>
                <span className={idx % 2 === 0 ? "text-cyan-400 font-bold" : "text-purple-400"}>
                  {m}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex gap-2">
          <button
            onClick={() => {
              setGameMode(gameMode === "bot" ? "local" : "bot");
              resetGame();
            }}
            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase text-white/70 hover:text-white"
          >
            {gameMode === "bot" ? "Switch to 2P" : "Switch to Bot"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN GAMING ARENA CONTAINER
// ==========================================
export default function GamingArena({
  currentUser,
  language,
}: {
  currentUser: UserProfile | null;
  language: "ar" | "en";
}) {
  const [activeGame, setActiveGame] = useState<ActiveGame>("chess");
  const [playerRating, setPlayerRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("vexora_arena_mmr");
      return saved ? parseInt(saved, 10) : 1450;
    } catch {
      return 1450;
    }
  });
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>(() => [
    {
      id: "m-1",
      game: "chess",
      opponent: "CyberBot (Veteran)",
      result: "win",
      ratingChange: 35,
      timestamp: "Today, 14:20",
    },
    {
      id: "m-2",
      game: "connect4",
      opponent: "ShadowSniper",
      result: "win",
      ratingChange: 25,
      timestamp: "Yesterday, 21:05",
    },
    {
      id: "m-3",
      game: "tictactoe",
      opponent: "VexoraPhantom",
      result: "draw",
      ratingChange: 0,
      timestamp: "2 days ago",
    },
  ]);

  const handleGameOver = (res: "win" | "loss" | "draw") => {
    const delta = res === "win" ? (activeGame === "chess" ? 35 : 25) : res === "loss" ? -15 : 0;
    const newRating = Math.max(800, playerRating + delta);
    setPlayerRating(newRating);
    try {
      localStorage.setItem("vexora_arena_mmr", newRating.toString());
    } catch {}

    const record: MatchRecord = {
      id: `m-${Date.now()}`,
      game: activeGame,
      opponent: "Cyber Bot AI",
      result: res,
      ratingChange: delta,
      timestamp: "Just now",
    };
    setMatchHistory((prev) => [record, ...prev.slice(0, 9)]);
  };

  const isAr = language === "ar";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#070b14] via-[#0c1424] to-[#080d19] border border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.12)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono uppercase tracking-widest font-black">
                {isAr ? "ساحة الألعاب التكتيكية المباشرة" : "VEXORA STRATEGY ARENA"}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
              {isAr ? "ساحة المواجهات الاستراتيجية" : "Browser Multiplayer Arena"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl font-mono leading-relaxed">
              {isAr
                ? "تنافس في شطرنج السيبربانك، رباعية الألوان، وإكس-أو العصبية بمحرك ألعاب تكتيكي فوري ونظام تصنيف MMR عالمي."
                : "Challenge players or advanced Cyber Bots in Chess, Connect Four, and Tic-Tac-Toe with zero-latency moves and real-time MMR rating."}
            </p>
          </div>

          {/* Player MMR Card */}
          <div className="p-4 rounded-2xl bg-black/60 border border-cyan-500/30 flex items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                {isAr ? "تصنيف الساحة (MMR)" : "Arena Rating (MMR)"}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{playerRating}</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {playerRating >= 1500 ? "Grandmaster" : "Tactician Tier II"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setActiveGame("chess")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
              activeGame === "chess"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            <span className="text-base">♔</span>
            <span>{isAr ? "1. الشطرنج (Chess)" : "1. Chess"}</span>
          </button>

          <button
            onClick={() => setActiveGame("connect4")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
              activeGame === "connect4"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            <span className="text-base">●</span>
            <span>{isAr ? "2. رباعية الألوان (Connect Four)" : "2. Connect Four"}</span>
          </button>

          <button
            onClick={() => setActiveGame("tictactoe")}
            className={`px-5 py-3 rounded-2xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2.5 ${
              activeGame === "tictactoe"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-105"
                : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
            }`}
          >
            <span className="text-base">✕</span>
            <span>{isAr ? "3. إكس-أو (Tic-Tac-Toe)" : "3. Tic-Tac-Toe"}</span>
          </button>
        </div>
      </div>

      {/* Active Game Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090d18]/90 border border-white/5 backdrop-blur-md shadow-2xl">
        {activeGame === "chess" && (
          <ChessGame language={language} onGameOver={handleGameOver} />
        )}
        {activeGame === "connect4" && (
          <ConnectFourGame language={language} onGameOver={handleGameOver} />
        )}
        {activeGame === "tictactoe" && (
          <TicTacToeGame language={language} onGameOver={handleGameOver} />
        )}
      </div>

      {/* Recent Match Log */}
      <div className="p-6 rounded-3xl bg-black/40 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              {isAr ? "سجل مباريات الساحة الحديثة" : "Recent Arena Combat Log"}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-white/40 uppercase">
            {matchHistory.length} Matches Logged
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {matchHistory.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    m.result === "win"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      : m.result === "loss"
                      ? "bg-red-400"
                      : "bg-amber-400"
                  }`}
                />
                <span className="font-bold text-white uppercase">{m.game}</span>
                <span className="text-white/40">vs {m.opponent}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-white/30">{m.timestamp}</span>
                <span
                  className={`font-black ${
                    m.ratingChange > 0
                      ? "text-emerald-400"
                      : m.ratingChange < 0
                      ? "text-red-400"
                      : "text-white/40"
                  }`}
                >
                  {m.ratingChange > 0 ? `+${m.ratingChange}` : m.ratingChange} MMR
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
