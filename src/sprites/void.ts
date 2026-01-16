export interface VoidMetadataConfig {
  type: 'hidden';
  metadata: Record<string, any>;
  message?: string;
}

export const voidSprite = {
  type: 'hidden' as const,
  metadata: {},
  message: undefined
};

function rot13(str: string): string {
  return str.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpperCase = code >= 65 && code <= 90;
    const base = isUpperCase ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

export function createVoidConfig(metadata: Record<string, any>, message?: string): VoidMetadataConfig {
  return {
    type: 'hidden',
    metadata,
    message: message ? rot13(message) : undefined
  };
}
