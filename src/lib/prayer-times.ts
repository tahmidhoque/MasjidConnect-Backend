import {
  CalculationMethod,
  Coordinates,
  Madhab,
  PrayerTimes,
  SunnahTimes,
  HighLatitudeRule,
} from 'adhan';
import { addMinutes, format } from 'date-fns';

export type CalculationParams = {
  latitude: number;
  longitude: number;
  date: Date;
  calculationMethod: string;
  madhab: string;
  adjustments?: {
    fajr?: number;
    sunrise?: number;
    zuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  };
};

const CALCULATION_METHODS = {
  'MWL': CalculationMethod.MuslimWorldLeague(),
  'ISNA': CalculationMethod.NorthAmerica(),
  'Egypt': CalculationMethod.Egyptian(),
  'Makkah': CalculationMethod.UmmAlQura(),
  'Karachi': CalculationMethod.Karachi(),
  'Tehran': CalculationMethod.Tehran(),
  'Singapore': CalculationMethod.Singapore(),
};

const MADHABS = {
  'Hanafi': Madhab.Hanafi,
  'Shafi': Madhab.Shafi,
};

export function calculatePrayerTimes({
  latitude,
  longitude,
  date,
  calculationMethod,
  madhab,
  adjustments = {},
}: CalculationParams) {
  // Set up coordinates
  const coordinates = new Coordinates(latitude, longitude);

  // Set up calculation parameters
  const params = CALCULATION_METHODS[calculationMethod as keyof typeof CALCULATION_METHODS] || 
                CALCULATION_METHODS['MWL'];
  
  // Apply madhab
  params.madhab = MADHABS[madhab as keyof typeof MADHABS] || MADHABS['Shafi'];
  
  // Handle extreme latitudes
  params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;

  // Apply adjustments if provided
  if (adjustments) {
    params.adjustments = {
      fajr: adjustments.fajr || 0,
      sunrise: adjustments.sunrise || 0,
      dhuhr: adjustments.zuhr || 0,
      asr: adjustments.asr || 0,
      maghrib: adjustments.maghrib || 0,
      isha: adjustments.isha || 0,
    };
  }

  // Calculate prayer times
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  const sunnahTimes = new SunnahTimes(prayerTimes);

  // Format times
  const formatTime = (date: Date) => format(date, 'HH:mm');

  // Add default jamaat times (usually 10-30 minutes after prayer time)
  const addJamaatTime = (time: Date, minutes: number = 20) => {
    return formatTime(addMinutes(time, minutes));
  };

  return {
    date,
    // Calculated times
    fajr: formatTime(prayerTimes.fajr),
    sunrise: formatTime(prayerTimes.sunrise),
    zuhr: formatTime(prayerTimes.dhuhr),
    asr: formatTime(prayerTimes.asr),
    maghrib: formatTime(prayerTimes.maghrib),
    isha: formatTime(prayerTimes.isha),
    
    // Default Jamaat times (can be overridden)
    fajrJamaat: addJamaatTime(prayerTimes.fajr, 20),
    zuhrJamaat: addJamaatTime(prayerTimes.dhuhr, 20),
    asrJamaat: addJamaatTime(prayerTimes.asr, 20),
    maghribJamaat: addJamaatTime(prayerTimes.maghrib, 5), // Maghrib usually has shorter delay
    ishaJamaat: addJamaatTime(prayerTimes.isha, 20),
    
    // Additional useful times
    middleOfTheNight: formatTime(sunnahTimes.middleOfTheNight),
    lastThirdOfTheNight: formatTime(sunnahTimes.lastThirdOfTheNight),
    
    // Metadata
    isManuallySet: false,
    source: 'CALCULATION',
  };
}

export function generatePrayerTimesForMonth(params: Omit<CalculationParams, 'date'>, month: number, year: number) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const prayerTimes = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    prayerTimes.push(
      calculatePrayerTimes({
        ...params,
        date,
      })
    );
  }

  return prayerTimes;
}

export function generatePrayerTimesForYear(params: Omit<CalculationParams, 'date'>, year: number) {
  const prayerTimes = [];

  for (let month = 1; month <= 12; month++) {
    prayerTimes.push(...generatePrayerTimesForMonth(params, month, year));
  }

  return prayerTimes;
} 