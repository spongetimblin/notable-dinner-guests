/**
 * External Source APIs
 * Fetches quotes, works, and texts from various public APIs
 */

/**
 * Wikipedia API - Fetches biographical info for a person
 */
const WikipediaAPI = {
    baseUrl: 'https://en.wikipedia.org/w/api.php',

    /**
     * Get autocomplete suggestions for a search query
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of suggestion objects with title and description
     */
    /**
     * Check if a Wikipedia title is likely a person (not an event, place, work, etc.)
     * @param {string} title - Wikipedia page title
     * @returns {boolean} True if likely a person
     */
    isLikelyPerson(title) {
        // Patterns that indicate non-person pages
        const nonPersonPatterns = [
            /^(Murder|Death|Assassination|Killing|Execution) of /i,
            /^(List|Timeline|History|Bibliography|Discography|Filmography) of /i,
            /\((album|film|movie|song|book|novel|TV series|band|company|organization)\)$/i,
            /\((disambiguation)\)$/i,
            /^The .+ (album|film|movie|song|book|novel|TV series)$/i,
            / (album|film|movie|song|discography|filmography|bibliography)$/i,
            /^(Battle|Siege|War|Treaty|Act) of /i,
            / (massacre|riot|revolution|rebellion|uprising|incident|scandal|controversy|conspiracy|trial|case)$/i,
            /^(University|College|School|Institute|Museum|Library|Hospital|Church|Cathedral) of /i,
        ];

        for (const pattern of nonPersonPatterns) {
            if (pattern.test(title)) {
                return false;
            }
        }
        return true;
    },

    async getAutocompleteSuggestions(query) {
        if (!query || query.length < 2) return [];

        try {
            const params = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: query,
                srlimit: 15, // Fetch more to filter down to 8 people
                srprop: 'snippet',
                format: 'json',
                origin: '*'
            });

            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();

            if (!data.query?.search?.length) return [];

            // Filter to likely people and limit to 8 results
            return data.query.search
                .filter(result => this.isLikelyPerson(result.title))
                .slice(0, 8)
                .map(result => ({
                    title: result.title,
                    snippet: result.snippet
                        .replace(/<[^>]*>/g, '') // Remove HTML tags
                        .replace(/&quot;/g, '"')
                        .replace(/&amp;/g, '&')
                        .substring(0, 100)
                }));
        } catch (error) {
            console.warn('Wikipedia autocomplete failed:', error);
            return [];
        }
    },

    /**
     * Check if a person is deceased by looking at their Wikipedia page
     * @param {string} name - Person's name
     * @returns {Promise<{isDeceased: boolean, birthYear: number|null, deathYear: number|null}>}
     */
    async checkIfDeceased(name) {
        try {
            // Search for the person first
            const searchParams = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: name,
                srlimit: 1,
                format: 'json',
                origin: '*'
            });

            const searchResponse = await fetch(`${this.baseUrl}?${searchParams}`);
            const searchData = await searchResponse.json();

            if (!searchData.query?.search?.length) {
                return { isDeceased: false, birthYear: null, deathYear: null, error: 'not_found' };
            }

            const pageTitle = searchData.query.search[0].title;

            // Get the page extract to check for death dates
            const extractParams = new URLSearchParams({
                action: 'query',
                titles: pageTitle,
                prop: 'extracts',
                exintro: true,
                explaintext: true,
                format: 'json',
                origin: '*'
            });

            const extractResponse = await fetch(`${this.baseUrl}?${extractParams}`);
            const extractData = await extractResponse.json();

            const pages = extractData.query?.pages;
            if (!pages) {
                return { isDeceased: false, birthYear: null, deathYear: null, error: 'no_page' };
            }

            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId]?.extract || '';

            // Wikipedia biographical articles start with: "Name (birth – death) was/is..."
            // We need to find the FIRST parenthetical with dates, which contains lifespan
            // Look at the first ~200 chars to find the biographical dates
            const introSection = extract.substring(0, 300);

            // Match the first parenthetical that contains birth-death pattern
            // This handles formats like:
            // - (1452–1519)
            // - (May 12, 1937 – June 22, 2008)
            // - (15 April 1452 – 2 May 1519)
            // - (c. 1452 – 1519)
            const lifeSpanMatch = introSection.match(/\([^)]*?(\d{4})[^)]*?[–-][^)]*?(\d{4})[^)]*?\)/);
            if (lifeSpanMatch) {
                const birthYear = parseInt(lifeSpanMatch[1]);
                const deathYear = parseInt(lifeSpanMatch[2]);
                // Sanity check: death year should be after birth year and both should be reasonable
                if (deathYear > birthYear && birthYear > 0 && deathYear <= new Date().getFullYear()) {
                    return { isDeceased: true, birthYear, deathYear };
                }
            }

            // Check for BCE/BC dates (ancient figures)
            // Pattern 1: Both years are BC - "470–399 BC" or "c. 470 – 399 BCE"
            // BC/BCE comes AFTER the death year
            const bcBothMatch = introSection.match(/(?:c\.?\s*)?(\d{1,4})\s*[–-]\s*(?:c\.?\s*)?(\d{1,4})\s*(BCE?|BC)/i);
            if (bcBothMatch) {
                const birthYear = parseInt(bcBothMatch[1]);
                const deathYear = parseInt(bcBothMatch[2]);
                // Sanity check: birth year should be larger (older) than death year for BC dates
                if (birthYear > deathYear && birthYear <= 3000 && deathYear > 0) {
                    return {
                        isDeceased: true,
                        birthYear: -birthYear,
                        deathYear: -deathYear
                    };
                }
            }

            // Pattern 2: Mixed BC/AD dates - "c. 4 BC – AD 30" or "6 BC – AD 30/33"
            // Birth year has BC/BCE after it, death year has AD/CE before it
            const bcAdMatch = introSection.match(/(?:c\.?\s*)?(\d{1,4})\s*(BC|BCE)\s*[–-]\s*(AD|CE)\s*(\d{1,4})/i);
            if (bcAdMatch) {
                return {
                    isDeceased: true,
                    birthYear: -parseInt(bcAdMatch[1]),
                    deathYear: parseInt(bcAdMatch[4])
                };
            }

            // Check for "died" keyword
            const diedMatch = extract.match(/died[^.]*(\d{4})/i);
            if (diedMatch) {
                return { isDeceased: true, birthYear: null, deathYear: parseInt(diedMatch[1]) };
            }

            // Check for "(was)" pattern which often indicates deceased
            const wasMatch = extract.match(/was\s+(?:an?|the)\s+\w+/i);
            // Also check if they have birth dates in a historical range
            const oldBirthMatch = extract.match(/\((?:born\s+)?[^)]*(\d{4})[^)]*\)/);
            if (oldBirthMatch) {
                const birthYear = parseInt(oldBirthMatch[1]);
                // If born before 1900, very likely deceased
                if (birthYear < 1900) {
                    return { isDeceased: true, birthYear, deathYear: null };
                }
            }

            // Pattern indicating still alive
            const alivePatterns = [
                /\(born\s+[^)]*(\d{4})\s*\)/i,           // (born 1950) or (born January 1, 1950)
                /\(\d{4}\s*[–-]\s*present\)/i,           // (1950-present)
                /\bage\s+\d+\)/i,                        // age 73)
                /\(aged?\s+\d+\)/i,                      // (aged 73)
            ];

            for (const pattern of alivePatterns) {
                const match = extract.match(pattern);
                if (match) {
                    // Extract birth year if available
                    const yearMatch = match[0].match(/(\d{4})/);
                    const birthYear = yearMatch ? parseInt(yearMatch[1]) : null;
                    // Only consider alive if born after 1900 (reasonable living age)
                    if (birthYear && birthYear > 1900) {
                        return { isDeceased: false, birthYear, deathYear: null };
                    }
                }
            }

            // If we can't determine and no clear patterns, mark as uncertain
            return { isDeceased: false, birthYear: null, deathYear: null, uncertain: true };

        } catch (error) {
            console.warn('Wikipedia deceased check failed:', error);
            return { isDeceased: false, birthYear: null, deathYear: null, error: error.message };
        }
    },

    /**
     * Search for a person and get their biographical summary
     * @param {string} name - Person's name
     * @returns {Promise<Object|null>} Biographical info or null
     */
    async fetchPersonInfo(name) {
        try {
            // First, search for the person
            const searchParams = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: name,
                format: 'json',
                origin: '*'
            });

            const searchResponse = await fetch(`${this.baseUrl}?${searchParams}`);
            const searchData = await searchResponse.json();

            if (!searchData.query?.search?.length) {
                return null;
            }

            const pageTitle = searchData.query.search[0].title;

            // Now get the page summary
            const summaryParams = new URLSearchParams({
                action: 'query',
                titles: pageTitle,
                prop: 'extracts|pageprops',
                exintro: true,
                explaintext: true,
                format: 'json',
                origin: '*'
            });

            const summaryResponse = await fetch(`${this.baseUrl}?${summaryParams}`);
            const summaryData = await summaryResponse.json();

            const pages = summaryData.query?.pages;
            if (!pages) return null;

            const pageId = Object.keys(pages)[0];
            const page = pages[pageId];
            const extract = page?.extract || '';

            if (!extract) return null;

            // Parse the extract for biographical info
            const info = this.parsePersonInfo(extract, name);
            return info;

        } catch (error) {
            console.warn('Wikipedia fetch failed:', error);
            return null;
        }
    },

    /**
     * Parse biographical info from Wikipedia extract
     * @param {string} extract - Wikipedia extract text
     * @param {string} name - Person's name for fallback
     * @returns {Object} Parsed biographical info
     */
    parsePersonInfo(extract, name) {
        const info = {
            era: '',
            description: ''
        };

        // Try to extract dates from common patterns
        // Patterns like "(1452–1519)", "(born 1950)", "(c. 470 – 399 BC)", etc.
        const datePatterns = [
            /\((\d{1,4})\s*[–-]\s*(\d{1,4})\)/,                           // (1452-1519)
            /\(c\.\s*(\d{1,4})\s*[–-]\s*c?\s*(\d{1,4})\s*(BCE?|CE|AD|BC)?\)/i, // (c. 470 – 399 BC)
            /\((\d{1,4})\s*(BCE?|BC)\s*[–-]\s*(\d{1,4})\s*(BCE?|BC|CE|AD)?\)/i, // (470 BCE - 399 BCE)
            /\(born\s+(\w+\s+\d{1,2},?\s+)?(\d{4})\)/i,                   // (born January 1, 1950)
            /\((\d{4})\s*[–-]\s*present\)/i,                              // (1950-present)
            /\((\w+\s+\d{1,2},?\s+)?(\d{4})\s*[–-]\s*(\w+\s+\d{1,2},?\s+)?(\d{4})\)/i, // (January 1, 1900 – December 31, 1999)
        ];

        for (const pattern of datePatterns) {
            const match = extract.match(pattern);
            if (match) {
                // Reconstruct the era string from the match
                const fullMatch = match[0];
                info.era = fullMatch.replace(/[()]/g, '').trim();
                break;
            }
        }

        // If no dates found, try to find century references
        if (!info.era) {
            const centuryMatch = extract.match(/(\d{1,2}(?:st|nd|rd|th)\s+century\s*(?:BCE?|BC|CE|AD)?)/i);
            if (centuryMatch) {
                info.era = centuryMatch[1];
            }
        }

        // Extract the first sentence as description (usually contains profession/notable info)
        const firstSentence = extract.split(/[.!?]/)[0];
        if (firstSentence) {
            // Clean up the sentence - remove the name and dates to get the description
            let description = firstSentence
                .replace(/\([^)]*\)/g, '')  // Remove parentheticals (dates, etc.)
                .replace(new RegExp(`^${name.split(' ')[0]}[^,]*,?\\s*`, 'i'), '') // Remove name
                .replace(/^was\s+(an?\s+)?/i, '')  // Remove "was a/an"
                .replace(/^is\s+(an?\s+)?/i, '')   // Remove "is a/an"
                .trim();

            // Capitalize first letter
            if (description) {
                description = description.charAt(0).toUpperCase() + description.slice(1);
            }

            // If description is too short, use more of the extract
            if (description.length < 20) {
                const sentences = extract.split(/[.!?]/).slice(0, 2).join('. ');
                description = sentences
                    .replace(/\([^)]*\)/g, '')
                    .substring(0, 150)
                    .trim();
                if (description && !description.endsWith('.')) {
                    description += '...';
                }
            }

            // Truncate if too long
            if (description.length > 100) {
                description = description.substring(0, 97) + '...';
            }

            info.description = description;
        }

        // Fallback description if parsing failed
        if (!info.description) {
            info.description = 'Historical figure';
        }

        return info;
    }
};

