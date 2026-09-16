const fs = require('fs');
let style = fs.readFileSync('src/style.css', 'utf8');

const extra = `
/* Restored missing index.html styles */
.bottom-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-light);
  margin-top: 12px;
  text-align: center;
}

.gear-icon {
  width: 14px;
  height: 14px;
  stroke: var(--color-text-light);
  stroke-width: 1.8;
  fill: none;
}
`;

if (!style.includes('.gear-icon')) {
  fs.writeFileSync('src/style.css', style + '\n' + extra, 'utf8');
}
console.log("Restored gear-icon");
