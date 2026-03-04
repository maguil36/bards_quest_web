/**
 * Space Aspect Sprite Configuration
 *
 * This file defines the sprite behavior for the Space aspect.
 *
 * SPACE IMAGES:
 * - 'Derse': The dark moon
 * - 'Prospit': The golden moon
 * - 'Skaia': The battlefield
 * - 'Earth': The home planet
 * - 'LOXAY1' through 'LOXAY9': Land of X and Y (9 different lands)
 * - 'NaN': Black circle (default, no image)
 *
 * CONFIGURATION:
 * Use createSpaceConfig(imageName) to set which image to display
 *
 * EXAMPLES:
 *
 * 1. Show Derse:
 *    space: createSpaceConfig('Derse')
 *
 * 2. Show Earth:
 *    space: createSpaceConfig('Earth')
 *
 * 3. Show a specific land:
 *    space: createSpaceConfig('LOXAY3')
 *
 * 4. Show black circle (default):
 *    space: spaceSprite
 *    // or
 *    space: createSpaceConfig('NaN')
 */

// Map of image names to their file paths
const spaceImagePaths: Record<string, string> = {
  'Derse': '/images/space/derse.svg',
  'Prospit': '/images/space/prospit.svg',
  'Skaia': '/images/space/skaia.svg',
  'Earth': '/images/space/earth.svg',
  'LOXAY1': '/images/space/loxay1.svg',
  'LOXAY2': '/images/space/loxay2.svg',
  'LOXAY3': '/images/space/loxay3.svg',
  'LOXAY4': '/images/space/loxay4.svg',
  'LOXAY5': '/images/space/loxay5.svg',
  'LOXAY6': '/images/space/loxay6.svg',
  'LOXAY7': '/images/space/loxay7.svg',
  'LOXAY8': '/images/space/loxay8.svg',
  'LOXAY9': '/images/space/loxay9.svg',
  'NaN': '/images/space/nan.svg'
};

export type SpaceImageName = keyof typeof spaceImagePaths;

/**
 * Helper function to load SVG content from file path
 */
async function loadSVG(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    return await response.text();
  } catch (error) {
    console.error(`Failed to load SVG from ${path}:`, error);
    return `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
      <circle cx='36' cy='36' r='32' fill='%23000000'/>
    </svg>`;
  }
}

/**
 * Default space sprite (black circle)
 * This is a synchronous fallback - use createSpaceConfig for actual images
 */
export const spaceSprite = {
  type: 'static',
  svg: `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
  <circle cx='36' cy='36' r='32' fill='%23000000'/>
</svg>`
};

/**
 * Planet data structure containing names and descriptions for all 16 characters
 */
export interface PlanetData {
  name: string;
  description: string;
}

