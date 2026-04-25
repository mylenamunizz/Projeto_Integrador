// Complete test to simulate the entire data flow

// Step 1: Simulate CSV content with trailing semicolons
const csvContent = `name,email,password,role,position,points,managerEmail;;;;;;;;;
Linguine,linguine@azis.com,123456,Gestor,Onipresente,1213,linguine@azis.com;;;;;;;;;
Kaua,kaua@azis.com,123456,Funcionario,Fudido,1213,linguine@azis.com;;;;;;;;;
Karol,karol@azis.com,123456,Funcionario,Fudida,1213,kaua@azis.com;;;;;;;;;`;

console.log('=== STEP 1: Original CSV ===');
console.log(csvContent);

// Step 2: Sanitize CSV (frontend function)
function sanitizeCsvContent(csvText) {
  const lines = csvText.split('\n');
  const sanitizedLines = lines.map((line) => {
    if (!line.trim()) return line;
    let sanitized = line.replace(/[;,]*\s*$/, '');
    while (sanitized.endsWith(';') || sanitized.endsWith(',')) {
      sanitized = sanitized.slice(0, -1).trim();
    }
    return sanitized;
  });
  return sanitizedLines.join('\n');
}

const sanitizedCsv = sanitizeCsvContent(csvContent);
console.log('\n=== STEP 2: After Sanitization ===');
console.log(sanitizedCsv);

// Step 3: Parse CSV (simulate Papa.parse - with proper headerMap logic like frontend)
function parseCSVWithHeaderMap(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  if (lines.length < 1) return [];
  
  const headerLine = lines[0];
  const rawHeaders = headerLine.split(',').map(h => h.trim());
  
  // Create header map like frontend does
  const headerMap = {};
  const nameAliases = ["name", "nome", "usuario", "usuário", "user"];
  const emailAliases = ["email", "e-mail", "mail", "correio"];
  
  rawHeaders.forEach((h, idx) => {
    const normalized = h.replace(/[;,]+/g, '').toLowerCase();
    if (nameAliases.includes(normalized)) headerMap["name"] = idx;
    else if (emailAliases.includes(normalized)) headerMap["email"] = idx;
    else if (["role", "cargo", "função", "funcao"].includes(normalized)) headerMap["role"] = idx;
    else if (["position", "posição", "posicao", "setor"].includes(normalized)) headerMap["position"] = idx;
    else if (["points", "pontos", "saldo"].includes(normalized)) headerMap["points"] = idx;
    else if (["manageremail", "gestoremail", "emailgestor", "manager_email", "email_do_gestor"].includes(normalized)) headerMap["manageremail"] = idx;
    else if (["password", "senha"].includes(normalized)) headerMap["password"] = idx;
  });
  
  // getValue function from frontend
  const dataRows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',');
    
    const getValue = (key) => {
      const idx = headerMap[key];
      if (idx !== undefined && cells[idx] !== undefined) {
        let val = String(cells[idx]).trim();
        val = val.replace(/[;,]+$/, '').trim();
        return val;
      }
      return '';
    };
    
    const row = {
      name: getValue("name"),
      email: getValue("email"),
      password: getValue("password"),
      role: getValue("role"),
      position: getValue("position"),
      points: getValue("points"),
      managerEmail: getValue("manageremail"),
    };
    dataRows.push(row);
  }
  
  return dataRows;
}

const parsedData = parseCSVWithHeaderMap(sanitizedCsv);
console.log('\n=== STEP 3: Parsed Data ===');
console.log(JSON.stringify(parsedData, null, 2));

// Step 4: Transform to user objects (frontend processing)
function normalizeRole(input) {
  const csvRoleToInternal = {
    manager: 'gestor',
    gestor: 'gestor',
    member: 'funcionario',
    funcionario: 'funcionario',
    admin: 'admin',
  };
  
  if (!input) return 'funcionario';
  const key = input.trim().toLowerCase();
  return csvRoleToInternal[key] || 'funcionario';
}

const users = parsedData.map((row, idx) => {
  const role = normalizeRole(row['role']);
  
  return {
    name: row['name'] || '',
    email: (row['email'] || '').toLowerCase(),
    password: row['password'] || '123456',
    role: role,
    position: row['position'] || null,
    points: parseInt(row['points'] || 0),
    managerEmail: (row['managerEmail'] || '').toLowerCase(),
    __row: idx + 2,
  };
});

console.log('\n=== STEP 4: Transformed Users ===');
console.log(JSON.stringify(users, null, 2));

// Step 5: Sanitize users (backend function)
function sanitizeUserData(userData) {
  const sanitized = {};
  for (const [key, value] of Object.entries(userData)) {
    if (typeof value === 'string') {
      let cleaned = value.replace(/[;,]+$/, '').trim();
      sanitized[key] = cleaned;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function sanitizeUsers(users) {
  return users.map((user) => sanitizeUserData(user));
}

const sanitizedUsers = sanitizeUsers(users);
console.log('\n=== STEP 5: Sanitized Users (Backend) ===');
console.log(JSON.stringify(sanitizedUsers, null, 2));

// Step 6: Backend validations
console.log('\n=== STEP 6: Backend Validations ===');
const errors = [];
const seenEmails = new Set();

for (const user of sanitizedUsers) {
  const { name, email, role } = user;
  const row = user.__row;
  
  if (!name || !email) {
    errors.push({ linha: row, email, status: 'falha', motivo: 'Nome e email obrigatórios' });
    continue;
  }
  
  if (seenEmails.has(email)) {
    errors.push({ linha: row, email, status: 'duplicado' });
    continue;
  }
  seenEmails.add(email);
  
  if (role === 'admin') {
    errors.push({ linha: row, email, status: 'falha', motivo: 'Não é permitido criar Admin via planilha' });
    continue;
  }
  
  console.log(`✓ User "${name}" (${email}) - role: ${role} - managerEmail: ${user.managerEmail}`);
}

if (errors.length > 0) {
  console.log('\n⚠️  Errors:');
  errors.forEach(e => console.log(`  - ${e.email}: ${e.motivo}`));
}

console.log('\n=== SUMMARY ===');
console.log(`Total users to create: ${sanitizedUsers.length}`);
console.log(`Validation errors: ${errors.length}`);
console.log(`Users available to create: ${sanitizedUsers.length - errors.length}`);
