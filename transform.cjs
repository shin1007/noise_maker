const fs = require('fs');
const path = 'C:\\Users\\shin1\\local repos\\noise_maker\\src\\content.ts';
let content = fs.readFileSync(path, 'utf8');

// Standard values for other languages (using English as fallback)
const earphoneModeVal = 'Earphones (Binaural)';
const speakerModeVal = 'Speakers (Isochronic)';

const copyStart = content.indexOf('export const copy: Record<Locale, Copy> = {');
const copyEnd = content.indexOf('};', copyStart);
let copyContent = content.substring(copyStart, copyEnd + 2);

// Split by language keys
const langs = ['ja', 'en', 'zh-Hans', 'es', 'hi', 'bn', 'pt', 'ru', 'yue', 'vi', 'mr', 'te', 'tr', 'ko', 'pa', 'ta', 'jv', 'it', 'fr', 'de', 'id'];

let newCopyContent = 'export const copy: Record<Locale, Copy> = {\n';

langs.forEach((lang, index) => {
    let startMatch = new RegExp(`['"]?${lang}['"]?:\\s*\\{`).exec(copyContent);
    if (!startMatch) return;
    
    let blockStart = startMatch.index;
    let braceCount = 0;
    let blockEnd = -1;
    for (let i = blockStart; i < copyContent.length; i++) {
        if (copyContent[i] === '{') braceCount++;
        if (copyContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                blockEnd = i + 1;
                break;
            }
        }
    }
    
    if (blockEnd === -1) return;
    
    let block = copyContent.substring(blockStart, blockEnd);
    
    // Clean up extra newlines and spaces that might have been introduced
    block = block.replace(/\n\s*\n/g, '\n');
    
    if (lang !== 'ja' && lang !== 'en') {
        if (!block.includes('earphoneMode:')) {
            block = block.replace(/(beatDesc:\s*['"].*?['"],)/, `$1\n    earphoneMode: '${earphoneModeVal}',\n    speakerMode: '${speakerModeVal}',`);
        }
    }
    
    newCopyContent += '  ' + block + (index === langs.length - 1 ? '' : ',') + '\n';
});

newCopyContent += '};';

content = content.replace(copyContent, newCopyContent);

// Fix any double commas or other formatting issues
content = content.replace(/,\s*,/g, ',');
content = content.replace(/},\s*}/g, '}');

fs.writeFileSync(path, content);
console.log('Transformation complete');