export const characterPlanets: Record<string, PlanetData> = {
  alexis: {
    name: 'Land of Peace and Plunder',
    description: 'A tranquil world where all conflicts have been resolved and locked away in elaborate vaults requiring massive grist to unlock. No enemies spawn naturally, making progress impossible through normal gameplay. As a Thief of Rage, Alexis must channel her antagonistic nature outward—raiding other players\' planets to steal their underlings, loot, and enemy encounters to fuel her own advancement. The stagnant peace frustrates her into becoming the team\'s aggressive go-getter, forced to be the antagonist not by choice but by mechanical necessity.'
  },
  austine: {
    name: 'Land of Geometry and Riddles',
    description: 'A crystalline world of impossible geometries and logic gates made manifest. Every reward is locked behind increasingly complex puzzles that test pure rationality. As a Mage of Mind, Austine must understand logic itself as a living force, learning that strategy isn\'t just about solving problems but comprehending the fundamental patterns that govern all decisions. His journey is one of pure intellectual evolution.'
  },
  chloe: {
    name: 'Land of Thorns and Vines',
    description: 'A harsh planet of withered gardens and struggling NPCs, where life clings desperately to survival. As a Rogue of Life, Chloe must learn the hardest lesson of healing: not everything can or should be saved. Her quest involves redistributing vitality wisely, helping NPCs rebuild against impossible odds while understanding that some sacrifices preserve more life than trying to save everything.'
  },
  isabela: {
    name: 'Land of Pillars and Amphitheaters',
    description: 'A planet of grand classical architecture—incomplete temples, colosseums, and forums with pillars awaiting activation. Each structure requires multiple players physically present at different pillars simultaneously, but each pillar demands unique strengths: one needs combat prowess, another logic puzzles, another spatial manipulation, another precise timing. As a Sylph of Blood, isabela stands at the central nexus, coordinating different specialists into synchronized action. The pillars represent both literal support structures and her role as the foundation holding the team together.'
  },
  nicholas: {
    name: 'Land of Beacons and Wisps',
    description: 'A planet where two types of light exist in constant conflict. Beacons—stable flames that reveal enemy weaknesses and illuminate true paths—must be preserved. Will-o\'-wisps—flickering, deceptive lights that grant enemies false fortune and create illusions of strength—must be destroyed. As a Prince of Light, Nicholas learns to distinguish between Light that guides and Light that deceives. By destroying the wisps, he strips overwhelming enemies of their inflated advantages, weaponizing his ignorance by making foes equally blind. The adversity remains brutal and his luck terrible, but mastering which lights deserve destruction versus preservation transforms him from a mindless destroyer into a strategic Prince who turns the worst situations into someone else\'s problem.'
  },
  opal: {
    name: 'Land of Serpents and Frogs',
    description: 'A planet where frog breeding grounds are under constant assault from predatory serpents that threaten to devour each generation before genesis can be achieved. As the Knight of Space, Opal must actively defend and maintain spatial boundaries around breeding habitats while nurturing the frogs through their evolutionary chain. She forges dimensional barriers, stabilizes paradox space rifts, and physically protects the fragile ecosystem from collapse. Her dual role manifests literally: one hand wielding Space as a shield against the serpents, the other carefully guiding the frogs toward their ultimate form. All while managing the gravitational chaos of the session\'s dangerously close planets—a burden she bears alone.'
  },
  tyson: {
    name: 'Land of Pyres and Crosses',
    description: 'A planet of funeral pyres and monuments glorifying solo martyrdom. When Tyson takes damage, pyres light and grant minor rewards—tempting him toward performative suffering. But the true mechanic reveals itself when he helps teammates avoid damage: greater rewards, brighter flames, actual progression. As a Page of Doom, his narcissism made him see his own pain reflected everywhere, thinking that meant he understood others. The planet tried to teach him that sacrifice isn\'t about bearing wounds yourself, but about preventing others from being wounded. He never fully learned this lesson—grinding minor pyre rewards through self-damage while missing the greater path of protection. His late bloomer potential remains locked, the pyres still waiting for him to understand that standing beside someone in danger is harder than standing alone in fire.'
  },
  victor: {
    name: 'Land of Notes and Dust',
    description: 'A planet where music can be played from giant instruments dominating the desert landscape. Each instrument can only be played once—their songs beautiful and destructive. As a Bard of Time who destroys the possibility of time loops, Victor must learn that time is a symphony performed live: you can\'t take back a note, every beat marches forward into silence and decay. His bardic chaos isn\'t consequence-free improvisation—it\'s a one-time performance where every discord, every wrong note, every wild flourish permanently destroys something. His world must have its music played well and only rewards him once he has finished, if he has done well it\'ll reward him greatly if not it disappears among the dust. The quest forces him to embrace his role as time player (accept the irreversible march forward, understand his destiny) without becoming cold to what gets ground to dust along the way. The music plays on, but so does entropy.'
  },
  nix: {
    name: 'The Void',
    description: 'There is no planet. As Bard of Void in a session with only seven noble gas worlds, Nix\'s entry destroys the possibility of an eighth land entirely. Upon entering the medium, he is cast into absolute nothingness—no ground, no sky, no consorts, no quests. Suspended in pure void, unable to move or act, he exists only as a helpless consciousness in emptiness until his dream self awakens. His entire journey must be walked as a dreamer, making him fundamentally disconnected from physical reality. The talkative, mysterious figure explores his quest through dreams alone: leaving behind what is known (his body, his planet, physical existence) and embracing the unknown (pure void, dream reality, the spaces between). His role as Bard means he enables destruction through absence—and his planet is the ultimate absence.'
  },
  alice: {
    name: 'Land of Crosses and Radon',
    description: 'A radioactive noble gas planet where crosses mark the graves of those who came before. Each cross is a trail marker showing the path from darkness to light. The radioactive decay mirrors Alice\'s volatile nature as a Mage of Rage. As she channels fury to shatter crystallized lies and reveal truth, the crosses guide others to follow her path. The impossible quests yield almost nothing materially, yet each broken lie brings understanding. Her rage becomes unstable isotope decay: dangerous, unpredictable, but ultimately revealing what lies beneath false surfaces and creating a trail for others to escape deception.'
  },
  audrey: {
    name: 'Land of Mausoleums and Krypton',
    description: 'A heavy noble gas planet dotted with elaborate mausoleums built to resist decay and refuse death itself. These grand structures embody futile attempts to preserve what cannot be preserved forever. As a Witch of Doom, Audrey rebels against destruction in a place designed to teach futility. The mausoleums stand as testaments to defying the inevitable—some crumbling, some still standing. The impossible quests offer pathetic rewards, but each small victory against fate is a middle finger to inevitability. The planet teaches that fighting destiny even when you know you\'ll lose is its own form of magic, and that witches bend reality itself to delay the endings written in stone.'
  },
  clayton: {
    name: 'Land of Cenotaphs and Xenon',
    description: 'A dense noble gas planet where empty tombs commemorate those who are missing—lost to overthinking, consumed by emotion, or disappeared into the spaces between logic and feeling. The cenotaphs are inherited monuments to failures of balance, legacies of those who couldn\'t master the equilibrium Clayton must learn. As an Heir of Mind, he inherits the weight of these cautionary tales. The impossible quests demand simultaneous rational analysis and emotional intelligence, offering minimal reward because the real prize is internal equilibrium. Xenon\'s use in consciousness and computing mirrors his need to understand thought itself while not losing his humanity.'
  },
  irene: {
    name: 'Land of Statues and Argon',
    description: 'A protective noble gas planet where statues stand frozen in time. Each statue commemorates bonds that were preserved but ultimately severed, relationships made permanent in stone yet still lost. As a Maid of Blood, Irene must grow into a unifying force in a place that shows how even preserved connections can fail. The argon atmosphere tries to protect these monuments from decay, just as she must protect her team\'s bonds. The quests demand cooperation but offer almost no reward, testing whether unity has value beyond material gain. She learns that being the statue that holds others together—present, stable, protective—is both her burden and her power.'
  },
  trenton: {
    name: 'Land of Obelisks and Helium',
    description: 'A light noble gas planet where towering obelisks mark the graves of those who were too free to stay—drifting away into nothingness, untethered and lost. Each obelisk is a vision marker, a foresight monument warning of what happens when freedom has no direction. As a Seer of Breath, Trenton must understand the paradox of freedom—that guiding others through change requires seeing connections that bind even as they liberate. The helium whispers carry visions of paths not taken, warnings of winds that led nowhere. The impossible quests teach that insight without reward is still insight, and that seeing the future means understanding which freedoms preserve life and which scatter it into void.'
  },
  vettia: {
    name: 'Land of Shrines and Neon',
    description: 'A glowing noble gas planet where shrines honor dreams that died unrealized, hopes that burned bright and guttered out. Each neon shrine still glows with residual light, refusing to fully darken—small acts of defiance against despair. As a Sylph of Hope, Vettia must heal and inspire in a place designed to crush optimism. The shrines are sacred spaces where she tends the embers of dead dreams, nurturing what little light remains. Every impossible quest completed yields nearly nothing, yet she learns that fostering hope in the face of despair is its own reward. The neon glow reminds her that even extinguished dreams once burned bright enough to light the void—and can be rekindled.'
  },
  octavian: {
    name: 'Land of Masks and Oganesson',
    description: 'A planet born from the largest synthetic element that decays instantly into violent radioactive fragments. Before Octavian even arrived, the decay had already ravaged the world—leaving it nearly destroyed, poisoned with dangerous isotopes. Throughout the wasteland stand countless masks on pedestals: memorial masks of the dead, each one an attempt to immortalize an identity that still faded. As a Thief of Heart, he steals traits from these toxic remnants, building his ultimate self from radioactive echoes of who these people were. Like Oganesson itself—massive, synthetic, unstable, rapidly decaying—he is assembled from parts that don\'t naturally belong together. His quest involves harvesting the best fragments from these preserved identities and merging them into himself, learning to stabilize what should be unstable, to make permanent what was meant to decay.'
  },
  okwos: {
    name: 'Land of Obsidian and Tunnels',
    description: 'A planet of black volcanic glass where every surface reflects distorted images and hidden caches lie buried beneath. As a Knight of Void, Okwos must protect the unknown and wield obscurity as both shield and weapon. The obsidian mirrors show truths and lies indistinguishably, teaching him that safeguarding secrets means understanding what must remain hidden versus what must be revealed. His trials demand he navigate pure uncertainty while protecting others from what lurks in the gaps.'
  },
  gwenhas: {
    name: 'Land of Vaults and Frogs',
    description: 'A planet where genesis frogs are locked away in countless sealed vaults scattered across incompatible dimensions. Each vault contains frogs with unique mutations needed for breeding, but they\'re trapped in spatial prisons—some compressed into impossible geometries, others stretched across dimensional rifts, all inaccessible to each other. As a Rogue of Space, Gwenhas must steal these frogs from their vaults, manipulating and bending space to break them free and redistribute them to her team\'s breeding grounds. She navigates spatial constraints, ripping open dimensional locks and relocating captive frogs to create the complete breeding population needed for genesis. The planet challenges her to find creative solutions to impossible spatial puzzles, teaching her that stealing from imprisonment to give freedom is how she creates a new universe.'
  },
  redacted: {
    name: 'Land of Ashes and Ruin',
    description: 'A planet of frozen catastrophes—buildings mid-collapse, disasters paused at their peak, ruins that demonstrate doom\'s mechanics like a textbook. Each catastrophe has carved rules explaining why it happened, prophecies of what must follow, laws of inevitable destruction made manifest. As a Seer of Doom, [REDACTED] must study these frozen endings like an architect deconstructing blueprints. The planet is a laboratory of apocalypse where they learn to foresee destruction by understanding its patterns and rules. Every vision shows not just what will end, but why it must end, how it will fall, what signs precede collapse. The static figure analyzes doom\'s structure to guide others through impending chaos—not to prevent it, but to prepare for it and mitigate its impact through knowledge of its inevitable mechanics.'
  },
  dhesas: {
    name: 'Land of Shards and Glass',
    description: 'A planet where crystallized time forms delicate glass structures—beautiful, transparent, and catastrophically fragile. Each structure contains stolen moments from erased timelines, visible within the glass but shattered at the slightest touch. As a Thief of Time, Dhesas must carefully harvest these temporal shards to extend her existence, learning that every moment stolen makes the timeline more brittle. The trials force her to walk on glass floors, manipulate glass mechanisms, and witness how easily her alterations shatter reality. The planet teaches that staying alive on borrowed time means understanding fragility—hers, the timeline\'s, and everyone caught in her thefts. Each stolen second strengthens her but makes the universe more like glass: transparent, precious, and one impact away from irreparable destruction.'
  },
  default: {
    name: 'Land of Questions and Answers',
    description: 'A mysterious planet waiting to be discovered and defined by its player.'
  }
};

/**
 * Helper function to create space configuration with specific image
 * Returns a config object with the image path
 */
export function createSpaceConfig(imageName: SpaceImageName) {
  const path = spaceImagePaths[imageName] || spaceImagePaths['NaN'];
  return {
    type: 'static',
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'>
    <image href='${path}' x='0' y='0' width='72' height='72'/>
  </svg>`
  };
}
