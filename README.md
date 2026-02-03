# PersonaChess

A desktop chess application that generates human-like moves using Stockfish analysis. Built with Electron, React, TypeScript, and following the MVVM (Model-View-ViewModel) architectural pattern.

## 🎯 Overview

PersonaChess is a chess application that uses the Stockfish UCI engine (WASM) to analyze chess positions and generate moves that feel more human-like. Instead of always playing the best move, it classifies moves into quality buckets (Best, Great, Excellent, Good, Inaccuracy, Mistake, Blunder) and allows you to control the probability distribution of each bucket type.

### Key Features

- **Human-like Move Generation**: Moves are selected based on configurable quality distributions rather than always playing the best move
- **Stockfish Integration**: Uses Stockfish WASM engine for deep position analysis (configurable depth and MultiPV)
- **Interactive Chess Board**: Drag-and-drop or click-to-move piece interaction with visual move indicators
- **Auto-Play Mode**: Engine can automatically play for White or Black after your moves
- **Manual Play Mode**: Play against the engine manually, controlling when it analyzes and moves
- **Undo/Redo**: Single-move undo and redo functionality
- **FEN/PGN Support**: Load positions from FEN strings or entire games from PGN
- **FEN History**: Automatic FEN position saving with localStorage, restore on app restart
- **Move Quality Classification**: Moves are automatically classified into quality buckets based on evaluation loss
- **Player Move Analysis**: Real-time analysis and display of player move quality (Best, Great, Excellent, Good, Inaccuracy, Mistake, Blunder)
- **Move Quality Arrows**: Visual arrows showing move quality on the board (Excellent, Good, Mistake, Blunder - max 3 per quality)
- **Board Orientation**: Flip board to view from either side's perspective
- **Configurable Engine Settings**: Adjust analysis depth, MultiPV, and move quality distributions

## 🏗️ Architecture

PersonaChess follows a strict **MVVM (Model-View-ViewModel)** architectural pattern:

### Model Layer (`src/engine/`)
Pure TypeScript, no React or MobX dependencies. Contains:
- **`stockfish.service.ts`**: Manages communication with Stockfish WASM engine via Web Workers
- **`moveClassifier.ts`**: Classifies moves into quality buckets based on `evalLoss`
- **`movePicker.ts`**: Implements weighted random move selection based on bucket percentages
- **`types.ts`**: TypeScript interfaces and types for the engine layer

### ViewModel Layer (`src/viewmodels/`)
MobX stores that connect the Model with the View:
- **`BoardViewModel.ts`**: Manages chess board state, move history, game status, undo/redo
- **`EngineViewModel.ts`**: Manages Stockfish engine state, analysis results, move picking
- **`ConfigViewModel.ts`**: Manages user configuration (bucket percentages, engine settings)

### View Layer (`src/renderer/`)
React functional components using `observer()` from `mobx-react-lite`:
- **`App.tsx`**: Main application component, orchestrates layout
- **`ChessBoard.tsx`**: Chess board component using `react-chessboard`
- **`ControlPanel.tsx`**: Game controls (undo, redo, reset, load FEN/PGN, auto-play toggle)
- **`ConfigPanel.tsx`**: Configuration sliders for move quality distributions

## 🛠️ Tech Stack

### Core Technologies
- **Electron 40.1.0**: Desktop application framework
- **React 19.2.4**: UI library
- **TypeScript 4.5.4**: Type-safe JavaScript
- **MobX 6.15.0**: State management
- **Vite 5.4.21**: Build tool and dev server

### Chess Libraries
- **chess.js 1.4.0**: Chess logic, move validation, FEN/PGN handling
- **react-chessboard 5.8.6**: React chess board component
- **stockfish.js 10.0.2**: Stockfish UCI engine (WASM) for position analysis

