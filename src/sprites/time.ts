/**
 * Time Aspect Sprite Configuration
 *
 * This file defines the clock behavior for the Time aspect.
 *
 * CLOCK MODES:
 * - 'default': Shows current UTC time (real-time)
 * - 'loop': Cycles through start → middles → end → back to start
 * - 'final': Goes through start → middles → end and stops
 *
 * TIME VALUES:
 * - 'HH:MM:SS': Explicit time (e.g., '12:30:45')
 * - 'random': Random time between 00:00:00 and 23:59:59
 * - 'NaN': Hide clock hands (show only clock face)
 * - '= X': Pause for X seconds at current time
 * - '+ X': Add X seconds to previous time value (animates)
 * - '> X': Jump X seconds ahead instantly (no animation)
 * - '> random': Jump to a new random time instantly
 * - '> NaN': Jump to hide clock hands instantly
 *
 * DATE VALUES (optional):
 * - 'YYYY:MM:DD': Explicit date (e.g., '2009:04:13')
 * - 'random': Random date
 * - 'NaN': Hide date display
 * - '= X': Pause for X days at current date
 * - '+ X': Add X days to previous date value
 * - '> X': Jump X days ahead instantly
 * - '> random': Jump to a new random date instantly
 * - '> NaN': Jump to hide date instantly
 *
 * CONFIGURATION:
 * - mode: 'default' | 'loop' | 'final'
 * - startTime: Initial time when page opens (required for loop/final)
 * - startDate: Initial date (optional, defaults to current UTC date)
 * - middleTimes: Optional array of intermediate times
 * - middleDates: Optional array of intermediate dates (must match middleTimes length)
 * - endTime: Final time (required for loop/final)
 * - endDate: Final date (optional)
 * - speed: Time multiplier (optional, defaults to 1)
 * - trigger: 'automatic' | 'click' | 'game' (optional, defaults to 'automatic')
 *
 * EXAMPLES:
 *
 * 1. Default UTC clock with current date:
 *    { mode: 'default' }
 *
 * 2. Loop from 00:00:00 → 00:00:10 → 00:00:20 → back to start:
 *    {
 *      mode: 'loop',
 *      startTime: '00:00:00',
 *      middleTimes: ['+ 10'],
 *      endTime: '+ 10'
 *    }
 *
 * 3. Specific date with time:
 *    {
 *      mode: 'loop',
 *      startTime: '12:00:00',
 *      startDate: '2009:04:13',
 *      endTime: '13:00:00',
 *      endDate: '+ 1'  // Next day
 *    }
 *
 * 4. Random start, pause 5 seconds, then continue at 2x speed:
 *    {
 *      mode: 'final',
 *      startTime: 'random',
 *      middleTimes: ['= 5', '+ 30'],
 *      endTime: '+ 60',
 *      speed: 2
 *    }
 *
 * 5. Click-triggered clock:
 *    {
 *      mode: 'loop',
 *      startTime: '12:00:00',
 *      endTime: '13:00:00',
 *      trigger: 'click'
 *    }
 *
 * 6. Jump ahead instantly:
 *    {
 *      mode: 'loop',
 *      startTime: '08:00:00',
 *      middleTimes: ['+ 30', '> 3600'],  // Animate 30s, then jump 1 hour
 *      endTime: '+ 30'
 *    }
 *
 * 7. Random jumps:
 *    {
 *      mode: 'loop',
 *      startTime: 'random',
 *      middleTimes: ['= 2', '> random'],  // Pause 2s, then jump to new random time
 *      endTime: '= 2'
 *    }
 *
 * 8. Hide clock hands:
 *    {
 *      mode: 'loop',
 *      startTime: '12:00:00',
 *      middleTimes: ['+ 30', '> NaN', '= 2'],  // Show time, hide hands, pause, repeat
 *      endTime: '> 12:00:00'
 *    }
 *
 * 9. Date progression:
 *    {
 *      mode: 'loop',
 *      startTime: '00:00:00',
 *      startDate: '2009:04:13',
 *      middleTimes: ['+ 86400'],  // Add 24 hours
 *      middleDates: ['+ 1'],      // Add 1 day
 *      endTime: '+ 0',
 *      endDate: '+ 0'
 *    }
 */

export type TimeValue = string;
export type DateValue = string;

export interface TimeClockConfig {
  type: 'clock';
  mode: 'default' | 'loop' | 'final';
  startTime?: TimeValue;
  startDate?: DateValue;
  middleTimes?: TimeValue[];
  middleDates?: DateValue[];
  endTime?: TimeValue;
  endDate?: DateValue;
  speed?: number;
  trigger?: 'automatic' | 'click' | 'game';
}

/**
 * Default time sprite configuration
 * Shows real-time UTC clock with current date
 */
export const timeSprite: TimeClockConfig = {
  type: 'clock',
  mode: 'default'
};

/**
 * Helper function to create time configuration
 */
export function createTimeConfig(
  mode: 'default' | 'loop' | 'final',
  startTime?: TimeValue,
  endTime?: TimeValue,
  options?: {
    startDate?: DateValue;
    middleTimes?: TimeValue[];
    middleDates?: DateValue[];
    endDate?: DateValue;
    speed?: number;
    trigger?: 'automatic' | 'click' | 'game';
  }
): TimeClockConfig {
  const config: TimeClockConfig = {
    type: 'clock',
    mode
  };

  if (mode !== 'default') {
    config.startTime = startTime;
    config.endTime = endTime;
  }

  if (options?.startDate) {
    config.startDate = options.startDate;
  }

  if (options?.middleTimes) {
    config.middleTimes = options.middleTimes;
  }

  if (options?.middleDates) {
    config.middleDates = options.middleDates;
  }

  if (options?.endDate) {
    config.endDate = options.endDate;
  }

  if (options?.speed && options.speed !== 1) {
    config.speed = options.speed;
  }

  if (options?.trigger && options.trigger !== 'automatic') {
    config.trigger = options.trigger;
  }

  return config;
}
