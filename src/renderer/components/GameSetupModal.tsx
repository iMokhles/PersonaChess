import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { observer } from 'mobx-react-lite';
import { describeGameSetupPreset } from '../../engine/gameSetupPresets';
import { boardViewModel, gameSetupViewModel } from '../../viewmodels';
import {
  SettingsButton,
  SettingsButtonGroup,
  SettingsTextarea,
  SettingsTextInput,
} from './settings/SettingsControls';
import './GameSetupModal.css';

export const GameSetupModal: React.FC = observer(() => {
  const busy = boardViewModel.isThinking || boardViewModel.isAnalyzingMoves;
  const selectedPreset = gameSetupViewModel.selectedPreset;
  const customCategory = gameSetupViewModel.selectedCategory === 'custom-fen' || gameSetupViewModel.selectedCategory === 'custom-pgn';

  return (
    <Dialog.Root open={gameSetupViewModel.open} onOpenChange={(open) => gameSetupViewModel.setOpen(open)}>
      <Dialog.Portal>
        <Dialog.Overlay className="pc-overlay" />
        <Dialog.Content className="pc-dialog game-setup-modal">
          <div className="game-setup-modal-header">
            <div>
              <Dialog.Title className="pc-dialog-title">Game Setup</Dialog.Title>
              <Dialog.Description className="pc-dialog-description">
                Load a curated opening, tactical drill, endgame study, or paste your own FEN or PGN.
              </Dialog.Description>
            </div>
          </div>

          <div className="game-setup-modal-body">
            <aside className="game-setup-sidebar">
              <div className="game-setup-category-list" role="tablist" aria-label="Game setup categories">
                {gameSetupViewModel.categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    className={`game-setup-category-button ${gameSetupViewModel.selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => gameSetupViewModel.setSelectedCategory(category.value)}
                    disabled={busy}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="game-setup-panel">
              {!customCategory && (
                <>
                  <div className="game-setup-toolbar">
                    <SettingsTextInput
                      value={gameSetupViewModel.searchQuery}
                      onChange={(value) => gameSetupViewModel.setSearchQuery(value)}
                      placeholder="Search presets, tags, difficulty..."
                      disabled={busy}
                    />
                  </div>

                  <div className="game-setup-grid">
                    <div className="game-setup-list" role="listbox" aria-label="Available presets">
                      {gameSetupViewModel.filteredPresets.length === 0 ? (
                        <div className="game-setup-empty">
                          <strong>No presets found</strong>
                          <span>Try a broader search or switch categories.</span>
                        </div>
                      ) : (
                        gameSetupViewModel.filteredPresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className={`game-setup-list-item ${gameSetupViewModel.selectedPresetId === preset.id ? 'active' : ''}`}
                            onClick={() => gameSetupViewModel.setSelectedPresetId(preset.id)}
                            disabled={busy}
                          >
                            <strong>{preset.name}</strong>
                            <span>{preset.side === 'white' ? 'White' : 'Black'} • {preset.difficulty}</span>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="game-setup-details">
                      {selectedPreset ? (
                        <>
                          <div className="game-setup-details-header">
                            <h3>{selectedPreset.name}</h3>
                            <div className="game-setup-meta-row">
                              <span>{describeGameSetupPreset(selectedPreset)}</span>
                              <span>{selectedPreset.tags.join(' • ')}</span>
                            </div>
                          </div>
                          <p className="game-setup-description">{selectedPreset.description}</p>
                          <div className="game-setup-source-label">
                            {selectedPreset.sourceType === 'fen' ? 'FEN setup' : 'PGN setup'}
                          </div>
                          <pre className="game-setup-source-preview">{selectedPreset.source}</pre>
                          <div className="game-setup-actions">
                            <SettingsButton disabled={busy} onClick={() => gameSetupViewModel.loadSelectedPreset()}>
                              Load
                            </SettingsButton>
                          </div>
                        </>
                      ) : (
                        <div className="game-setup-empty">
                          <strong>Select a preset</strong>
                          <span>Choose a setup from the list to preview it before loading.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {gameSetupViewModel.selectedCategory === 'custom-fen' && (
                <div className="game-setup-custom-panel">
                  <p className="game-setup-description">
                    Paste a FEN string to replace the current board position. This starts a fresh game session and resets brilliant tracking.
                  </p>
                  <SettingsTextarea
                    value={gameSetupViewModel.customFenInput}
                    onChange={(value) => gameSetupViewModel.setCustomFenInput(value)}
                    placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    rows={4}
                    disabled={busy}
                  />
                  <div className="game-setup-actions">
                    <SettingsButton disabled={busy || !gameSetupViewModel.customFenInput.trim()} onClick={() => gameSetupViewModel.loadCustomFen()}>
                      Load
                    </SettingsButton>
                  </div>
                </div>
              )}

              {gameSetupViewModel.selectedCategory === 'custom-pgn' && (
                <div className="game-setup-custom-panel">
                  <p className="game-setup-description">
                    Paste a PGN line or game to restore the resulting position while keeping the setup flow in one place.
                  </p>
                  <SettingsTextarea
                    value={gameSetupViewModel.customPgnInput}
                    onChange={(value) => gameSetupViewModel.setCustomPgnInput(value)}
                    placeholder={'[Event "?"]\n\n1. e4 e5 2. Nf3 Nc6'}
                    rows={10}
                    disabled={busy}
                  />
                  <div className="game-setup-actions">
                    <SettingsButton disabled={busy || !gameSetupViewModel.customPgnInput.trim()} onClick={() => gameSetupViewModel.loadCustomPgn()}>
                      Load
                    </SettingsButton>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="game-setup-modal-footer">
            <SettingsButtonGroup>
              <Dialog.Close asChild>
                <button type="button" className="settings-pill-button" disabled={busy}>
                  Close
                </button>
              </Dialog.Close>
            </SettingsButtonGroup>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

GameSetupModal.displayName = 'GameSetupModal';
