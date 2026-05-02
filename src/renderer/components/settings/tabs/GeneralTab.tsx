import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { getOpeningById, PREDEFINED_OPENINGS } from '../../../../engine/openings';
import { boardViewModel, gameSetupViewModel, uiStateViewModel } from '../../../../viewmodels';
import { BOARD_SIZE_PRESET_PIXELS, BoardSizePreset } from '../../../../viewmodels/UiStateViewModel';
import {
  SettingRow,
  SettingsButton,
  SettingsButtonGroup,
  SettingsNumberInput,
  SettingsSection,
  SettingsSelect,
  SettingsSwitch,
} from '../SettingsControls';

const ORIENTATION_OPTIONS = [
  { label: 'White at bottom', value: 'white' },
  { label: 'Black at bottom', value: 'black' },
];

const ARROW_SIDE_OPTIONS = [
  { label: 'Current turn', value: 'current' },
  { label: 'Player side', value: 'player' },
  { label: 'Engine side', value: 'engine' },
];

const ENGINE_SIDE_OPTIONS = [
  { label: 'White', value: 'w' },
  { label: 'Black', value: 'b' },
];

const ANIMATION_OPTIONS = [
  { label: 'Slow', value: 'slow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Fast', value: 'fast' },
];

const AUTOPLAY_SPEED_OPTIONS = [
  { label: 'Slow', value: 'slow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Fast', value: 'fast' },
];

const THEME_OPTIONS = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Persona', value: 'persona' },
];
const BOARD_SIZE_OPTIONS = (Object.entries(BOARD_SIZE_PRESET_PIXELS) as Array<[BoardSizePreset, number]>).map(([value, pixels]) => ({
  value,
  label: `${value === 'xlarge' ? 'Extra Large' : value.charAt(0).toUpperCase() + value.slice(1)} • ${pixels}px`,
}));

