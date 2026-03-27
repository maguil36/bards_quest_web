export const CHARACTER_QUESTS = {
  austine: {
    name: "Austine's Quest",
    steps: [
      {
        id: 'austine_1',
        name: 'Talk to Austine',
        description: 'Find and talk to Austine',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'austine' },
        unlockPlayable: null
      },
      {
        id: 'austine_2',
        name: 'Ask to switch to Austine',
        description: 'Ask Austine if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'austine', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'austine_3',
        name: 'Obtain necessary item',
        description: 'Tyson must find the necessary item',
        characterRequired: 'tyson',
        checkType: 'item',
        checkData: { item: 'necessary_item' },
        unlockPlayable: null
      },
      {
        id: 'austine_4',
        name: 'Give to Austine',
        description: 'Tyson must deliver the item to Austine',
        characterRequired: 'tyson',
        checkType: 'give_item',
        checkData: { item: 'necessary_item', recipient: 'austine' },
        unlockPlayable: 'austine'
      },
      {
        id: 'austine_5',
        name: "Obtain information on queen's location",
        description: 'Austine must get intel about the Black Queen',
        characterRequired: 'austine',
        checkType: 'item',
        checkData: { item: 'queen_map' },
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  isabela: {
    name: "Isabela's Quest",
    steps: [
      {
        id: 'isabela_1',
        name: 'Talk to Isabela',
        description: 'Find and talk to Isabela',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'isabela' },
        unlockPlayable: null
      },
      {
        id: 'isabela_2',
        name: 'Ask to switch to Isabela',
        description: 'Ask Isabela if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'isabela', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'isabela_3',
        name: 'Talk to all characters',
        description: 'Talk to all 6 characters (6 out of 6)',
        characterRequired: null,
        checkType: 'talk_to_all',
        checkData: { count: 6 },
        unlockPlayable: 'isabela'
      },
      {
        id: 'isabela_4',
        name: 'Obtain a zillian zillium',
        description: 'Isabela must collect zillian zillium',
        characterRequired: 'isabela',
        checkType: 'item',
        checkData: { item: 'zillian_zillium' },
        unlockPlayable: null
      },
      {
        id: 'isabela_5',
        name: 'Upgrade weapon',
        description: 'Isabela must upgrade her weapon',
        characterRequired: 'isabela',
        checkType: 'weapon_upgrade',
        checkData: {},
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  alexis: {
    name: "Alexis's Quest",
    steps: [
      {
        id: 'alexis_1',
        name: 'Talk to Alexis',
        description: 'Find and talk to Alexis',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'alexis' },
        unlockPlayable: null
      },
      {
        id: 'alexis_2',
        name: 'Ask to switch to Alexis',
        description: 'Ask Alexis if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'alexis', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'alexis_3',
        name: 'Defeat 1 boss',
        description: 'Defeat DD, SS, HB, or CD',
        characterRequired: null,
        checkType: 'defeat_boss',
        checkData: { count: 1, bosses: ['dd', 'ss', 'hb', 'cd'] },
        unlockPlayable: 'alexis'
      },
      {
        id: 'alexis_4',
        name: 'Obtain more weapons',
        description: 'Alexis must collect all 6 weapons',
        characterRequired: 'alexis',
        checkType: 'collect_weapons',
        checkData: { count: 6 },
        unlockPlayable: null
      },
      {
        id: 'alexis_5',
        name: 'Defeat 1 boss',
        description: 'Alexis must defeat DD, SS, HB, or CD',
        characterRequired: 'alexis',
        checkType: 'defeat_boss',
        checkData: { count: 1, bosses: ['dd', 'ss', 'hb', 'cd'] },
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  nicholas: {
    name: "Nicholas's Quest",
    steps: [
      {
        id: 'nicholas_1',
        name: 'Talk to Nicholas',
        description: 'Find and talk to Nicholas',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'nicholas' },
        unlockPlayable: null
      },
      {
        id: 'nicholas_2',
        name: 'Ask to switch to Nicholas',
        description: 'Ask Nicholas if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'nicholas', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'nicholas_3',
        name: 'Win target mini game',
        description: 'Complete the mini game successfully',
        characterRequired: null,
        checkType: 'minigame',
        checkData: { score: 5 },
        unlockPlayable: 'nicholas'
      },
      {
        id: 'nicholas_4',
        name: 'Find lost guide book',
        description: "Nicholas must locate the lost guide book",
        characterRequired: 'nicholas',
        checkType: 'item',
        checkData: { item: 'guidebook' },
        unlockPlayable: null
      },
      {
        id: 'nicholas_5',
        name: 'Give to Austine',
        description: 'Nicholas must deliver the guide book to Austine',
        characterRequired: 'nicholas',
        checkType: 'give_item',
        checkData: { item: 'guidebook', recipient: 'austine' },
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  tyson: {
    name: "Tyson's Quest",
    steps: [
      {
        id: 'tyson_1',
        name: 'Talk to Tyson',
        description: 'Find and talk to Tyson',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'tyson' },
        unlockPlayable: null
      },
      {
        id: 'tyson_2',
        name: 'Ask Opal to switch to Tyson',
        description: 'Opal must ask to switch to Tyson',
        characterRequired: 'opal',
        checkType: 'dialogue',
        checkData: { character: 'tyson', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'tyson_3',
        name: "Complete Opal's quests",
        description: 'Opal must complete all her quests',
        characterRequired: 'opal',
        checkType: 'quest_complete',
        checkData: { quest: 'opal' },
        unlockPlayable: 'tyson'
      },
      {
        id: 'tyson_4',
        name: 'Talk to Austine',
        description: 'Tyson must talk to Austine',
        characterRequired: 'tyson',
        checkType: 'interaction',
        checkData: { character: 'austine' },
        unlockPlayable: null
      },
      {
        id: 'tyson_5',
        name: 'Enter combat against 1 boss',
        description: 'Tyson must enter combat with a boss',
        characterRequired: 'tyson',
        checkType: 'enter_boss_combat',
        checkData: { bosses: ['dd', 'ss', 'hb', 'cd'] },
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  chloe: {
    name: "Chloe's Quest",
    steps: [
      {
        id: 'chloe_1',
        name: 'Talk to Chloe',
        description: 'Find and talk to Chloe',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'chloe' },
        unlockPlayable: null
      },
      {
        id: 'chloe_2',
        name: 'Ask to switch to Chloe',
        description: 'Ask Chloe if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'chloe', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'chloe_3',
        name: 'Retrieve lost pet',
        description: 'Find and rescue the lost pet',
        characterRequired: null,
        checkType: 'item',
        checkData: { item: 'lost_pet' },
        unlockPlayable: 'chloe'
      },
      {
        id: 'chloe_4',
        name: 'Level up to 99',
        description: 'Chloe must reach level 99',
        characterRequired: 'chloe',
        checkType: 'level',
        checkData: { level: 99 },
        unlockPlayable: null
      },
      {
        id: 'chloe_5',
        name: 'Level up to 100',
        description: 'Chloe must reach level 100',
        characterRequired: 'chloe',
        checkType: 'level',
        checkData: { level: 100 },
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  opal: {
    name: "Opal's Quest",
    steps: [
      {
        id: 'opal_1',
        name: 'Talk to Austine',
        description: 'Opal must talk to Austine',
        characterRequired: 'opal',
        checkType: 'interaction',
        checkData: { character: 'austine' },
        unlockPlayable: null
      },
      {
        id: 'opal_2',
        name: 'Defeat 1 enemy',
        description: 'Opal must win a battle',
        characterRequired: 'opal',
        checkType: 'defeat_enemy',
        checkData: { count: 1 },
        unlockPlayable: null
      },
      {
        id: 'opal_3',
        name: 'Use all 5 fraymotifs',
        description: 'Opal must use each of the 5 fraymotifs in battle',
        characterRequired: 'opal',
        checkType: 'fraymotifs',
        checkData: { count: 5 },
        unlockPlayable: null
      },
      {
        id: 'opal_4',
        name: 'Talk again to Austine',
        description: 'Opal must return to talk to Austine',
        characterRequired: 'opal',
        checkType: 'interaction_count',
        checkData: { character: 'austine', count: 2 },
        unlockPlayable: null
      },
      {
        id: 'opal_5',
        name: 'Switch to a new character',
        description: 'Opal must switch to another character',
        characterRequired: 'opal',
        checkType: 'character_switch',
        checkData: {},
        unlockPlayable: null,
        completes: true
      }
    ]
  },

  victor: {
    name: "Victor's Quest",
    steps: [
      {
        id: 'victor_1',
        name: 'Talk to Victor',
        description: 'Find and talk to Victor',
        characterRequired: null,
        checkType: 'interaction',
        checkData: { character: 'victor' },
        unlockPlayable: null
      },
      {
        id: 'victor_2',
        name: 'Ask to switch to Victor',
        description: 'Ask Victor if you can switch to playing as them',
        characterRequired: null,
        checkType: 'dialogue',
        checkData: { character: 'victor', dialogueKey: 'ask_switch' },
        unlockPlayable: null
      },
      {
        id: 'victor_3',
        name: 'Finish all other quests',
        description: 'Complete all 7 character quest chains',
        characterRequired: null,
        checkType: 'all_quests_complete',
        checkData: { count: 7 },
        unlockPlayable: 'victor'
      },
      {
        id: 'victor_4',
        name: 'Switch to Victor',
        description: 'Switch to playing as Victor',
        characterRequired: null,
        checkType: 'character_switch',
        checkData: { character: 'victor' },
        unlockPlayable: null
      },
      {
        id: 'victor_5',
        name: 'Return to Skia',
        description: '(Bonus) Victor must return to Skia',
        characterRequired: 'victor',
        checkType: 'location',
        checkData: { location: 'skia' },
        unlockPlayable: null,
        completes: true,
        bonus: true
      }
    ]
  }
};

export const QUESTS = CHARACTER_QUESTS;