/**
 * Wikiquote API - Fetches quotes for a person
 * Uses the Wikipedia/Wikiquote API
 */
const WikiquoteAPI = {
    baseUrl: 'https://en.wikiquote.org/w/api.php',

    /**
     * Search for a person's Wikiquote page
     * @param {string} name - Person's name
     * @returns {Promise<string|null>} Page title or null
     */
    async searchPerson(name) {
        const params = new URLSearchParams({
            action: 'query',
            list: 'search',
            srsearch: name,
            format: 'json',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();

            if (data.query?.search?.length > 0) {
                return data.query.search[0].title;
            }
            return null;
        } catch (error) {
            console.warn('Wikiquote search failed:', error);
            return null;
        }
    },

    /**
     * Get quotes from a Wikiquote page
     * @param {string} pageTitle - The page title
     * @returns {Promise<string[]>} Array of quotes
     */
    async getQuotes(pageTitle) {
        const params = new URLSearchParams({
            action: 'query',
            titles: pageTitle,
            prop: 'extracts',
            exintro: false,
            explaintext: true,
            format: 'json',
            origin: '*'
        });

        try {
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();

            const pages = data.query?.pages;
            if (!pages) return [];

            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId]?.extract || '';

            // Parse quotes from the extract
            const quotes = this.parseQuotes(extract);
            return quotes.slice(0, 5); // Return up to 5 quotes
        } catch (error) {
            console.warn('Wikiquote fetch failed:', error);
            return [];
        }
    },

    /**
     * Parse quotes from Wikiquote extract text
     * @param {string} text - Raw extract text
     * @returns {string[]} Array of parsed quotes
     */
    parseQuotes(text) {
        const quotes = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            // Look for lines that appear to be quotes (reasonable length, not headers)
            if (trimmed.length > 30 &&
                trimmed.length < 500 &&
                !trimmed.startsWith('==') &&
                !trimmed.match(/^\d{4}/) && // Skip year headers
                !trimmed.match(/^[\w\s]+:$/) && // Skip section labels
                trimmed.match(/[.!?"]$/)) { // Ends with punctuation
                quotes.push(trimmed);
            }
        }

        return quotes;
    },

    /**
     * Fetch quotes for a person by name
     * @param {string} name - Person's name
     * @returns {Promise<string[]>} Array of quotes
     */
    async fetchQuotesForPerson(name) {
        const pageTitle = await this.searchPerson(name);
        if (!pageTitle) return [];
        return await this.getQuotes(pageTitle);
    }
};

/**
 * Open Library API - Fetches books and works
 */
const OpenLibraryAPI = {
    baseUrl: 'https://openlibrary.org',

    /**
     * Search for an author
     * @param {string} name - Author's name
     * @returns {Promise<Object|null>} Author data or null
     */
    async searchAuthor(name) {
        try {
            const response = await fetch(
                `${this.baseUrl}/search/authors.json?q=${encodeURIComponent(name)}&limit=1`
            );
            const data = await response.json();

            if (data.docs?.length > 0) {
                return data.docs[0];
            }
            return null;
        } catch (error) {
            console.warn('Open Library author search failed:', error);
            return null;
        }
    },

    /**
     * Get works by an author
     * @param {string} authorKey - Author's Open Library key
     * @returns {Promise<Object[]>} Array of works
     */
    async getAuthorWorks(authorKey) {
        try {
            const response = await fetch(
                `${this.baseUrl}/authors/${authorKey}/works.json?limit=10`
            );
            const data = await response.json();
            return data.entries || [];
        } catch (error) {
            console.warn('Open Library works fetch failed:', error);
            return [];
        }
    },

    /**
     * Fetch notable works for a person
     * @param {string} name - Person's name
     * @returns {Promise<string[]>} Array of work titles
     */
    async fetchWorksForPerson(name) {
        const author = await this.searchAuthor(name);
        if (!author?.key) return [];

        const authorKey = author.key.replace('/authors/', '');
        const works = await this.getAuthorWorks(authorKey);

        return works
            .map(work => work.title)
            .filter(title => title && title.length > 0)
            .slice(0, 5);
    }
};

/**
 * Gutendex API - Fetches public domain texts from Project Gutenberg
 */
const GutendexAPI = {
    baseUrl: 'https://gutendex.com',

    /**
     * Search for books by author
     * @param {string} authorName - Author's name
     * @returns {Promise<Object[]>} Array of books
     */
    async searchByAuthor(authorName) {
        try {
            const response = await fetch(
                `${this.baseUrl}/books?search=${encodeURIComponent(authorName)}`
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.warn('Gutendex search failed:', error);
            return [];
        }
    },

    /**
     * Get text content from a book
     * @param {Object} book - Book object from Gutendex
     * @returns {Promise<string|null>} Text excerpt or null
     */
    async getBookExcerpt(book) {
        // Find a plain text format
        const textUrl = book.formats?.['text/plain; charset=utf-8'] ||
                       book.formats?.['text/plain'] ||
                       book.formats?.['text/plain; charset=us-ascii'];

        if (!textUrl) return null;

        try {
            const response = await fetch(textUrl);
            const text = await response.text();

            // Extract a meaningful excerpt (skip Gutenberg header)
            const excerpt = this.extractExcerpt(text);
            return excerpt;
        } catch (error) {
            console.warn('Gutendex text fetch failed:', error);
            return null;
        }
    },

    /**
     * Extract a clean excerpt from Gutenberg text
     * @param {string} text - Full text
     * @returns {string} Clean excerpt
     */
    extractExcerpt(text) {
        // Find the start of actual content (after Gutenberg header)
        const startMarkers = ['*** START OF', '***START OF', 'CHAPTER', 'BOOK '];
        let startIndex = 0;

        for (const marker of startMarkers) {
            const idx = text.indexOf(marker);
            if (idx !== -1) {
                // Find the next line after the marker
                const nextLine = text.indexOf('\n', idx);
                if (nextLine !== -1) {
                    startIndex = Math.max(startIndex, nextLine + 1);
                }
            }
        }

        // Get a chunk of text after the header
        const content = text.substring(startIndex, startIndex + 3000);

        // Find complete paragraphs
        const paragraphs = content.split(/\n\n+/)
            .map(p => p.trim().replace(/\s+/g, ' '))
            .filter(p => p.length > 50 && p.length < 500);

        // Return first 2-3 good paragraphs
        return paragraphs.slice(0, 3).join('\n\n');
    },

    /**
     * Fetch public domain text excerpt for a person
     * @param {string} name - Person's name
     * @returns {Promise<{title: string, excerpt: string}|null>} Title and excerpt or null
     */
    async fetchExcerptForPerson(name) {
        const books = await this.searchByAuthor(name);

        // Filter to books actually by this author
        const authorBooks = books.filter(book =>
            book.authors?.some(author =>
                author.name?.toLowerCase().includes(name.split(' ').pop().toLowerCase())
            )
        );

        if (authorBooks.length === 0) return null;

        // Try to get an excerpt from the first available book
        for (const book of authorBooks.slice(0, 3)) {
            const excerpt = await this.getBookExcerpt(book);
            if (excerpt) {
                return {
                    title: book.title,
                    excerpt: excerpt
                };
            }
        }

        return null;
    }
};

/**
 * Fetch all available source material for a guest
 * @param {Object} guest - Guest object
 * @returns {Promise<Object>} Source material
 */
async function fetchSourceMaterial(guest) {
    const material = {
        quotes: [],
        works: [],
        excerpt: null
    };

    try {
        // Fetch in parallel for speed
        const [quotes, works, excerpt] = await Promise.all([
            WikiquoteAPI.fetchQuotesForPerson(guest.name),
            OpenLibraryAPI.fetchWorksForPerson(guest.name),
            GutendexAPI.fetchExcerptForPerson(guest.name)
        ]);

        material.quotes = quotes;
        material.works = works;
        material.excerpt = excerpt;
    } catch (error) {
        console.warn(`Failed to fetch source material for ${guest.name}:`, error);
    }

    return material;
}

/**
 * Fetch source material for multiple guests
 * @param {Object[]} guests - Array of guest objects
 * @returns {Promise<Map>} Map of guest ID to source material
 */
async function fetchAllSourceMaterial(guests) {
    const materialMap = new Map();

    // Fetch material for all guests in parallel
    const results = await Promise.all(
        guests.map(async guest => {
            const material = await fetchSourceMaterial(guest);
            return { id: guest.id, material };
        })
    );

    for (const { id, material } of results) {
        materialMap.set(id, material);
    }

    return materialMap;
}
