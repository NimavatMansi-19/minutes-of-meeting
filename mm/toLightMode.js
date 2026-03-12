const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
                filelist = walkSync(filePath, filelist);
            }
        } else {
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                filelist.push(filePath);
            }
        }
    });
    return filelist;
};

const regexReplace = [
    { p: /bg-white\/5/g, r: 'bg-white' },
    { p: /bg-white\/10/g, r: 'bg-slate-50' },
    { p: /bg-white\/15/g, r: 'bg-slate-100' },
    { p: /bg-white\/20/g, r: 'bg-slate-200/50' },
    { p: /bg-white\/\[0\.02\]/g, r: 'bg-slate-50/50' },
    { p: /bg-white\/\[0\.03\]/g, r: 'bg-slate-50/80' },

    { p: /border-white\/5/g, r: 'border-slate-100' },
    { p: /border-white\/10/g, r: 'border-slate-200' },
    { p: /border-white\/20/g, r: 'border-slate-300' },
    { p: /border-white\/30/g, r: 'border-slate-300' },

    { p: /text-white\/40/g, r: 'text-slate-400' },
    { p: /text-white\/50/g, r: 'text-slate-500' },
    { p: /text-white\/60/g, r: 'text-slate-600' },
    { p: /text-white\/70/g, r: 'text-slate-600' },
    { p: /text-white\/80/g, r: 'text-slate-700' },
    { p: /text-white\/90/g, r: 'text-slate-800' },

    { p: /bg-\[\#161224\]\/80/g, r: 'bg-white/80' },
    { p: /bg-\[\#161224\]/g, r: 'bg-slate-50' },

    // Dashboard explicit dark colors
    { p: /bg-black\/40/g, r: 'bg-slate-100/50' },
    { p: /bg-black\/20/g, r: 'bg-slate-50/50' },

    // Now replace text-white with text-slate-900 globally, 
    // BUT we will do a trick: we change text-white to text-slate-900 everywhere,
    // then we revert text-slate-900 back to text-white inside buttons and gradients.
    { p: /text-white/g, r: 'text-slate-900' },

];

const files = walkSync('./app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    regexReplace.forEach(({ p, r }) => {
        content = content.replace(p, r);
    });

    // Re-fix specific text-white instances that got over-replaced
    // Gradients
    content = content.replace(/(from-indigo-\d+\s+to-violet-\d+[^"']*)text-slate-900/g, '$1text-white');
    content = content.replace(/text-slate-900([^"']*from-indigo-\d+\s+to-violet-\d+)/g, 'text-white$1');

    content = content.replace(/(from-\[\#211833\][^"']*)text-slate-900/g, '$1text-white');
    content = content.replace(/text-slate-900([^"']*from-\[\#211833\])/g, 'text-white$1');

    // Specific BG colors
    content = content.replace(/(bg-indigo-600[^"']*)text-slate-900/g, '$1text-white');
    content = content.replace(/(bg-rose-500[^"']*)text-slate-900/g, '$1text-white');

    // Fix placeholders
    content = content.replace(/placeholder:text-slate-900\/70/g, 'placeholder:text-slate-400');

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

// Update layout
let layout = fs.readFileSync('./app/layout.tsx', 'utf8');
layout = layout.replace('className="dark"', 'className=""'); // remove dark mode forced
fs.writeFileSync('./app/layout.tsx', layout, 'utf8');

// Update globals.css
let css = fs.readFileSync('./app/globals.css', 'utf8');
css = css.replace('bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-white placeholder:text-white/30 hover:border-white/20 hover:bg-white/10 shadow-inner', 'bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 hover:border-slate-300 hover:bg-slate-50 shadow-sm');
css = css.replace('-webkit-text-fill-color: white !important;', '-webkit-text-fill-color: black !important;');
fs.writeFileSync('./app/globals.css', css, 'utf8');
