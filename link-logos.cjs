const fs = require('fs');

const files = fs.readdirSync('.')
  .filter(f => f.endsWith('.html') && (f.startsWith('farmer-') || f.startsWith('consumer-')));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Wrap any <img src="/assets/app_logo.png"...> with an <a> tag pointing to role.html, 
  // ONLY if it's not already wrapped in an <a> tag.
  
  // First, check if it's already wrapped (in case script runs twice)
  if (!content.includes('<a href="/role.html"')) {
    content = content.replace(
      /(<img[^>]*src="\/assets\/app_logo\.png"[^>]*>)/g,
      '<a href="/role.html" title="Switch Role" style="display:block; text-align:center;">$1</a>'
    );
    fs.writeFileSync(f, content, 'utf8');
  }
});

console.log("Linked logos to role.html in " + files.length + " files.");
