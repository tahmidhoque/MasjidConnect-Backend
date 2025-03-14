/**
 * Service for fetching religious content from external APIs
 */
export class ReligiousContentService {
  /**
   * Fetches a random verse from the Quran
   * @returns Promise with verse data
   */
  async getRandomQuranVerse() {
    try {
      // Get a random surah number (1-114)
      const surahNumber = Math.floor(Math.random() * 114) + 1;
      
      // Fetch the surah to get its number of verses
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      if (!surahResponse.ok) {
        throw new Error('Failed to fetch surah information');
      }
      
      const surahData = await surahResponse.json();
      const numberOfAyahs = surahData.data.numberOfAyahs;
      
      // Get a random ayah number
      const ayahNumber = Math.floor(Math.random() * numberOfAyahs) + 1;
      
      // Fetch the specific verse
      return this.getSpecificQuranVerse(surahNumber, ayahNumber);
    } catch (error) {
      console.error('Error fetching random Quran verse:', error);
      throw error;
    }
  }

  /**
   * Fetches a specific verse from the Quran
   * @param surahNumber The surah number (1-114)
   * @param ayahNumber The ayah number
   * @returns Promise with verse data
   */
  async getSpecificQuranVerse(surahNumber: number, ayahNumber: number) {
    try {
      // Fetch the Arabic text
      const arabicResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`
      );
      if (!arabicResponse.ok) {
        throw new Error('Failed to fetch Arabic verse');
      }
      
      // Fetch the English translation
      const translationResponse = await fetch(
        `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/en.sahih`
      );
      if (!translationResponse.ok) {
        throw new Error('Failed to fetch verse translation');
      }
      
      const arabicData = await arabicResponse.json();
      const translationData = await translationResponse.json();
      
      // Get surah name for reference
      const surahResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const surahData = await surahResponse.json();
      const surahName = surahData.data.englishName;
      
      return {
        type: 'QURAN_VERSE',
        arabicText: arabicData.data.text,
        translation: translationData.data.text,
        reference: `${surahName} (${surahNumber}:${ayahNumber})`,
        source: 'Sahih International',
      };
    } catch (error) {
      console.error('Error fetching specific Quran verse:', error);
      throw error;
    }
  }

  /**
   * Fetches a random hadith from the specified collection
   * @param collection The hadith collection to fetch from
   * @returns Promise with hadith data
   */
  async getRandomHadith(collection: string) {
    try {
      // Map collection names to their API identifiers
      const collectionMap: Record<string, string> = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'abudawud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'nasai': 'nasai',
        'ibnmajah': 'ibnmajah',
        'malik': 'malik'
      };
      
      const collectionId = collectionMap[collection] || 'bukhari';
      
      // Define approximate hadith counts for each collection to avoid relying on metadata
      const hadithCounts: Record<string, number> = {
        'bukhari': 7563,
        'muslim': 7470,
        'abudawud': 5274,
        'tirmidhi': 3956,
        'nasai': 5761,
        'ibnmajah': 4341,
        'malik': 1851
      };
      
      const totalHadiths = hadithCounts[collectionId] || 7000;
      
      // Get a random hadith number
      const hadithNumber = Math.floor(Math.random() * totalHadiths) + 1;
      
      return this.getSpecificHadith(collection, hadithNumber);
    } catch (error) {
      console.error('Error fetching random hadith:', error);
      throw error;
    }
  }

  /**
   * Fetches a specific hadith by collection and number
   * @param collection The hadith collection
   * @param hadithNumber The hadith number
   * @returns Promise with hadith data
   */
  async getSpecificHadith(collection: string, hadithNumber: number) {
    try {
      // Map collection names to their API identifiers
      const collectionMap: Record<string, string> = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'abudawud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'nasai': 'nasai',
        'ibnmajah': 'ibnmajah',
        'malik': 'malik'
      };
      
      const collectionId = collectionMap[collection] || 'bukhari';
      
      // Fetch the hadith in English
      const engResponse = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collectionId}/${hadithNumber}.min.json`
      );
      if (!engResponse.ok) {
        throw new Error(`Failed to fetch hadith from ${collection}`);
      }
      
      const engData = await engResponse.json();
      
      // Try to fetch the Arabic version if available
      let arabicText = '';
      try {
        const araResponse = await fetch(
          `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${collectionId}/${hadithNumber}.min.json`
        );
        if (araResponse.ok) {
          const araData = await araResponse.json();
          arabicText = araData.hadiths[0]?.text || '';
        }
      } catch (error) {
        console.warn('Arabic hadith not available, continuing with English only');
      }
      
      // Get the grade information
      let grade = this.getHadithGrade(collection, hadithNumber);
      
      // Format the collection name for display
      const collectionNames: Record<string, string> = {
        'bukhari': 'Sahih Bukhari',
        'muslim': 'Sahih Muslim',
        'abudawud': 'Abu Dawud',
        'tirmidhi': 'Tirmidhi',
        'nasai': 'Nasai',
        'ibnmajah': 'Ibn Majah',
        'malik': 'Malik\'s Muwatta'
      };
      
      const displayName = collectionNames[collection] || collection;
      
      // Format the hadith data
      return {
        type: 'HADITH',
        arabicText: arabicText,
        translation: engData.hadiths[0]?.text || '',
        reference: `${displayName}, Hadith ${hadithNumber}`,
        grade: grade,
      };
    } catch (error) {
      console.error('Error fetching specific hadith:', error);
      throw error;
    }
  }

  /**
   * Searches for hadiths containing the given query
   * @param collection The hadith collection to search in
   * @param query The search query
   * @param limit Maximum number of results to return
   * @returns Promise with array of matching hadiths
   */
  async searchHadiths(collection: string, query: string, limit: number = 5) {
    try {
      // Map collection names to their API identifiers
      const collectionMap: Record<string, string> = {
        'bukhari': 'bukhari',
        'muslim': 'muslim',
        'abudawud': 'abudawud',
        'tirmidhi': 'tirmidhi',
        'nasai': 'nasai',
        'ibnmajah': 'ibnmajah',
        'malik': 'malik'
      };
      
      const collectionId = collectionMap[collection] || 'bukhari';
      
      // Define approximate hadith counts for each collection
      const hadithCounts: Record<string, number> = {
        'bukhari': 7563,
        'muslim': 7470,
        'abudawud': 5274,
        'tirmidhi': 3956,
        'nasai': 5761,
        'ibnmajah': 4341,
        'malik': 1851
      };
      
      // Fetch the entire collection (this is not ideal but the API doesn't provide search)
      const response = await fetch(
        `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${collectionId}.min.json`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hadiths from ${collection}`);
      }
      
      const data = await response.json();
      
      // Search for matching hadiths
      const results = data.hadiths
        .filter((hadith: any) => 
          hadith.text.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit)
        .map((hadith: any) => ({
          number: hadith.number,
          text: hadith.text,
          reference: `${collection}, Hadith ${hadith.number}`,
        }));
      
      return results;
    } catch (error) {
      console.error('Error searching hadiths:', error);
      throw error;
    }
  }

  /**
   * Gets the grade (authenticity) of a hadith
   * @param collection The hadith collection
   * @param hadithNumber The hadith number
   * @returns The grade of the hadith
   */
  getHadithGrade(collection: string, hadithNumber: number): string {
    // Default grades for collections
    const defaultGrades: Record<string, string> = {
      'bukhari': 'Sahih (Authentic)',
      'muslim': 'Sahih (Authentic)',
      'abudawud': 'Varies',
      'tirmidhi': 'Varies',
      'nasai': 'Varies',
      'ibnmajah': 'Varies',
      'malik': 'Varies'
    };
    
    // For Bukhari and Muslim, all hadiths are considered Sahih
    if (collection === 'bukhari' || collection === 'muslim') {
      return 'Sahih (Authentic)';
    }
    
    // For other collections, we would need a more detailed database
    // This is a simplified approach
    return defaultGrades[collection] || 'Unknown';
  }
} 