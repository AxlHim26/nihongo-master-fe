import fs from 'fs';
import path from 'path';
import { translate } from 'google-translate-api-x';
import pLimit from 'p-limit';

const KANJI_DIR = '/run/media/jun/999d1d27-a5c5-4898-bdf4-179df4856a87/data/kanji';
const DICT_DIR = '/run/media/jun/999d1d27-a5c5-4898-bdf4-179df4856a87/data/temp_dict/out_vn';
const CACHE_FILE = '/run/media/jun/999d1d27-a5c5-4898-bdf4-179df4856a87/data/kanji-translation-cache.json';
const CONFIG_FILE = '/run/media/jun/999d1d27-a5c5-4898-bdf4-179df4856a87/data/config.json';

// --- CONFIGURATION ---
let config = { mode: "FAST", aiApiKey: "" };
if (fs.existsSync(CONFIG_FILE)) {
    try {
        config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e) {
        console.warn("Invalid config.json, using defaults.");
    }
}

const limit = pLimit(5); // Concurrency

let translationCache = { en_vi: {}, vi_en: {} };

if (fs.existsSync(CACHE_FILE)) {
    try {
        const rawCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        if (rawCache.en_vi && rawCache.vi_en) {
            translationCache = rawCache;
        } else {
            console.warn("Cache file format is old, migrating to new structure...");
            translationCache.en_vi = rawCache;
        }
    } catch (e) {
        console.warn("Could not parse cache, starting fresh.");
    }
}

let saveTimeout = null;
function saveCache() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(translationCache, null, 2));
    }, 1500);
}

// --- DICTIONARY ---
const hanVietDict = {};
['kanji_bank_1.json', 'kanji_bank_2.json'].forEach(file => {
    const p = path.join(DICT_DIR, file);
    if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        for (const item of data) {
            const kanji = item[0];
            const readings = item[1] ? item[1].split(' ') : [];
            const definitions = item[4] || [];
            const parsedDefs = definitions.map(def => def.replace(/^\[.*?\]\s*/, '').replace(/^- /, ''));
            hanVietDict[kanji] = {
                readings,
                meanings: parsedDefs
            };
        }
    }
});

function isKanji(ch) {
    return ch >= '\u4e00' && ch <= '\u9faf';
}

function getCompoundHanViet(word) {
    let res = [];
    for (const ch of word) {
        if (isKanji(ch)) {
            const info = hanVietDict[ch];
            if (info && info.readings[0]) {
                res.push(info.readings[0]);
            } else {
                res.push(ch);
            }
        } else {
            // Include non-kanji characters as is, or ignore? The prompt said "chỉ âm Hán Việt"
            // Let's omit hiragana from the HanViet array or keep it depending on usage. 
            // Better to keep the array purely string.
            // For compound, we return an array of strings or a joined string. The prompt asks for array for root, and array for compound?
            // "hanViet": ["âm Hán Việt"]
        }
    }
    return res;
}

function generateHanVietExplainVi(word, translatedMeaning) {
    const chars = Array.from(word).filter(isKanji);
    if (chars.length === 0) return null;

    if (chars.length === 1) {
        const kanji = chars[0];
        const info = hanVietDict[kanji];
        if (!info) return null;
        const reading = info.readings[0] || '';
        const meaning = info.meanings.join(', ');
        return `${reading}: ${meaning}`.trim();
    }

    const parts = [];
    for (const kanji of chars) {
        const info = hanVietDict[kanji];
        if (info) {
            const reading = info.readings[0] || '?';
            const meaning = info.meanings[0] || '?';
            parts.push(`${kanji} (${reading}: ${meaning})`);
        } else {
            parts.push(`${kanji}`);
        }
    }

    const vnMeaning = translatedMeaning ? translatedMeaning : '';
    return `${parts.join(' + ')} → ${vnMeaning}`.trim();
}

// --- TRANSLATION CORE ---
async function apiTranslate(text, fromLng, toLng) {
    if (!text || typeof text !== 'string') return null;
    const clean = text.trim();
    if (!clean) return null;

    const cacheKey = `${fromLng}_${toLng}`;
    if (!translationCache[cacheKey]) translationCache[cacheKey] = {};

    if (translationCache[cacheKey][clean] !== undefined) {
        return translationCache[cacheKey][clean];
    }

    try {
        const res = await limit(() => translate(clean, { from: fromLng, to: toLng }, { retries: 2 }));
        let result = res.text.toLowerCase();

        // OPTION B: AI Refinement (Mocked/Placeholder unless API key provides logic)
        // If config requires QUALITY and we have a key, we'd call AI here.
        // For now, if config.mode === 'QUALITY', we use the basic translation.
        if (config.mode === 'QUALITY' && config.aiApiKey) {
            // Refine with AI - (Add your actual AI fetching logic here if desired)
            // result = await refineWithAI(result, clean, fromLng, toLng);
        }

        translationCache[cacheKey][clean] = result;
        saveCache();
        return result;
    } catch (err) {
        console.error(`\nTranslation failed for "${clean}":`, err.message);
        translationCache[cacheKey][clean] = null;
        saveCache();
        return null;
    }
}

