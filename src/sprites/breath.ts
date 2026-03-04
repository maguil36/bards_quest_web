import type { SpriteConfig } from '../components/SpriteConfig.astro';

export interface BreathConfig extends SpriteConfig {
  type: 'breath';
  currentLevel: number;
  pov: string;
}

export const characterLevelNames: Record<string, string[]> = {
  alexis: [
    'Tantrum Tosser', 'Angry Ankle Biter', 'Grumpy Grabber', 'Pouty Pilferer', 'Cranky Collector',
    'Moody Marauder', 'Irritable Invader', 'Testy Taker', 'Furious Filcher', 'Wrathful Wanderer',
    'Hostile Hoarder', 'Aggressive Acquirer', 'Fierce Forager', 'Raging Raider', 'Violent Vulture',
    'Savage Scavenger', 'Brutal Brigand', 'Merciless Marauder', 'Ruthless Reaver', 'Vicious Vandal',
    'Relentless Ravager', 'Unstoppable Usurper', 'Fearsome Freebooter', 'Terrifying Tyrant', 'Dreadful Despoiler',
    'Catastrophic Conqueror', 'Apocalyptic Antagonist', 'Cataclysmic Catalyst', 'Devastating Demagogue', 'Annihilating Agitator',
    'Obliterating Oppressor', 'Eradicating Enforcer', 'Exterminating Executor', 'Consuming Chaos', 'Embodiment of Enmity',
    'Avatar of Animosity', 'Herald of Havoc', 'Harbinger of Hatred', 'Incarnation of Ire', 'Manifestation of Malice',
    'Vessel of Vengeance', 'Champion of Conflict', 'Paragon of Pandemonium', 'Exemplar of Extremity', 'Pinnacle of Provocation',
    'Apex Antagonist', 'Supreme Subjugator', 'Ultimate Usurper', 'Absolute Adversary', 'THIEF OF RAGE ASCENDANT'
  ],
  austine: [
    'Confused Calculator', 'Puzzled Ponderer', 'Baffled Bookworm', 'Perplexed Pupil', 'Stumped Scholar',
    'Bewildered Brain', 'Mystified Mathematician', 'Riddled Reasoner', 'Enigmatic Examiner', 'Cryptic Cogitator',
    'Logical Learner', 'Rational Researcher', 'Analytical Apprentice', 'Deductive Detective', 'Systematic Solver',
    'Methodical Mastermind', 'Strategic Savant', 'Tactical Theorist', 'Calculated Cognoscente', 'Precise Philosopher',
    'Brilliant Brainiac', 'Genius Gamemaster', 'Intellectual Innovator', 'Cerebral Champion', 'Mental Maestro',
    'Wisdom Wielder', 'Knowledge Keeper', 'Truth Tracker', 'Logic Lord', 'Reason Ruler',
    'Thought Tyrant', 'Cognition Commander', 'Perception Prince', 'Understanding Overlord', 'Comprehension Czar',
    'Enlightenment Emperor', 'Sagacity Sovereign', 'Acumen Archon', 'Insight Incarnate', 'Clarity Colossus',
    'Oracle of Order', 'Prophet of Patterns', 'Seer of Systems', 'Diviner of Decisions', 'Harbinger of Hypotheses',
    'Architect of Absolutes', 'Weaver of Wisdom', 'Master of Mentality', 'Transcendent Thinker', 'MAGE OF MIND ASCENDANT'
  ],
  chloe: [
    'Band-Aid Bandit', 'Boo-Boo Borrower', 'Ouchie Operator', 'Scrape Stealer', 'Bruise Burglar',
    'Healing Hobbyist', 'Wellness Wanderer', 'Recovery Rogue', 'Vitality Vagrant', 'Health Hustler',
    'Remedy Redistributor', 'Cure Collector', 'Triage Taker', 'Medicine Mover', 'Treatment Transferrer',
    'Life Liberator', 'Energy Equalizer', 'Vigor Vigilante', 'Essence Exchanger', 'Vitality Vindicator',
    'Growth Guardian', 'Bloom Bringer', 'Flourish Facilitator', 'Prosperity Purveyor', 'Abundance Advocate',
    'Renewal Reaver', 'Regeneration Rogue', 'Restoration Rebel', 'Revival Raider', 'Resurrection Redistributor',
    'Salvation Savant', 'Deliverance Dealer', 'Preservation Protector', 'Conservation Champion', 'Sustenance Sovereign',
    'Existence Executor', 'Being Benefactor', 'Living Legend', 'Breath Bringer', 'Pulse Provider',
    'Heartbeat Herald', 'Lifeblood Liberator', 'Soul Sustainer', 'Spirit Shepherd', 'Essence Emissary',
    'Avatar of Altruism', 'Paragon of Preservation', 'Exemplar of Existence', 'Pinnacle of Prosperity', 'ROGUE OF LIFE ASCENDANT'
  ],
  isabela: [
    'Friendship Fixer', 'Buddy Builder', 'Pal Patcher', 'Chum Channeler', 'Amigo Assembler',
    'Bond Braider', 'Connection Crafter', 'Relation Restorer', 'Tie Tightener', 'Link Lifter',
    'Unity Understander', 'Harmony Helper', 'Cooperation Cultivator', 'Alliance Architect', 'Partnership Planner',
    'Team Therapist', 'Group Gardener', 'Collective Coordinator', 'Synergy Sylph', 'Cohesion Creator',
    'Brotherhood Binder', 'Kinship Keeper', 'Fellowship Forger', 'Camaraderie Conductor', 'Solidarity Shaper',
    'Loyalty Luminary', 'Devotion Director', 'Fidelity Facilitator', 'Allegiance Architect', 'Commitment Commander',
    'Blood Binder', 'Lineage Lifter', 'Heritage Healer', 'Ancestry Amplifier', 'Legacy Lifegiver',
    'Covenant Crafter', 'Pact Perfecter', 'Oath Orchestrator', 'Vow Vindicator', 'Promise Preserver',
    'Destiny Definer', 'Fate Facilitator', 'Paradox Parent', 'Timeline Tender', 'Ectobiology Expert',
    'Genesis Guardian', 'Origin Overseer', 'Creation Conductor', 'Existence Engineer', 'SYLPH OF BLOOD ASCENDANT'
  ],
  nicholas: [
    'Unlucky Underdog', 'Fumbling Fool', 'Clumsy Catastrophe', 'Bumbling Buffoon', 'Stumbling Simpleton',
    'Ignorant Igniter', 'Oblivious Obliterator', 'Clueless Crusher', 'Unaware Undoer', 'Blind Breaker',
    'Misfortune Maker', 'Calamity Caller', 'Disaster Dealer', 'Mishap Merchant', 'Accident Architect',
    'Darkness Dealer', 'Shadow Striker', 'Gloom Gladiator', 'Murk Marauder', 'Obscurity Operative',
    'Dimness Destroyer', 'Blackout Brawler', 'Eclipse Enforcer', 'Void Vanquisher', 'Absence Annihilator',
    'Ignorance Incarnate', 'Stupidity Slayer', 'Folly Fighter', 'Delusion Destroyer', 'Illusion Ender',
    'Knowledge Killer', 'Wisdom Wrecker', 'Truth Terminator', 'Clarity Crusher', 'Understanding Undoer',
    'Light Leech', 'Radiance Reaper', 'Brilliance Banisher', 'Luminance Liquidator', 'Fortune Feller',
    'Luck Liquidator', 'Chance Canceller', 'Probability Purger', 'Destiny Destroyer', 'Fate Fragmenter',
    'Doom Dealer', 'Ruin Renderer', 'Catastrophe King', 'Apocalypse Architect', 'PRINCE OF LIGHT ASCENDANT'
  ],
  opal: [
    'Pebble Protector', 'Rock Rookie', 'Stone Student', 'Boulder Beginner', 'Gravel Guardian',
    'Space Squire', 'Dimension Defender', 'Void Vigilante', 'Cosmos Cadet', 'Universe Understudy',
    'Gravity Grappler', 'Orbit Organizer', 'Planet Protector', 'Celestial Sentinel', 'Stellar Shield',
    'Spatial Safeguard', 'Dimensional Defender', 'Expanse Enforcer', 'Vastness Vanguard', 'Infinity Infantry',
    'Frog Farmer', 'Tadpole Tender', 'Amphibian Attendant', 'Genesis Gardener', 'Creation Cultivator',
    'Balance Bringer', 'Equilibrium Enforcer', 'Harmony Holder', 'Stability Steward', 'Symmetry Sentinel',
    'Bulwark of Being', 'Rampart of Reality', 'Bastion of Boundaries', 'Fortress of Form', 'Citadel of Creation',
    'Aegis of Atoms', 'Ward of Worlds', 'Guardian of Galaxies', 'Protector of Planes', 'Keeper of Cosmos',
    'Universe Architect', 'Reality Renderer', 'Existence Engineer', 'Creation Commander', 'Genesis General',
    'Space Sovereign', 'Dimension Deity', 'Cosmos Colossus', 'Infinity Incarnate', 'KNIGHT OF SPACE ASCENDANT'
  ],
  tyson: [
    'Ouchie Apprentice', 'Boo-Boo Boy', 'Scraped Knee Kid', 'Bruised Beginner', 'Hurt Hatchling',
    'Pain Pupil', 'Suffering Student', 'Ache Amateur', 'Agony Apprentice', 'Misery Minor',
    'Damage Dabbler', 'Injury Initiate', 'Wound Wanderer', 'Harm Hobbyist', 'Affliction Acolyte',
    'Narcissist Novice', 'Self-Centered Seeker', 'Ego Explorer', 'Pride Practitioner', 'Vanity Voyager',
    'Sacrifice Shirker', 'Duty Dodger', 'Responsibility Runner', 'Obligation Avoider', 'Commitment Coward',
    'Late Bloomer', 'Delayed Developer', 'Slow Starter', 'Tardy Trainee', 'Postponed Pupil',
    'Potential Prisoner', 'Dormant Dreamer', 'Latent Learner', 'Hidden Hero', 'Buried Brave',
    'Awakening Warrior', 'Emerging Champion', 'Rising Redeemer', 'Growing Guardian', 'Developing Defender',
    'Sacrifice Seeker', 'Selfless Soldier', 'Altruist Ascendant', 'Martyr Manifest', 'Devoted Destroyer',
    'Doom Dealer', 'Fate Facilitator', 'End Embracer', 'Terminus Tender', 'PAGE OF DOOM ASCENDANT'
  ],
  victor: [
    'Tick-Tock Troublemaker', 'Clock Clown', 'Minute Mischief', 'Second Silly', 'Hour Hooligan',
    'Chaos Cadet', 'Mayhem Minor', 'Disorder Dabbler', 'Havoc Hobbyist', 'Pandemonium Pupil',
    'Wildcard Wanderer', 'Random Rascal', 'Unpredictable Urchin', 'Erratic Explorer', 'Volatile Vagrant',
    'Timeline Tangler', 'Paradox Prankster', 'Loop Lunatic', 'Causality Clown', 'Chronology Chaos',
    'Consequence Ignorer', 'Ripple Maker', 'Butterfly Botherer', 'Domino Disturber', 'Chain Changer',
    'Destiny Denier', 'Fate Fumbler', 'Future Forgetter', 'Past Perturber', 'Present Puzzler',
    'Time Twister', 'Moment Mangler', 'Duration Destroyer', 'Eternity Ender', 'Infinity Interrupter',
    'Chronos Challenger', 'Temporal Terror', 'Hourglass Horror', 'Clockwork Catastrophe', 'Timestream Tyrant',
    'Paradox Embracer', 'Chaos Conductor', 'Entropy Enabler', 'Disorder Deity', 'Anarchy Architect',
    'Destruction Dancer', 'Ruin Revelator', 'Apocalypse Artist', 'Oblivion Oracle', 'BARD OF TIME ASCENDANT'
  ],
  nix: [
    'Mystery Mumbler', 'Riddle Rambler', 'Enigma Enthusiast', 'Puzzle Prattler', 'Secret Speaker',
    'Unknown Unveiler', 'Hidden Herald', 'Obscure Orator', 'Cryptic Chatterer', 'Veiled Vocalist',
    'Void Vagabond', 'Emptiness Explorer', 'Nothingness Navigator', 'Absence Adventurer', 'Nullity Nomad',
    'Forgotten Finder', 'Lost Locator', 'Missing Mapper', 'Erased Explorer', 'Deleted Discoverer',
    'Truth Talker', 'Clarity Caller', 'Revelation Revealer', 'Exposure Expert', 'Disclosure Dealer',
    'Knowledge Keeper', 'Wisdom Wanderer', 'Understanding Unveiler', 'Insight Illuminator', 'Awareness Awakener',
    'Silence Shatterer', 'Quiet Queller', 'Hush Harbinger', 'Stillness Stopper', 'Peace Perturber',
    'Void Vocalist', 'Emptiness Enabler', 'Nothingness Narrator', 'Absence Advocate', 'Nullification Noble',
    'Oblivion Oracle', 'Erasure Emissary', 'Deletion Deity', 'Removal Revealer', 'Negation Noble',
    'Chaos Conductor', 'Entropy Enabler', 'Disorder Deity', 'Destruction Dancer', 'BARD OF VOID ASCENDANT'
  ],
  alice: [
    'Tantrum Thinker', 'Angry Analyst', 'Furious Philosopher', 'Irate Intellectual', 'Mad Mage',
    'Rage Researcher', 'Wrath Witness', 'Fury Finder', 'Ire Inspector', 'Anger Apprentice',
    'Lie Detector', 'Falsehood Finder', 'Deception Discoverer', 'Untruth Uncoverer', 'Fabrication Ferreter',
    'Truth Tracker', 'Honesty Hunter', 'Veracity Vigilante', 'Reality Revealer', 'Fact Finder',
    'Misconception Mauler', 'Delusion Destroyer', 'Illusion Ender', 'Fantasy Feller', 'Dream Demolisher',
    'Clarity Crusader', 'Understanding Unleashed', 'Comprehension Champion', 'Awareness Advocate', 'Insight Incarnate',
    'Passion Prophet', 'Intensity Incarnate', 'Fervor Facilitator', 'Zeal Zealot', 'Ardor Architect',
    'Rage Ruler', 'Fury Facilitator', 'Wrath Wielder', 'Anger Architect', 'Ire Incarnate',
    'Truth Tyrant', 'Reality Ruler', 'Honesty Herald', 'Veracity Vessel', 'Fact Facilitator',
    'Enlightenment Enforcer', 'Revelation Ruler', 'Exposure Emperor', 'Disclosure Deity', 'MAGE OF RAGE ASCENDANT'
  ],
  audrey: [
    'Doom Dodger', 'Fate Fumbler', 'Destiny Denier', 'End Evader', 'Ruin Runner',
    'Destruction Dabbler', 'Catastrophe Challenger', 'Disaster Defier', 'Calamity Contester', 'Apocalypse Avoider',
    'Rebel Rookie', 'Defiant Dabbler', 'Insurgent Initiate', 'Revolutionary Recruit', 'Mutineer Minor',
    'Inevitability Ignorer', 'Certainty Challenger', 'Guarantee Grappler', 'Assurance Antagonist', 'Promise Perturber',
    'Death Delayer', 'Demise Deferrer', 'Ending Extender', 'Terminus Temporizer', 'Finale Forestaller',
    'Fate Fragmenter', 'Destiny Disruptor', 'Fortune Foiler', 'Kismet Killer', 'Wyrd Wrecker',
    'Doom Defier', 'Ruin Resister', 'Destruction Denier', 'Annihilation Antagonist', 'Obliteration Opposer',
    'Reality Rebel', 'Existence Enforcer', 'Being Bender', 'Life Liberator', 'Survival Sovereign',
    'Witch of Warding', 'Sorceress of Salvation', 'Enchantress of Endurance', 'Magician of Mercy', 'Spellcaster of Survival',
    'Doom Dominator', 'Fate Facilitator', 'Destiny Deity', 'End Empress', 'WITCH OF DOOM ASCENDANT'
  ],
  clayton: [
    'Thoughtful Toddler', 'Pensive Pupil', 'Contemplative Child', 'Reflective Rookie', 'Meditative Minor',
    'Logic Learner', 'Reason Rookie', 'Rational Recruit', 'Sensible Student', 'Practical Pupil',
    'Emotion Explorer', 'Feeling Finder', 'Sentiment Seeker', 'Passion Pupil', 'Heart Hunter',
    'Balance Beginner', 'Equilibrium Explorer', 'Harmony Hunter', 'Symmetry Seeker', 'Parity Pupil',
    'Decision Dabbler', 'Choice Challenger', 'Option Observer', 'Selection Student', 'Pick Practitioner',
    'Mind Master', 'Thought Theorist', 'Cognition Commander', 'Intellect Inspector', 'Brain Bringer',
    'Wisdom Wielder', 'Knowledge Keeper', 'Understanding Understander', 'Comprehension Champion', 'Awareness Architect',
    'Team Thinker', 'Group Genius', 'Collective Cognoscente', 'Unity Understander', 'Alliance Analyst',
    'Destiny Decider', 'Fate Facilitator', 'Fortune Finder', 'Kismet Keeper', 'Wyrd Wielder',
    'Mind Monarch', 'Thought Tyrant', 'Cognition Czar', 'Intellect Incarnate', 'HEIR OF MIND ASCENDANT'
  ],
  irene: [
    'Bond Beginner', 'Tie Toddler', 'Link Learner', 'Connection Cadet', 'Relation Rookie',
    'Friendship Fixer', 'Buddy Builder', 'Pal Patcher', 'Chum Channeler', 'Amigo Assembler',
    'Unity Understander', 'Harmony Helper', 'Cooperation Cultivator', 'Alliance Architect', 'Partnership Planner',
    'Team Tender', 'Group Gardener', 'Collective Caretaker', 'Synergy Servant', 'Cohesion Creator',
    'Blood Binder', 'Kinship Keeper', 'Brotherhood Builder', 'Sisterhood Sustainer', 'Family Facilitator',
    'Loyalty Lifter', 'Devotion Developer', 'Fidelity Fosterer', 'Allegiance Architect', 'Commitment Cultivator',
    'Bond Bringer', 'Connection Conductor', 'Relation Renderer', 'Tie Tightener', 'Link Lifegiver',
    'Unity Upholder', 'Solidarity Sovereign', 'Togetherness Tyrant', 'Cohesion Commander', 'Harmony Herald',
    'Survival Sustainer', 'Endurance Enabler', 'Persistence Provider', 'Resilience Renderer', 'Fortitude Facilitator',
    'Blood Sovereign', 'Kinship Keeper', 'Brotherhood Bringer', 'Unity Incarnate', 'MAID OF BLOOD ASCENDANT'
  ],
  trenton: [
    'Breeze Beginner', 'Wind Watcher', 'Gust Gazer', 'Zephyr Zealot', 'Draft Dabbler',
    'Freedom Finder', 'Liberty Learner', 'Independence Inspector', 'Autonomy Apprentice', 'Emancipation Explorer',
    'Connection Contemplator', 'Bond Beholder', 'Tie Tracker', 'Link Looker', 'Relation Reader',
    'Vision Voyager', 'Sight Seeker', 'Perception Pupil', 'Observation Operator', 'Awareness Apprentice',
    'Insight Inspector', 'Understanding Understander', 'Comprehension Contemplator', 'Clarity Caller', 'Lucidity Learner',
    'Change Champion', 'Transformation Tracker', 'Shift Seer', 'Alteration Analyst', 'Modification Monitor',
    'Wind Wielder', 'Breeze Bringer', 'Gale Guide', 'Storm Steerer', 'Tempest Tender',
    'Guide Giver', 'Direction Dealer', 'Path Provider', 'Way Wielder', 'Route Renderer',
    'Breath Bringer', 'Air Architect', 'Atmosphere Advocate', 'Oxygen Oracle', 'Wind Wisdom',
    'Freedom Facilitator', 'Liberty Lord', 'Independence Incarnate', 'Autonomy Ascendant', 'SEER OF BREATH ASCENDANT'
  ],
  vettia: [
    'Hope Hobbyist', 'Dream Dabbler', 'Wish Wanderer', 'Aspiration Amateur', 'Desire Discoverer',
    'Optimism Operator', 'Positivity Pupil', 'Brightness Beginner', 'Cheer Challenger', 'Joy Journeyer',
    'Compassion Cadet', 'Kindness Keeper', 'Mercy Minor', 'Sympathy Student', 'Empathy Explorer',
    'Nurture Novice', 'Care Cultivator', 'Tend Trainee', 'Foster Facilitator', 'Cherish Champion',
    'Heal Helper', 'Mend Maker', 'Cure Crafter', 'Remedy Renderer', 'Recovery Restorer',
    'Inspire Initiator', 'Motivate Maker', 'Encourage Enabler', 'Uplift Understander', 'Embolden Engineer',
    'Resilience Renderer', 'Fortitude Facilitator', 'Endurance Enabler', 'Persistence Provider', 'Tenacity Tender',
    'Despair Defeater', 'Darkness Destroyer', 'Gloom Grappler', 'Sorrow Slayer', 'Misery Mauler',
    'Hope Herald', 'Dream Deity', 'Wish Wielder', 'Aspiration Architect', 'Desire Divinity',
    'Belief Bringer', 'Faith Facilitator', 'Trust Tyrant', 'Conviction Commander', 'SYLPH OF HOPE ASCENDANT'
  ],
  octavian: [
    'Emotion Embezzler', 'Feeling Filcher', 'Sentiment Stealer', 'Passion Pilferer', 'Heart Hustler',
    'Connection Collector', 'Bond Burglar', 'Tie Taker', 'Link Looter', 'Relation Raider',
    'Trait Thief', 'Quality Quester', 'Attribute Acquirer', 'Characteristic Collector', 'Feature Filcher',
    'Manipulation Master', 'Cunning Collector', 'Scheming Stealer', 'Plotting Pilferer', 'Devious Dealer',
    'Identity Invader', 'Self Stealer', 'Ego Embezzler', 'Persona Pilferer', 'Character Collector',
    'Soul Siphoner', 'Essence Extractor', 'Spirit Stealer', 'Core Collector', 'Being Burglar',
    'Perfection Pursuer', 'Excellence Extractor', 'Superiority Seeker', 'Supremacy Stealer', 'Pinnacle Pilferer',
    'Ultimate Usurper', 'Absolute Acquirer', 'Supreme Stealer', 'Paramount Pilferer', 'Apex Appropriator',
    'Heart Harvester', 'Soul Sovereign', 'Essence Emperor', 'Identity Incarnate', 'Self Supreme',
    'Perfection Personified', 'Excellence Embodied', 'Superiority Sovereign', 'Ultimate Usurper', 'THIEF OF HEART ASCENDANT'
  ],
  okwos: [
    'Secret Squire', 'Mystery Minor', 'Enigma Enthusiast', 'Riddle Rookie', 'Puzzle Pupil',
    'Hidden Helper', 'Obscure Operator', 'Veiled Vigilante', 'Shrouded Sentinel', 'Cloaked Cadet',
    'Unknown Understander', 'Forgotten Finder', 'Lost Locator', 'Missing Monitor', 'Erased Explorer',
    'Void Vigilante', 'Emptiness Enforcer', 'Nothingness Navigator', 'Absence Advocate', 'Nullity Noble',
    'Obscurity Operative', 'Darkness Defender', 'Shadow Sentinel', 'Murk Monitor', 'Gloom Guardian',
    'Secret Safeguard', 'Mystery Maintainer', 'Enigma Enforcer', 'Riddle Resolver', 'Puzzle Protector',
    'Shield of Shadows', 'Ward of Whispers', 'Bulwark of Blackness', 'Rampart of Riddles', 'Bastion of Blindness',
    'Guardian of Gaps', 'Keeper of Cracks', 'Protector of Paradox', 'Defender of Deletion', 'Sentinel of Silence',
    'Void Vanguard', 'Emptiness Emperor', 'Nothingness Noble', 'Absence Archon', 'Nullification Knight',
    'Obscurity Overlord', 'Mystery Monarch', 'Enigma Emperor', 'Secret Sovereign', 'KNIGHT OF VOID ASCENDANT'
  ],
  gwenhas: [
    'Space Snatcher', 'Dimension Dabbler', 'Area Appropriator', 'Zone Zealot', 'Region Rookie',
    'Distance Dealer', 'Expanse Explorer', 'Vastness Vagrant', 'Breadth Burglar', 'Width Wanderer',
    'Bend Beginner', 'Warp Wanderer', 'Twist Taker', 'Curve Collector', 'Fold Filcher',
    'Spatial Stealer', 'Dimensional Dealer', 'Geometric Grifter', 'Topological Thief', 'Manifold Marauder',
    'Resource Redistributor', 'Asset Appropriator', 'Wealth Wanderer', 'Treasure Transferrer', 'Bounty Burglar',
    'Team Tactician', 'Group Grifter', 'Collective Collector', 'Unity Usurper', 'Alliance Appropriator',
    'Frog Farmer', 'Tadpole Tender', 'Amphibian Attendant', 'Genesis Gardener', 'Creation Cultivator',
    'Space Shaper', 'Dimension Definer', 'Reality Renderer', 'Existence Engineer', 'Universe Understander',
    'Cosmos Crafter', 'Galaxy Gardener', 'Stellar Stealer', 'Celestial Collector', 'Astral Appropriator',
    'Space Sovereign', 'Dimension Deity', 'Reality Ruler', 'Existence Empress', 'ROGUE OF SPACE ASCENDANT'
  ],
  redacted: [
    'Doom Detector', 'Ruin Reader', 'Destruction Diviner', 'Catastrophe Caller', 'Disaster Discoverer',
    'End Examiner', 'Finale Finder', 'Terminus Tracker', 'Conclusion Contemplator', 'Cessation Seer',
    'Vision Voyager', 'Sight Seeker', 'Perception Pupil', 'Observation Operator', 'Awareness Apprentice',
    'Despair Diviner', 'Misery Monitor', 'Sorrow Seer', 'Anguish Analyst', 'Agony Augur',
    'Inevitability Inspector', 'Certainty Caller', 'Guarantee Gazer', 'Assurance Analyst', 'Promise Prophet',
    'Preparation Provider', 'Readiness Renderer', 'Anticipation Architect', 'Foresight Facilitator', 'Planning Prophet',
    'Guide Giver', 'Direction Dealer', 'Path Provider', 'Way Wielder', 'Route Renderer',
    'Mitigation Master', 'Reduction Ruler', 'Lessening Lord', 'Diminishment Deity', 'Decrease Divinity',
    'Doom Diviner', 'Fate Forecaster', 'Destiny Detector', 'End Oracle', 'Ruin Revelator',
    'Destruction Deity', 'Catastrophe Colossus', 'Disaster Divinity', 'Apocalypse Archon', 'SEER OF DOOM ASCENDANT'
  ],
  dhesas: [
    'Second Snatcher', 'Minute Moocher', 'Hour Hustler', 'Day Dabbler', 'Week Wanderer',
    'Time Taker', 'Moment Mover', 'Instant Invader', 'Duration Dealer', 'Period Pilferer',
    'Survival Seeker', 'Endurance Explorer', 'Persistence Pupil', 'Resilience Rookie', 'Fortitude Finder',
    'Stolen Seconds', 'Borrowed Breaths', 'Reclaimed Rhythms', 'Appropriated Ages', 'Filched Futures',
    'Timeline Taker', 'Chronology Collector', 'Sequence Stealer', 'Order Obtainer', 'Succession Snatcher',
    'Consequence Confronter', 'Ripple Reader', 'Effect Examiner', 'Result Resolver', 'Outcome Observer',
    'Alteration Artist', 'Change Champion', 'Modification Master', 'Transformation Thief', 'Shift Stealer',
    'Fragility Fighter', 'Delicacy Dealer', 'Brittleness Bringer', 'Weakness Wielder', 'Vulnerability Victor',
    'Existence Extender', 'Being Borrower', 'Life Lengthener', 'Survival Sovereign', 'Endurance Emperor',
    'Time Tyrant', 'Chronology Commander', 'Moment Monarch', 'Duration Deity', 'THIEF OF TIME ASCENDANT'
  ],
  default: [
    'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5',
    'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10',
    'Level 11', 'Level 12', 'Level 13', 'Level 14', 'Level 15',
    'Level 16', 'Level 17', 'Level 18', 'Level 19', 'Level 20',
    'Level 21', 'Level 22', 'Level 23', 'Level 24', 'Level 25',
    'Level 26', 'Level 27', 'Level 28', 'Level 29', 'Level 30',
    'Level 31', 'Level 32', 'Level 33', 'Level 34', 'Level 35',
    'Level 36', 'Level 37', 'Level 38', 'Level 39', 'Level 40',
    'Level 41', 'Level 42', 'Level 43', 'Level 44', 'Level 45',
    'Level 46', 'Level 47', 'Level 48', 'Level 49', 'Level 50'
  ]
};

const characterLevels: Record<string, number> = {};

export function setCharacterLevel(character: string, level: number): void {
  characterLevels[character.toLowerCase()] = level;
}

export function getCharacterLevel(character: string): number {
  return characterLevels[character.toLowerCase()] || 1;
}

export function getLevelName(character: string, level: number): string {
  const names = characterLevelNames[character.toLowerCase()] || characterLevelNames.default;
  return names[level - 1] || `Level ${level}`;
}

export function createBreathConfig(levelOrPov: number | string, pov?: string): BreathConfig {
  let actualLevel: number;
  let actualPov: string;

  if (typeof levelOrPov === 'string') {
    actualPov = levelOrPov.toLowerCase();
    actualLevel = getCharacterLevel(actualPov);
  } else {
    actualLevel = levelOrPov;
    if (pov) {
      actualPov = pov.toLowerCase();
      setCharacterLevel(actualPov, actualLevel);
    } else {
      actualPov = '';
    }
  }

  return {
    type: 'breath',
    currentLevel: actualLevel,
    pov: actualPov
  };
}

export const breathSprite = (config: BreathConfig): string => {
  return '';
};
