import { MaterialIcons } from '@expo/vector-icons';

export interface IconSymbolProps {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  size: number;
}

export function IconSymbol({ name, color, size }: IconSymbolProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}