async function enforceBilingualMeaning(obj, defaultEnMeaning = null) {
    if (!obj) return;

    const target = obj;

    // Extract current meaning
    let currentEn = defaultEnMeaning;
    let currentVi = null;

    if (typeof target.meaning === 'object' && target.meaning !== null) {
        currentEn = target.meaning.en || target.meaning.english || currentEn;
        currentVi = target.meaning.vi || null;
    } else if (typeof target.meaning === 'string') {
        currentEn = target.meaning;
    } else if (target.meaningEN) {
        currentEn = target.meaningEN;
    }

    if (target.meaningVN) {
        currentVi = target.meaningVN;
    }

    // Attempt translations
    if (currentEn && !currentVi) {
        currentVi = await apiTranslate(currentEn, 'en', 'vi');
    } else if (currentVi && !currentEn) {
        currentEn = await apiTranslate(currentVi, 'vi', 'en');
    }

    // Set structure
    target.meaning = {
        vi: currentVi || null,
        en: currentEn || null
    };

    // Clean up old properties
    delete target.meaningVN;
    delete target.meaningEN;
}

async function processFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const kanjiChar = data.id;

    // ROOT KANJI
    const rootMeaningEn = data.kanjialiveData?.kanji?.meaning?.english || (data.jishoData?.meaning ? data.jishoData.meaning : null);
    await enforceBilingualMeaning(data, rootMeaningEn);

    // root hanViet
    if (hanVietDict[kanjiChar] && hanVietDict[kanjiChar].readings.length > 0) {
        data.hanViet = hanVietDict[kanjiChar].readings;
    }

    // root hanVietExplain
    if (hanVietDict[kanjiChar]) {
        if (!data.hanVietExplain || typeof data.hanVietExplain !== 'object') {
            const vi = generateHanVietExplainVi(kanjiChar);
            const en = await apiTranslate(vi, 'vi', 'en');
            data.hanVietExplain = { vi, en };
        }
    }

    // kanjialiveData.examples
    if (data.kanjialiveData?.examples) {
        for (const ex of data.kanjialiveData.examples) {
            await enforceBilingualMeaning(ex);

            const word = ex.japanese.replace(/（.*?）/g, '');
            ex.hanViet = getCompoundHanViet(word);

            if (!ex.hanVietExplain || typeof ex.hanVietExplain !== 'object') {
                const vi = generateHanVietExplainVi(word, ex.meaning?.vi);
                const en = await apiTranslate(vi, 'vi', 'en');
                ex.hanVietExplain = { vi, en };
            }
        }
    }

    // jishoData examples (onyomi)
    if (data.jishoData?.onyomiExamples) {
        for (const ex of data.jishoData.onyomiExamples) {
            await enforceBilingualMeaning(ex, ex.meaning);
            ex.hanViet = getCompoundHanViet(ex.example);

            if (!ex.hanVietExplain || typeof ex.hanVietExplain !== 'object') {
                const vi = generateHanVietExplainVi(ex.example, ex.meaning?.vi);
                const en = await apiTranslate(vi, 'vi', 'en');
                ex.hanVietExplain = { vi, en };
            }
        }
    }

    // jishoData examples (kunyomi)
    if (data.jishoData?.kunyomiExamples) {
        for (const ex of data.jishoData.kunyomiExamples) {
            await enforceBilingualMeaning(ex, ex.meaning);
            ex.hanViet = getCompoundHanViet(ex.example);

            if (!ex.hanVietExplain || typeof ex.hanVietExplain !== 'object') {
                const vi = generateHanVietExplainVi(ex.example, ex.meaning?.vi);
                const en = await apiTranslate(vi, 'vi', 'en');
                ex.hanVietExplain = { vi, en };
            }
        }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

async function main() {
    console.log(`Starting in MODE: ${config.mode}`);
    const files = fs.readdirSync(KANJI_DIR).filter(f => f.endsWith('.json') && !f.startsWith('CDP'));

    let targetFiles = files;
    const targetFileArgIdx = process.argv.indexOf('--file');
    if (targetFileArgIdx !== -1) {
        targetFiles = [process.argv[targetFileArgIdx + 1]];
    }

    console.log(`Processing ${targetFiles.length} files...`);
    let count = 0;
    for (const file of targetFiles) {
        await processFile(path.join(KANJI_DIR, file));
        count++;
        if (count % 50 === 0) console.log(`Processed ${count} files...`);
    }

    if (saveTimeout) clearTimeout(saveTimeout);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(translationCache, null, 2));
    console.log('Done.');
}

main().catch(console.error);
