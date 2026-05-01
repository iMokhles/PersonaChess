import React, { useCallback, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';
import { observer } from 'mobx-react-lite';
import { boardViewModel, engineViewModel, uiStateViewModel } from '../../viewmodels';
import './DesktopToolbar.css';

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  rows: number;
  disabled: boolean;
}

const InputDialog: React.FC<InputDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  value,
  onValueChange,
  onSubmit,
  placeholder,
  rows,
  disabled,
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="pc-overlay" />
      <Dialog.Content className="pc-dialog pc-input-dialog">
        <Dialog.Title className="pc-dialog-title">{title}</Dialog.Title>
        <Dialog.Description className="pc-dialog-description">{description}</Dialog.Description>
        <textarea
          className="pc-dialog-textarea"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
        <div className="pc-dialog-actions">
          <Dialog.Close asChild>
            <button type="button" className="pc-button pc-button-secondary" disabled={disabled}>
              Cancel
            </button>
          </Dialog.Close>
          <button
            type="button"
            className="pc-button pc-button-primary"
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
          >
            Apply
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

interface ToolbarButtonProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, shortcut, onClick, disabled = false, variant = 'secondary' }) => (
  <Tooltip.Root delayDuration={250}>
    <Tooltip.Trigger asChild>
      <button
        type="button"
        className={`desktop-toolbar-button ${variant}`}
        onClick={onClick}
        disabled={disabled}
      >
        {label}
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content side="bottom" className="pc-tooltip">
        {shortcut ? `${label} • ${shortcut}` : label}
        <Tooltip.Arrow className="pc-tooltip-arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export const DesktopToolbar: React.FC = observer(() => {
  const [fenInput, setFenInput] = useState('');
  const [pgnInput, setPgnInput] = useState('');

  const engineBusy = boardViewModel.isThinking
    || boardViewModel.isAnalyzingMoves
    || engineViewModel.isAnalyzing
    || engineViewModel.isInitializing;

  const handleLoadFen = useCallback(() => {
    if (!fenInput.trim()) {
      return;
    }

    if (boardViewModel.loadFen(fenInput.trim())) {
      setFenInput('');
      uiStateViewModel.setLoadFenOpen(false);
    }
  }, [fenInput]);

  const handleLoadPgn = useCallback(() => {
    if (!pgnInput.trim()) {
      return;
    }

    if (boardViewModel.loadPgn(pgnInput.trim())) {
      setPgnInput('');
      uiStateViewModel.setLoadPgnOpen(false);
    }
  }, [pgnInput]);

  return (
    <Tooltip.Provider>
      <div className="desktop-toolbar-shell">
        <div className="desktop-toolbar-brand">
          <span className="desktop-toolbar-brand-mark">♟</span>
          <div className="desktop-toolbar-brand-copy">
            <span className="desktop-toolbar-brand-title">PersonaChess</span>
            <span className="desktop-toolbar-brand-subtitle">Desktop personality chess lab</span>
          </div>
        </div>

        <div className="desktop-toolbar-groups">
          <div className="desktop-toolbar-group">
            <ToolbarButton label="New Game" shortcut="Reset board" onClick={() => boardViewModel.reset()} disabled={engineBusy} />
            <ToolbarButton label="Load PGN" onClick={() => uiStateViewModel.setLoadPgnOpen(true)} disabled={engineBusy} />
            <ToolbarButton label="Load FEN" onClick={() => uiStateViewModel.setLoadFenOpen(true)} disabled={engineBusy} />
          </div>

          <div className="desktop-toolbar-group">
            <ToolbarButton label="Undo" onClick={() => boardViewModel.undoSingle()} disabled={engineBusy || !boardViewModel.canUndo} />
            <ToolbarButton label="Redo" onClick={() => boardViewModel.redoSingle()} disabled={engineBusy || !boardViewModel.canRedo} />
            <ToolbarButton
              label={engineViewModel.isInitializing ? 'Starting…' : boardViewModel.isThinking ? 'Solving…' : 'Solve Move'}
              variant="primary"
              onClick={() => {
                void boardViewModel.solveNextMove();
              }}
              disabled={engineBusy || boardViewModel.isGameOver || boardViewModel.autoPlayEnabled}
            />
          </div>

          <div className="desktop-toolbar-group desktop-toolbar-group-switch">
            <label className="desktop-toolbar-switch">
              <span className="desktop-toolbar-switch-label">Auto Play</span>
              <Switch.Root
                checked={boardViewModel.autoPlayEnabled}
                onCheckedChange={(checked) => boardViewModel.setAutoPlay(checked)}
                disabled={engineBusy}
                className="desktop-switch-root"
              >
                <Switch.Thumb className="desktop-switch-thumb" />
              </Switch.Root>
            </label>
            <ToolbarButton label="Settings" onClick={() => uiStateViewModel.setSettingsOpen(true)} disabled={false} />
          </div>
        </div>
      </div>

      <InputDialog
        open={uiStateViewModel.loadFenOpen}
        onOpenChange={uiStateViewModel.setLoadFenOpen.bind(uiStateViewModel)}
        title="Load Position from FEN"
        description="Paste a valid FEN string to replace the current board position."
        value={fenInput}
        onValueChange={setFenInput}
        onSubmit={handleLoadFen}
        placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        rows={3}
        disabled={engineBusy}
      />

      <InputDialog
        open={uiStateViewModel.loadPgnOpen}
        onOpenChange={uiStateViewModel.setLoadPgnOpen.bind(uiStateViewModel)}
        title="Load Game from PGN"
        description="Paste a PGN line or full game. PersonaChess will restore the resulting position."
        value={pgnInput}
        onValueChange={setPgnInput}
        onSubmit={handleLoadPgn}
        placeholder='[Event "?"]\n\n1. e4 e5 2. Nf3 Nc6'
        rows={10}
        disabled={engineBusy}
      />
    </Tooltip.Provider>
  );
});

DesktopToolbar.displayName = 'DesktopToolbar';

