export const QUESTS = {
  talk_to_austine: {
    name: 'Talk to Austine',
    description: 'Find and talk to Austine',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_austine: {
    name: 'Ask to switch to Austine',
    description: 'Ask Austine if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_austine',
    unlockPlayable: null
  },
  
  obtain_grist: {
    name: 'Obtain necessary grist',
    description: 'Collect the grist needed for crafting',
    characterSpecific: null,
    prerequisite: 'ask_switch_austine',
    unlockPlayable: null
  },
  
  obtain_item_tyson: {
    name: 'Obtain necessary item',
    description: 'Find the item needed for Isabela',
    characterSpecific: 'tyson',
    prerequisite: 'obtain_grist',
    unlockPlayable: null
  },
  
  give_to_isabela: {
    name: 'Give to Isabela',
    description: 'Deliver the item to Isabela',
    characterSpecific: 'tyson',
    prerequisite: 'obtain_item_tyson',
    unlockPlayable: null
  },
  
  isabela_create_items: {
    name: 'Have Isabela create necessary items',
    description: 'Wait for Isabela to craft the items',
    characterSpecific: 'tyson',
    prerequisite: 'give_to_isabela',
    unlockPlayable: null
  },
  
  give_to_austine_tyson: {
    name: 'Give to Austine',
    description: 'Deliver the crafted items to Austine',
    characterSpecific: 'tyson',
    prerequisite: 'isabela_create_items',
    unlockPlayable: 'austine'
  },
  
  queen_location_austine: {
    name: "Obtain information on queen's location",
    description: 'Get intel about the Black Queen',
    characterSpecific: 'austine',
    prerequisite: 'give_to_austine_tyson',
    unlockPlayable: null
  },
  
  talk_to_isabela: {
    name: 'Talk to Isabela',
    description: 'Find and talk to Isabela',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_isabela: {
    name: 'Ask to switch to Isabela',
    description: 'Ask Isabela if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_isabela',
    unlockPlayable: null
  },
  
  talk_to_all: {
    name: 'Talk to all characters',
    description: 'Talk to all 7 characters (7 out of 7)',
    characterSpecific: null,
    prerequisite: 'ask_switch_isabela',
    unlockPlayable: 'isabela'
  },
  
  obtain_zillium: {
    name: 'Obtain zillium',
    description: 'Collect zillium for weapon upgrade',
    characterSpecific: 'isabela',
    prerequisite: 'talk_to_all',
    unlockPlayable: null
  },
  
  upgrade_weapon: {
    name: 'Upgrade weapon',
    description: 'Use zillium to upgrade your weapon',
    characterSpecific: 'isabela',
    prerequisite: 'obtain_zillium',
    unlockPlayable: null
  },
  
  talk_to_alexis: {
    name: 'Talk to Alexis',
    description: 'Find and talk to Alexis',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_alexis: {
    name: 'Ask to switch to Alexis',
    description: 'Ask Alexis if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_alexis',
    unlockPlayable: null
  },
  
  defeat_archagent: {
    name: 'Defeat 1 Derse Archagent',
    description: 'Defeat an archagent in combat',
    characterSpecific: null,
    prerequisite: 'ask_switch_alexis',
    unlockPlayable: 'alexis'
  },
  
  obtain_weapons: {
    name: 'Obtain more weapons',
    description: 'Collect all 6 weapons (6 out of 6)',
    characterSpecific: 'alexis',
    prerequisite: 'defeat_archagent',
    unlockPlayable: null
  },
  
  defeat_boss_alexis: {
    name: 'Defeat 1 boss',
    description: 'Defeat DD, SS, HB, or CB',
    characterSpecific: 'alexis',
    prerequisite: 'obtain_weapons',
    unlockPlayable: null
  },
  
  talk_to_nicholas: {
    name: 'Talk to Nicholas',
    description: 'Find and talk to Nicholas',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_nicholas: {
    name: 'Ask to switch to Nicholas',
    description: 'Ask Nicholas if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_nicholas',
    unlockPlayable: null
  },
  
  win_minigame: {
    name: 'Win target mini game',
    description: 'Complete the mini game successfully',
    characterSpecific: null,
    prerequisite: 'ask_switch_nicholas',
    unlockPlayable: 'nicholas'
  },
  
  find_guidebook: {
    name: 'Find lost guide book',
    description: "Locate Nicholas's lost guide book",
    characterSpecific: 'nicholas',
    prerequisite: 'win_minigame',
    unlockPlayable: null
  },
  
  give_to_austine_nicholas: {
    name: 'Give to Austine',
    description: 'Deliver the guide book to Austine',
    characterSpecific: 'nicholas',
    prerequisite: 'find_guidebook',
    unlockPlayable: null
  },
  
  talk_to_tyson: {
    name: 'Talk to Tyson',
    description: 'Find and talk to Tyson',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_tyson: {
    name: 'Ask to switch to Tyson',
    description: 'Ask Tyson if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_tyson',
    unlockPlayable: null
  },
  
  opal_ask_tyson: {
    name: 'Have Opal ask to switch to Tyson',
    description: 'Opal must ask to switch to Tyson',
    characterSpecific: 'opal',
    prerequisite: 'ask_switch_tyson',
    unlockPlayable: 'tyson'
  },
  
  talk_to_austine_tyson: {
    name: 'Talk to Austine',
    description: 'Talk to Austine as Tyson',
    characterSpecific: 'tyson',
    prerequisite: 'opal_ask_tyson',
    unlockPlayable: null
  },
  
  enter_combat_boss: {
    name: 'Enter into combat against 1 boss',
    description: 'Fight against a boss',
    characterSpecific: 'tyson',
    prerequisite: 'talk_to_austine_tyson',
    unlockPlayable: null
  },
  
  talk_to_chloe: {
    name: 'Talk to Chloe',
    description: 'Find and talk to Chloe',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_chloe: {
    name: 'Ask to switch to Chloe',
    description: 'Ask Chloe if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_chloe',
    unlockPlayable: null
  },
  
  retrieve_lost_pet: {
    name: 'Retrieve lost pet',
    description: 'Find and rescue the lost pet',
    characterSpecific: null,
    prerequisite: 'ask_switch_chloe',
    unlockPlayable: 'chloe'
  },
  
  level_up_archagent: {
    name: 'Level up by defeating 1 archagent',
    description: 'Gain experience from defeating an archagent',
    characterSpecific: 'chloe',
    prerequisite: 'retrieve_lost_pet',
    unlockPlayable: null
  },
  
  level_up_boss: {
    name: 'Level up again by defeating 1 boss',
    description: 'Defeat DD, SS, HB, or CB to level up',
    characterSpecific: 'chloe',
    prerequisite: 'level_up_archagent',
    unlockPlayable: null
  },
  
  talk_to_victor: {
    name: 'Talk to Victor',
    description: 'Find and talk to Victor',
    characterSpecific: null,
    prerequisite: null,
    unlockPlayable: null
  },
  
  ask_switch_victor: {
    name: 'Ask to switch to Victor',
    description: 'Ask Victor if you can switch to playing as them',
    characterSpecific: null,
    prerequisite: 'talk_to_victor',
    unlockPlayable: null
  },
  
  finish_all_quests: {
    name: 'Finish all other quests',
    description: 'Complete all 7 character quest chains',
    characterSpecific: null,
    prerequisite: 'ask_switch_victor',
    unlockPlayable: 'victor'
  },
  
  play_victor_ending: {
    name: 'Play as Victor to end game',
    description: 'Complete the game as Victor',
    characterSpecific: 'victor',
    prerequisite: 'finish_all_quests',
    unlockPlayable: null
  },
  
  talk_to_austine_opal: {
    name: 'Talk to Austine',
    description: 'Talk to Austine as Opal',
    characterSpecific: 'opal',
    prerequisite: null,
    unlockPlayable: null
  },
  
  defeat_enemy_opal: {
    name: 'Defeat 1 enemy',
    description: 'Win a battle as Opal',
    characterSpecific: 'opal',
    prerequisite: 'talk_to_austine_opal',
    unlockPlayable: null
  },
  
  use_all_fraymotifs: {
    name: 'Use all 5 fraymotifs',
    description: 'Use each of the 5 fraymotifs in battle',
    characterSpecific: 'opal',
    prerequisite: 'defeat_enemy_opal',
    unlockPlayable: null
  }
};
