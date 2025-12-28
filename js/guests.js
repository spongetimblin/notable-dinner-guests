/**
 * Historical Figures Data
 * Each guest includes biographical info and context for AI conversation generation
 */

const GUESTS = [
    {
        id: 'socrates',
        name: 'Socrates',
        era: '470-399 BCE',
        emoji: '🏺',
        category: 'Philosophy',
        description: 'Classical Greek philosopher',
        context: `Socrates was a classical Greek philosopher credited as a founder of Western philosophy. He wrote nothing himself; we know him through his students Plato and Xenophon. He developed the Socratic method—asking probing questions to stimulate critical thinking and illuminate ideas. He famously said "I know that I know nothing." He questioned Athenian values, wisdom, and morality. He was tried and executed for "corrupting the youth" and "impiety." He chose to drink hemlock rather than abandon his principles or flee Athens. He believed virtue was the highest good and that the unexamined life is not worth living. He emphasized the care of the soul over material concerns.`
    },
    {
        id: 'aurelius',
        name: 'Marcus Aurelius',
        era: '121-180 CE',
        emoji: '🏛️',
        category: 'Philosophy',
        description: 'Roman Emperor and Stoic philosopher',
        context: `Marcus Aurelius was a Roman Emperor from 161 to 180 CE, known as the last of the "Five Good Emperors." He is best remembered for his philosophical work "Meditations," a series of personal writings on Stoic philosophy. He wrote about virtue, duty, mortality, and maintaining equanimity in the face of adversity. He ruled during times of war and plague but strived to govern justly. Stoic principles like focusing on what you can control, accepting fate, and acting with virtue were central to his thinking. He saw philosophy as a practical guide for living well. His writings were private reflections never meant for publication.`
    },
    {
        id: 'lincoln',
        name: 'Abraham Lincoln',
        era: '1809-1865',
        emoji: '🎩',
        category: 'Politics',
        description: '16th President of the United States',
        context: `Abraham Lincoln was the 16th President of the United States, who led the nation through the Civil War and abolished slavery. He was largely self-educated and became a lawyer and Illinois state legislator. He was known for his eloquent speeches including the Gettysburg Address and his Second Inaugural Address. He was deeply thoughtful about morality, democracy, and human equality. He suffered from depression (which he called "melancholy") but maintained his sense of humor. He was assassinated by John Wilkes Booth in 1865. He is widely regarded as one of America's greatest presidents for preserving the Union and ending slavery.`
    },
    {
        id: 'whitman',
        name: 'Walt Whitman',
        era: '1819-1892',
        emoji: '🍃',
        category: 'Literature',
        description: 'American poet, essayist, and journalist',
        context: `Walt Whitman was an American poet and essayist, best known for his poetry collection "Leaves of Grass." He was a humanist and transcendentalist who celebrated democracy, nature, love, and the human body. His free verse style was revolutionary. He worked as a journalist, teacher, and government clerk. He volunteered as a nurse during the Civil War. Famous works include "Song of Myself," "O Captain! My Captain!" and "I Sing the Body Electric." He believed in the spiritual unity of all things and the inherent worth of every person.`
    },
    {
        id: 'hofmann',
        name: 'Albert Hofmann',
        era: '1906-2008',
        emoji: '🔬',
        category: 'Science',
        description: 'Swiss chemist who discovered LSD',
        context: `Albert Hofmann was a Swiss chemist known for synthesizing LSD and first discovering its psychedelic effects in 1943. He worked at Sandoz Laboratories and also studied the chemical structure of chitin. He wrote "LSD: My Problem Child" about his discovery and its implications. Hofmann was interested in the intersection of science and spirituality, and believed psychedelics could be valuable tools for psychiatry and self-understanding. He advocated for responsible research into consciousness-altering substances. He lived to 102 and remained intellectually active throughout his life.`
    },
    {
        id: 'monk',
        name: 'Thelonious Monk',
        era: '1917-1982',
        emoji: '🎹',
        category: 'Music',
        description: 'Jazz pianist and composer',
        context: `Thelonious Monk was an American jazz pianist and composer, considered one of the giants of American music. He had a unique improvisational style with angular melodies and dissonant harmonies. He was a pioneer of bebop and helped develop modern jazz. Famous compositions include "Round Midnight," "Straight No Chaser," and "Blue Monk." Known for his eccentric behavior, distinctive hats, and dancing while other musicians soloed. He was deeply dedicated to his craft and had strong opinions about music and authenticity. He often spoke in riddles and aphorisms about creativity and life.`
    },
    {
        id: 'vonnegut',
        name: 'Kurt Vonnegut',
        era: '1922-2007',
        emoji: '📚',
        category: 'Literature',
        description: 'American novelist and satirist',
        context: `Kurt Vonnegut was an American writer known for his satirical and darkly humorous novels. His works blend satire, science fiction, and absurdism. Famous novels include "Slaughterhouse-Five," "Cat's Cradle," and "Breakfast of Champions." He survived the firebombing of Dresden as a POW in WWII, which deeply influenced his writing. He was known for his humanist philosophy, skepticism of technology and war, and dark humor. He created the phrase "So it goes" as a refrain about death. He was an outspoken socialist and humanist who served as honorary president of the American Humanist Association.`
    },
    {
        id: 'shulgin',
        name: 'Alexander Shulgin',
        era: '1925-2014',
        emoji: '⚗️',
        category: 'Science',
        description: 'Pharmacologist and chemist',
        context: `Alexander "Sasha" Shulgin was an American medicinal chemist, pharmacologist, and author. He is credited with introducing MDMA to psychologists and synthesized and tested over 200 psychoactive compounds. He wrote "PiHKAL" and "TiHKAL" with his wife Ann, documenting their research and experiences. He held a DEA Schedule I researcher license. He believed in the potential of psychedelics for therapy and self-exploration. He was meticulous in his scientific approach while also being deeply interested in consciousness and human experience. He advocated for individual freedom in consciousness exploration.`
    },
    {
        id: 'bogle',
        name: 'John C. Bogle',
        era: '1929-2019',
        emoji: '📈',
        category: 'Finance',
        description: 'Founder of Vanguard, index fund pioneer',
        context: `John Clifton Bogle was an American investor and founder of The Vanguard Group. He created the first index fund available to individual investors. He championed low-cost investing and was critical of Wall Street's high fees. He wrote numerous books including "The Little Book of Common Sense Investing." He believed in long-term investing, staying the course, and not trying to beat the market. He was known for his integrity, frugality, and putting investors first. He advocated for fiduciary standards and criticized speculation. Despite his wealth, he lived modestly and gave generously to charity.`
    },
    {
        id: 'ramdass',
        name: 'Ram Dass',
        era: '1931-2019',
        emoji: '🕉️',
        category: 'Spirituality',
        description: 'Spiritual teacher and author',
        context: `Ram Dass, born Richard Alpert, was an American spiritual teacher, psychologist, and author. He was a Harvard professor who worked with Timothy Leary on psychedelic research before being dismissed. He traveled to India and became a devotee of Neem Karoli Baba. His book "Be Here Now" became a counterculture classic. He taught about consciousness, meditation, aging, death, and service. He founded the Seva Foundation and worked on prison programs. After a stroke in 1997, he spoke about it as a teaching about suffering and grace. His teachings emphasized love, awareness, and being present.`
    },
    {
        id: 'sagan',
        name: 'Carl Sagan',
        era: '1934-1996',
        emoji: '🌌',
        category: 'Science',
        description: 'Astronomer and science communicator',
        context: `Carl Sagan was an American astronomer, planetary scientist, cosmologist, and science communicator. He hosted the TV series "Cosmos: A Personal Voyage" and wrote the novel "Contact." He contributed to NASA missions and research on extraterrestrial life. He popularized science and advocated for scientific skepticism and critical thinking. Famous for phrases like "billions and billions" and "we are made of star stuff." He warned about nuclear winter and climate change. He was an advocate for space exploration and the search for extraterrestrial intelligence (SETI). He had a poetic way of explaining science and humanity's place in the cosmos.`
    }
];

