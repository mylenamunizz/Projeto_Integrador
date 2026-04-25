// Quick test to verify CSV sanitization logic
const csvText = `name,email,password,role,position,points,managerEmail;;;;;;;;;
Linguine,linguine@azis.com,123456,Gestor,Onipresente,1213,linguine@azis.com;;;;;;;;;
Kaua,kaua@azis.com,123456,Funcionario,Fudido,1213,linguine@azis.com;;;;;;;;;
Karol,karol@azis.com,123456,Funcionario,Fudida,1213,kaua@azis.com;;;;;;;;;`;

console.log('=== ORIGINAL CSV ===');
console.log(csvText);
console.log('\n=== AFTER SANITIZATION ===');

// Sanitize - remove trailing delimiters from each line
const lines = csvText.split('\n');
const sanitizedLines = lines.map((line) => {
  if (!line.trim()) return line;
  let sanitized = line.replace(/[;,]*\s*$/, '');
  while (sanitized.endsWith(';') || sanitized.endsWith(',')) {
    sanitized = sanitized.slice(0, -1).trim();
  }
  return sanitized;
});

const sanitized = sanitizedLines.join('\n');
console.log(sanitized);

console.log('\n=== PAPA PARSE SIMULATION ===');
// Simulate Papa.parse - split by comma
const dataLines = sanitized.split('\n');
const headers = dataLines[0].split(',').map(h => h.trim());
console.log('Headers:', headers);

console.log('\nData:');
for (let i = 1; i < dataLines.length; i++) {
  const cells = dataLines[i].split(',').map(c => c.trim());
  const row = {};
  headers.forEach((h, idx) => {
    row[h] = cells[idx];
  });
  console.log(row);
}
