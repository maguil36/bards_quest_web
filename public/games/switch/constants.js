export const GAME_CONSTANTS = {
  TILE_SIZE: 32,
  MAP_WIDTH: 5120,
  MAP_HEIGHT: 5120,
  
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  PLAYER_SPEED: 2,
  PLAYER_START_X: 2560,
  PLAYER_START_Y: 4480,
  
  SPRITE_FRAME_SIZE: 32,
  SPRITE_SHEET_SIZE: 128,
  
  ANIMATION_FRAME_DELAY: 10,
  
  INTERACTION_RANGE_MULTIPLIER: 1.5,
  
  GRIST_COST_FILL_CHASM: 10,
  
  COLORS: {
    SUCCESS: '#00ff00',
    ERROR: '#ff6666',
    GOLD: '#FFD700',
    PURPLE: '#6a5a7a',
    DARK_PURPLE: '#5a4a6a',
    DARKER_PURPLE: '#4a3a5a'
  }
};

export const ASPECT_COLORS = {
  space: '#000000',
  time: '#ff0000',
  breath: '#00d5f2',
  light: '#f2a400',
  heart: '#ff00ff',
  mind: '#008141',
  life: '#4ac925',
  doom: '#497e15',
  blood: '#a10000',
  rage: '#6a006a',
  void: '#0715cd',
  hope: '#ffffff',
};

export const CHARACTER_ASPECTS = {
  opal: 'space',
  alexis: 'rage',
  tyson: 'doom',
  chloe: 'life',
  isabell: 'blood',
  nicholas: 'light',
  austine: 'mind',
  victor: 'time',
};

export const DEFAULT_ASPECT = 'void';

export const getInteractionRange = () => GAME_CONSTANTS.TILE_SIZE * GAME_CONSTANTS.INTERACTION_RANGE_MULTIPLIER;

export const getCharacterAspect = (characterId) => CHARACTER_ASPECTS[characterId] || DEFAULT_ASPECT;

export const getAspectColor = (aspect) => ASPECT_COLORS[aspect] || ASPECT_COLORS[DEFAULT_ASPECT];

export const getCharacterAspectColor = (characterId) => {
  const aspect = getCharacterAspect(characterId);
  return getAspectColor(aspect);
};
