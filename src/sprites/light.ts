export interface LightTooltipConfig {
  type: 'static';
  svg: string;
  tooltip?: string;
}

export const lightCharacterPaths: Record<string, string> = {
  'alexis': '/images/light/alexis.svg',
  'austine': '/images/light/austine.svg',
  'chloe': '/images/light/chloe.svg',
  'isabell': '/images/light/isabell.svg',
  'nicholas': '/images/light/nicholas.svg',
  'opal': '/images/light/opal.svg',
  'tyson': '/images/light/tyson.svg',
  'victor': '/images/light/victor.svg',
  'alice': '/images/light/alice.svg',
  'audrey': '/images/light/audrey.svg',
  'clayton': '/images/light/clayton.svg',
  'irene': '/images/light/irene.svg',
  'nix': '/images/light/nix.svg',
  'nix2': '/images/light/nix2.svg',
  'octavian': '/images/light/octavian.svg',
  'trenton': '/images/light/trenton.svg',
  'vettia': '/images/light/vettia.svg',
  'okwos': '/images/light/okwos.svg',
  'gwenhas': '/images/light/gwenhas.svg',
  'dhesas': '/images/light/dhesas.svg',
  'redacted': '/images/light/redacted.svg'
};

export const lightSprite = {
  type: 'static' as const,
  svg: '',
  tooltip: ''
};

export function createLightConfig(
  tooltip?: string
): LightTooltipConfig {
  return {
    type: 'static',
    svg: '',
    tooltip
  };
}
