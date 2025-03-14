/**
 * Service for fetching religious content (Quran verses and Hadiths) from external APIs
 */

// Types for verse content
export interface VerseContent {
  type: 'QURAN_VERSE';
  arabicText: string;
  translation: string;
  reference: string;
  source?: string;
}

// Types for hadith content
export interface HadithContent {
  type: 'HADITH';
  arabicText?: string;
  translation: string;
  reference: string;
  grade?: string;
}

// Combined type
export type ReligiousContent = VerseContent | HadithContent;

/**
 * Fetches a random verse from the Quran using AlQuran.cloud API
 */
export async function fetchRandomVerse(): Promise<VerseContent> {
  try {
    // Get a random verse number (1-6236)
    const randomVerseNumber = Math.floor(Math.random() * 6236) + 1;
    
    // Fetch Arabic text
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${randomVerseNumber}`);
    if (!arabicResponse.ok) throw new Error('Failed to fetch Arabic verse');
    const arabicData = await arabicResponse.json();
    
    // Fetch English translation
    const translationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${randomVerseNumber}/en.asad`);
    if (!translationResponse.ok) throw new Error('Failed to fetch verse translation');
    const translationData = await translationResponse.json();
    
    // Format the reference as Surah:Ayah
    const surah = arabicData.data.surah.number;
    const ayah = arabicData.data.numberInSurah;
    const surahName = arabicData.data.surah.englishName;
    
    return {
      type: 'QURAN_VERSE',
      arabicText: arabicData.data.text,
      translation: translationData.data.text,
      reference: `${surahName} (${surah}:${ayah})`,
      source: 'Muhammad Asad Translation'
    };
  } catch (error) {
    console.error('Error fetching random verse:', error);
    throw error;
  }
}

/**
 * Fetches a random hadith from the specified collection using fawazahmed0/hadith-api
 * @param collection The hadith collection to fetch from (default: 'bukhari')
 */
export async function fetchRandomHadith(collection: string = 'bukhari'): Promise<HadithContent> {
  try {
    // Validate and normalize collection name
    const validCollections = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'];
    const normalizedCollection = collection.toLowerCase();
    
    if (!validCollections.includes(normalizedCollection)) {
      throw new Error(`Invalid hadith collection: ${collection}`);
    }
    
    // Get total number of hadiths in the collection
    const editionsResponse = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json`);
    if (!editionsResponse.ok) throw new Error('Failed to fetch hadith editions');
    const editionsData = await editionsResponse.json();
    
    // Find the English edition for the requested collection
    const editionKey = `eng-${normalizedCollection}`;
    const edition = editionsData.find((e: any) => e.identifier === editionKey);
    
    if (!edition) {
      throw new Error(`Could not find edition for collection: ${collection}`);
    }
    
    // Get a random hadith number
    const totalHadiths = edition.hadiths;
    const randomHadithNumber = Math.floor(Math.random() * totalHadiths) + 1;
    
    // Fetch the hadith
    const hadithResponse = await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${editionKey}/${randomHadithNumber}.json`);
    if (!hadithResponse.ok) throw new Error('Failed to fetch hadith');
    const hadithData = await hadithResponse.json();
    
    return {
      type: 'HADITH',
      translation: hadithData.hadiths[0].text,
      reference: `${edition.name}, Hadith ${randomHadithNumber}`,
      grade: hadithData.hadiths[0].grade || 'Unknown'
    };
  } catch (error) {
    console.error('Error fetching random hadith:', error);
    throw error;
  }
}

/**
 * Fetches a specific verse from the Quran using AlQuran.cloud API
 * @param surah Surah number
 * @param ayah Ayah number
 */
export async function fetchSpecificVerse(surah: number, ayah: number): Promise<VerseContent> {
  try {
    // Validate input
    if (surah < 1 || surah > 114 || ayah < 1) {
      throw new Error('Invalid surah or ayah number');
    }
    
    // Fetch Arabic text
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
    if (!arabicResponse.ok) throw new Error('Failed to fetch Arabic verse');
    const arabicData = await arabicResponse.json();
    
    // Fetch English translation
    const translationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
    if (!translationResponse.ok) throw new Error('Failed to fetch verse translation');
    const translationData = await translationResponse.json();
    
    const surahName = arabicData.data.surah.englishName;
    
    return {
      type: 'QURAN_VERSE',
      arabicText: arabicData.data.text,
      translation: translationData.data.text,
      reference: `${surahName} (${surah}:${ayah})`,
      source: 'Muhammad Asad Translation'
    };
  } catch (error) {
    console.error('Error fetching specific verse:', error);
    throw error;
  }
} 