### Development Tools
- **Electron Forge**: Electron build and packaging
- **ESLint**: Code linting
- **@vitejs/plugin-react**: React support for Vite

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd PersonaChess
```

2. Install dependencies:
```bash
npm install
```

The `postinstall` script will automatically copy Stockfish WASM files to the `public/` directory.

3. Start the development server:
```bash
npm start
```

## 🚀 Usage

### Basic Gameplay

1. **Making Moves**: 
   - Click a piece to see legal moves (highlighted circles)
   - Click a highlighted square to move
   - Or drag and drop pieces

2. **Auto-Play Mode**:
   - Enable "Auto-play Engine" toggle
   - Select which side the engine plays for (White or Black)
   - Make your moves, and the engine will automatically respond

3. **Manual Mode**:
   - Disable "Auto-play Engine"
   - Click "Solve Next Move" when you want the engine to analyze and play

### Configuration

**Move Quality Distribution**: Adjust the percentage sliders to control how often the engine plays different quality moves:
- **Best**: Perfect moves (0 eval loss)
- **Great**: Very good moves (0-10 centipawns loss)
- **Excellent**: Good moves (10-30 centipawns loss)
- **Good**: Decent moves (30-60 centipawns loss)
- **Inaccuracy**: Suboptimal moves (60-100 centipawns loss)
- **Mistake**: Poor moves (100-200 centipawns loss)
- **Blunder**: Very poor moves (200+ centipawns loss)

**Engine Settings**:
- **Depth**: Analysis depth (default: 20)
- **MultiPV**: Number of candidate moves to analyze (default: 12)

### Loading Positions

- **Load FEN**: Click "Load FEN" and paste a FEN string to load a specific position
- **Load PGN**: Click "Load PGN" and paste a PGN string to load an entire game

### Undo/Redo

- **Undo**: Click the "↶ Undo" button to undo the last move
- **Redo**: Click the "↷ Redo" button to redo the last undone move
- The redo stack is cleared when you make a new move

### Board Controls

- **Flip Board**: Click the "🔄 Flip Board" button to flip the board orientation (view from Black's or White's perspective)
- **FEN History**: Current FEN is automatically saved to localStorage. Use the "Restore" button to reload the last saved position
- **FEN Status**: Indicator shows whether the current position is saved and how many positions are in history (max 50)

### Move Analysis Features

- **Player Move Quality**: After making a move, the quality of your move is automatically analyzed and displayed (e.g., "You played: Excellent move")
- **Move Quality Arrows**: 
  - Click "Show Move Arrows" to display arrows on the board showing move quality
  - Arrows are colored by quality: Excellent (green), Good (gray), Mistake (red), Blunder (dark red)
  - Shows maximum 3 arrows per quality type (up to 12 arrows total)
  - Click "Analyze Moves" to manually trigger analysis of all legal moves
  - Arrows automatically update when the position changes

### Piece Interaction

- **Capturing Engine Pieces**: When auto-play is enabled, you can click on your pieces and then click on engine pieces to capture them
- **Engine Piece Selection**: Engine pieces cannot be selected to move them, but they can be captured by your pieces

## 📁 Project Structure

```
PersonaChess/
├── src/
│   ├── engine/              # Model layer (pure TypeScript)
│   │   ├── stockfish.service.ts
│   │   ├── moveClassifier.ts
│   │   ├── movePicker.ts
│   │   └── types.ts
│   ├── viewmodels/          # ViewModel layer (MobX stores)
│   │   ├── BoardViewModel.ts
│   │   ├── EngineViewModel.ts
│   │   ├── ConfigViewModel.ts
│   │   └── index.ts
│   ├── renderer/            # View layer (React components)
│   │   ├── components/
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── ControlPanel.tsx
│   │   │   ├── ConfigPanel.tsx
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── index.tsx
│   ├── main.ts              # Electron main process
│   └── preload.ts           # Electron preload script
├── public/                  # Static assets (Stockfish WASM files)
├── package.json
├── tsconfig.json
├── vite.renderer.config.ts
├── forge.config.ts
└── README.md
```

## 🔧 Development

### Available Scripts

- `npm start`: Start the Electron app in development mode
- `npm run package`: Package the app for distribution
- `npm run make`: Create distributables (installers)
- `npm run lint`: Run ESLint

### Building for Production

```bash
npm run package
```

This creates a packaged version in the `out/` directory.

### Creating Installers

```bash
npm run make
```

This creates platform-specific installers (Windows, macOS, Linux) in the `out/make/` directory.

## 🎨 Features

### ✅ Implemented

- [x] MVVM architecture with strict separation of concerns
- [x] Stockfish WASM integration via Web Workers
- [x] Move classification into quality buckets
- [x] Weighted random move selection
- [x] Interactive chess board (drag-and-drop and click-to-move)
- [x] Visual move indicators (legal moves, selected squares)
- [x] Auto-play mode with configurable engine side
- [x] Manual play mode
- [x] Single-move undo/redo
- [x] FEN/PGN loading
- [x] FEN history with localStorage persistence (auto-save, restore on startup)
- [x] Board flip functionality (view from either side)
- [x] Player move quality analysis and display
- [x] Move quality arrows visualization (Excellent, Good, Mistake, Blunder)
- [x] Move arrows filtering (max 3 per quality type)
- [x] Enhanced piece interaction (can capture engine pieces when auto-play enabled)
- [x] Configurable move quality distributions
- [x] Engine settings (depth, MultiPV)
- [x] Game status display (check, checkmate, stalemate, draw)
- [x] Move history tracking
- [x] Responsive horizontal layout
- [x] FEN status indicator (saved/unsaved, history count)

### 🚧 TODO / Future Enhancements

- [ ] Save/load game configurations
- [ ] Export games to PGN
- [ ] Move notation display (SAN) in move history
- [ ] Opening book integration
- [ ] Time controls
- [ ] Multiple engine personalities (aggressive, defensive, etc.)
- [ ] Move suggestions for human player
- [ ] Analysis panel showing engine evaluation and principal variation
- [ ] Game replay functionality
- [ ] Tournament mode
- [ ] Statistics tracking (win/loss/draw)
- [ ] Custom themes
- [ ] Keyboard shortcuts
- [ ] Multi-language support
- [ ] Cloud sync for configurations
- [ ] Engine strength presets (beginner, intermediate, advanced)
- [ ] Move history panel with notation
- [ ] Position evaluation graph over time
- [ ] Filter move arrows by specific quality buckets (currently shows Excellent, Good, Mistake, Blunder)
- [ ] Show arrows for all move qualities (Best, Great, Inaccuracy)
- [ ] Configurable arrow colors per quality bucket
- [ ] Arrow animation effects
- [ ] Export FEN history to file
- [ ] Import FEN history from file

## 🐛 Known Issues

- Stockfish analysis timeout is set to 30 seconds; very deep analysis may timeout
- Auto-play may trigger multiple times if moves are made very quickly (mitigated with delays)
- Move arrows analysis may take a few seconds for positions with many legal moves
- FEN history is limited to 50 positions (oldest positions are automatically removed)
- Move arrows only show up to 3 arrows per quality type (Excellent, Good, Mistake, Blunder)

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

**iMokhles**
- Email: mokhles@blockgemini.com

## 🙏 Acknowledgments

- **Stockfish**: Open-source chess engine
- **chess.js**: JavaScript chess library
- **react-chessboard**: React chess board component
- **Electron**: Desktop application framework

## 📚 Resources

- [Stockfish Documentation](https://stockfishchess.org/)
- [UCI Protocol](https://www.chessprogramming.org/UCI)
- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [MobX Documentation](https://mobx.js.org/)
- [Electron Documentation](https://www.electronjs.org/)

---

**Note**: This application is designed for educational purposes and chess analysis. The move quality classification system is a simplified model and may not perfectly reflect human playing patterns.