/**
 * Get all guests
 * @returns {Array} Array of guest objects
 */
function getAllGuests() {
    return GUESTS;
}

/**
 * Get a guest by ID
 * @param {string} id - The guest's ID
 * @returns {Object|undefined} The guest object or undefined
 */
function getGuestById(id) {
    return GUESTS.find(guest => guest.id === id);
}

/**
 * Get guests by their IDs
 * @param {Array<string>} ids - Array of guest IDs
 * @returns {Array} Array of guest objects
 */
function getGuestsByIds(ids) {
    return ids.map(id => getGuestById(id)).filter(Boolean);
}

/**
 * Get guests grouped by category
 * @returns {Object} Object with categories as keys and arrays of guests as values
 */
function getGuestsByCategory() {
    return GUESTS.reduce((acc, guest) => {
        if (!acc[guest.category]) {
            acc[guest.category] = [];
        }
        acc[guest.category].push(guest);
        return acc;
    }, {});
}

/**
 * Custom guests storage (session only - not persisted)
 */
let customGuests = [];

/**
 * Generate a unique ID for custom guests
 * @returns {string} Unique ID
 */
function generateCustomGuestId() {
    return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a custom guest object
 * @param {string} name - Guest's name
 * @param {string} era - Guest's era/years
 * @param {string} description - Brief description
 * @returns {Object} Custom guest object
 */
function createCustomGuest(name, era, description) {
    // Get first letter of first and last name for initials
    const nameParts = name.trim().split(' ');
    const initials = nameParts.length > 1
        ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
        : nameParts[0].substring(0, 2);

    return {
        id: generateCustomGuestId(),
        name: name.trim(),
        era: era.trim(),
        emoji: initials.toUpperCase(),
        category: 'Custom',
        description: description.trim(),
        context: `${name} (${era}): ${description}`,
        isCustom: true
    };
}

/**
 * Add a custom guest
 * @param {string} name - Guest's name
 * @param {string} era - Guest's era/years
 * @param {string} description - Brief description
 * @returns {Object} The created guest object
 */
function addCustomGuest(name, era, description) {
    const guest = createCustomGuest(name, era, description);
    customGuests.push(guest);
    return guest;
}

/**
 * Remove a custom guest by ID
 * @param {string} id - The custom guest's ID
 * @returns {boolean} True if removed, false if not found
 */
function removeCustomGuest(id) {
    const index = customGuests.findIndex(g => g.id === id);
    if (index !== -1) {
        customGuests.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get all custom guests
 * @returns {Array} Array of custom guest objects
 */
function getCustomGuests() {
    return customGuests;
}

/**
 * Get all guests including custom ones
 * @returns {Array} Combined array of preset and custom guests
 */
function getAllGuestsIncludingCustom() {
    return [...GUESTS, ...customGuests];
}

/**
 * Get a guest by ID (including custom guests)
 * @param {string} id - The guest's ID
 * @returns {Object|undefined} The guest object or undefined
 */
function getGuestByIdIncludingCustom(id) {
    return getAllGuestsIncludingCustom().find(guest => guest.id === id);
}

/**
 * Get guests by their IDs (including custom guests)
 * @param {Array<string>} ids - Array of guest IDs
 * @returns {Array} Array of guest objects
 */
function getGuestsByIdsIncludingCustom(ids) {
    const allGuests = getAllGuestsIncludingCustom();
    return ids.map(id => allGuests.find(g => g.id === id)).filter(Boolean);
}

/**
 * Clear all custom guests
 */
function clearCustomGuests() {
    customGuests = [];
}
