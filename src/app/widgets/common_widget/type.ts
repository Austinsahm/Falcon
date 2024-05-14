/**
 * Custom combobox option
 */
export interface ComboBoxOption<T> {
    key: string;
    label: string;
    value: T;
    disabled?: boolean;
  }
  
  /**
 * Progress Pipe Value
 */
export interface ProgressOutput<T> {
  loading?: boolean;
  value?: T;
  error?: Error|null;
}