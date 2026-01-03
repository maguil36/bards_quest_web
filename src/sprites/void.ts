export interface VoidMetadataConfig {
  type: 'hidden';
  metadata: Record<string, any>;
}

export const voidSprite = {
  type: 'hidden' as const,
  metadata: {}
};

export function createVoidConfig(metadata: Record<string, any>): VoidMetadataConfig {
  return {
    type: 'hidden',
    metadata
  };
}
