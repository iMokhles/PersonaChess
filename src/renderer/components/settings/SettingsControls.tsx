import React from 'react';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
import * as Tooltip from '@radix-ui/react-tooltip';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, children }) => (
  <section className="settings-section-block">
    <div className="settings-section-heading">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    <div className="settings-section-body">{children}</div>
  </section>
);

interface SettingRowProps {
  label: string;
  description?: string;
  hint?: string;
  control: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({ label, description, hint, control }) => (
  <div className="settings-row">
    <div className="settings-row-copy">
      <div className="settings-row-label">
        <span>{label}</span>
        {hint && <InfoTip content={hint} />}
      </div>
      {description && <p>{description}</p>}
    </div>
    <div className="settings-row-control">{control}</div>
  </div>
);

export const InfoTip: React.FC<{ content: string }> = ({ content }) => (
  <Tooltip.Root delayDuration={250}>
    <Tooltip.Trigger asChild>
      <button type="button" className="settings-hint-trigger" aria-label="More info">
        ?
      </button>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content side="top" className="pc-tooltip settings-tooltip">
        {content}
        <Tooltip.Arrow className="pc-tooltip-arrow" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);

interface SettingsSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = ({ checked, onCheckedChange, disabled = false }) => (
  <Switch.Root
    checked={checked}
    onCheckedChange={onCheckedChange}
    disabled={disabled}
    className="settings-switch-root"
  >
    <Switch.Thumb className="settings-switch-thumb" />
  </Switch.Root>
);

interface SelectOption {
  label: string;
  value: string;
}

interface SettingsSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({
  value,
  onValueChange,
  options,
  disabled = false,
  placeholder,
}) => (
  <Select.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
    <Select.Trigger className="settings-select-trigger" aria-label={placeholder ?? value ?? 'Select option'}>
      <Select.Value placeholder={placeholder} />
      <Select.Icon className="settings-select-icon">▾</Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="settings-select-content" position="popper" sideOffset={8}>
        <Select.Viewport className="settings-select-viewport">
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value} className="settings-select-item">
              <Select.ItemText>{option.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

interface SettingsNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  disabled?: boolean;
}

export const SettingsNumberInput: React.FC<SettingsNumberInputProps> = ({ value, onChange, min, max, disabled = false }) => (
  <input
    className="settings-number-input"
    type="number"
    min={min}
    max={max}
    value={value}
    onChange={(event) => onChange(parseInt(event.target.value, 10))}
    disabled={disabled}
  />
);

interface SettingsTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SettingsTextInput: React.FC<SettingsTextInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
}) => (
  <input
    className="settings-text-input"
    type="text"
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled}
  />
);

interface SettingsTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const SettingsTextarea: React.FC<SettingsTextareaProps> = ({
  value,
  onChange,
  placeholder,
  rows = 7,
  disabled = false,
}) => (
  <textarea
    className="settings-textarea"
    value={value}
    placeholder={placeholder}
    rows={rows}
    onChange={(event) => onChange(event.target.value)}
    disabled={disabled}
  />
);

export const SettingsButtonGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="settings-button-group">{children}</div>
);

export const SettingsButton: React.FC<{
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active = false, disabled = false, onClick, children }) => (
  <button
    type="button"
    className={`settings-pill-button ${active ? 'active' : ''}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