export const GeneralTab: React.FC = observer(() => {
  const [selectedOpeningId, setSelectedOpeningId] = useState('');
  const busy = boardViewModel.isThinking || boardViewModel.isAnalyzingMoves;

  return (
    <div className="settings-tab-content">
      <SettingsSection
        title="Board"
        description="Keep the board comfortable and gameplay-focused without cluttering the main window."
      >
        <SettingRow
          label="Board orientation"
          description="Choose which side stays at the bottom of the board."
          control={(
            <SettingsSelect
              value={boardViewModel.boardFlipped ? 'black' : 'white'}
              onValueChange={(value) => boardViewModel.setBoardFlipped(value === 'black')}
              options={ORIENTATION_OPTIONS}
              disabled={busy}
            />
          )}
        />
        <SettingRow
          label="Board size"
          description="Scale the board by square height while keeping it perfectly square."
          control={(
            <SettingsSelect
              value={uiStateViewModel.boardSizePreset}
              onValueChange={(value) => uiStateViewModel.setBoardSizePreset(value as BoardSizePreset)}
              options={BOARD_SIZE_OPTIONS}
              disabled={busy}
            />
          )}
        />
        <SettingRow
          label="Move arrows"
          description="Show or hide analyzed move arrows during play."
          control={(
            <SettingsSwitch
              checked={boardViewModel.showMoveArrows}
              onCheckedChange={(checked) => boardViewModel.setShowMoveArrowsEnabled(checked)}
              disabled={busy}
            />
          )}
        />
        {!uiStateViewModel.basicMode && (
          <SettingRow
            label="Arrow focus"
            description="Choose which side's move arrows should be emphasized."
            control={(
              <SettingsSelect
                value={boardViewModel.showArrowsForSide}
                onValueChange={(value) => boardViewModel.setShowArrowsForSide(value as 'current' | 'player' | 'engine')}
                options={ARROW_SIDE_OPTIONS}
                disabled={busy}
              />
            )}
          />
        )}
      </SettingsSection>

      <SettingsSection
        title="Experience"
        description="Presentation preferences that shape the desktop feel without altering chess logic."
      >
        <SettingRow
          label="Animation speed"
          description="A lightweight presentation preference for future board transitions."
          control={(
            <SettingsSelect
              value={uiStateViewModel.animationSpeed}
              onValueChange={(value) => uiStateViewModel.setAnimationSpeed(value as 'slow' | 'normal' | 'fast')}
              options={ANIMATION_OPTIONS}
            />
          )}
        />
        <SettingRow
          label="Sound"
          description="Enable lightweight desktop cues for moves, captures, checks, brilliant moves, and game end."
          control={(
            <SettingsSwitch
              checked={uiStateViewModel.soundEnabled}
              onCheckedChange={(checked) => uiStateViewModel.setSoundEnabled(checked)}
            />
          )}
        />
        <SettingRow
          label="Mute"
          description="Quickly silence all sounds without losing your saved volume level."
          control={(
            <SettingsSwitch
              checked={uiStateViewModel.soundMuted}
              onCheckedChange={(checked) => uiStateViewModel.setSoundMuted(checked)}
              disabled={!uiStateViewModel.soundEnabled}
            />
          )}
        />
        <SettingRow
          label="Volume"
          description="Desktop-friendly master volume for the built-in sound set."
          control={(
            <SettingsNumberInput
              value={uiStateViewModel.soundVolume}
              onChange={(value) => uiStateViewModel.setSoundVolume(value)}
              min={0}
              max={100}
              disabled={!uiStateViewModel.soundEnabled || uiStateViewModel.soundMuted}
            />
          )}
        />
        <SettingRow
          label="Theme"
          description="Switch the full desktop presentation while keeping gameplay behavior unchanged."
          control={(
            <SettingsSelect
              value={uiStateViewModel.themeMode}
              onValueChange={(value) => uiStateViewModel.setThemeMode(value as 'dark' | 'light' | 'minimal' | 'persona')}
              options={THEME_OPTIONS}
            />
          )}
        />
      </SettingsSection>

      <SettingsSection
        title="Play Defaults"
        description="Quick defaults for how PersonaChess behaves when you sit down to play."
      >
        <SettingRow
          label="Auto-play"
          description="Let the engine respond automatically after your moves."
          control={(
            <SettingsSwitch
              checked={boardViewModel.autoPlayEnabled}
              onCheckedChange={(checked) => boardViewModel.setAutoPlay(checked)}
              disabled={busy}
            />
          )}
        />
        <SettingRow
          label="Engine side"
          description="Pick which side the engine should control by default."
          control={(
            <SettingsSelect
              value={boardViewModel.enginePlaysFor}
              onValueChange={(value) => boardViewModel.setEnginePlaysFor(value as 'w' | 'b')}
              options={ENGINE_SIDE_OPTIONS}
              disabled={busy}
            />
          )}
        />
        <SettingRow
          label="Auto-play speed"
          description="Control how quickly automatic responses start after a player move or redo."
          control={(
            <SettingsSelect
              value={uiStateViewModel.autoPlaySpeed}
              onValueChange={(value) => uiStateViewModel.setAutoPlaySpeed(value as 'slow' | 'normal' | 'fast')}
              options={AUTOPLAY_SPEED_OPTIONS}
              disabled={busy}
            />
          )}
        />
      </SettingsSection>

      <SettingsSection
        title="Quick Opening"
        description="Keep the built-in opening library compatible while routing the richer setup flow through the Game Setup modal."
      >
        <SettingRow
          label="Opening library"
          description="Pick a predefined opening, or jump into the full setup modal for tactics, endgames, FEN, and PGN."
          control={(
            <SettingsSelect
              value={selectedOpeningId}
              onValueChange={setSelectedOpeningId}
              options={PREDEFINED_OPENINGS.map((opening) => ({
                label: `${opening.name} (${opening.side === 'white' ? 'White' : 'Black'})`,
                value: opening.id,
              }))}
              placeholder="Select opening"
              disabled={busy}
            />
          )}
        />
        <SettingsButtonGroup>
          <SettingsButton
            disabled={busy}
            onClick={() => gameSetupViewModel.openAtCategory('openings')}
          >
            Open Game Setup
          </SettingsButton>
          <SettingsButton
            disabled={!selectedOpeningId || busy}
            onClick={() => {
              const opening = getOpeningById(selectedOpeningId);
              if (opening && boardViewModel.loadPgn(opening.pgn)) {
                boardViewModel.statusMessage = `Opening: ${opening.name} (${opening.side === 'white' ? 'White' : 'Black'})`;
              }
            }}
          >
            Load Opening
          </SettingsButton>
          <SettingsButton
            disabled={busy || !boardViewModel.lastSavedFen}
            onClick={() => {
              const lastFen = boardViewModel.lastSavedFen;
              if (lastFen) {
                boardViewModel.loadFen(lastFen);
              }
            }}
          >
            Restore Last FEN
          </SettingsButton>
        </SettingsButtonGroup>
      </SettingsSection>
    </div>
  );
});

GeneralTab.displayName = 'GeneralTab';
