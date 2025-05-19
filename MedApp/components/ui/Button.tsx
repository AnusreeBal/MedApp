import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { ThemedText } from '../ThemedText';

interface Props extends TouchableOpacityProps {
  children: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading, 
  style, 
  disabled,
  ...props 
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6366F1'} />
      ) : (
        <ThemedText 
          style={[
            styles.text,
            variant === 'secondary' && styles.textSecondary,
            (disabled || loading) && styles.textDisabled,
          ]}
        >
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  buttonDisabled: {
    backgroundColor: '#E2E8F0',
    borderColor: '#E2E8F0',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textSecondary: {
    color: '#6366F1',
  },
  textDisabled: {
    color: '#94A3B8',
  },
});