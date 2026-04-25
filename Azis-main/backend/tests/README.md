# CSV Import Tests & Troubleshooting

This directory contains tests for the CSV user import functionality, specifically testing:

1. **Sanitization of CSV data** - Removes trailing delimiters (semicolons, commas)
2. **Two-pass manager linking** - Creates users first, then assigns managers in second pass
3. **Warning logs** - Logs warnings when managers are not found

## Quick Troubleshooting

### ❌ Problem: Showing "0 Successfully Created"

**Cause:** Users already exist in database (duplicates)

**Solution:**
```bash
cd backend

# 1. See who's in the database
node scripts/list-users.js

# 2. Clean up test users
node scripts/cleanup-test-users.js

# 3. Try import again in the UI
```

### ❌ Problem: Users not appearing in Organizational Structure

**Solution:**
```bash
cd backend

# 1. Verify users were created with managers
node scripts/list-users.js

# 2. Check database structure
node scripts/final-test.js
```

---

## Test Files

### `import.unit.test.js`
Direct unit test that calls the `createUsers` function with mock request/response objects.
Tests data with trailing semicolons to verify sanitization is working correctly.

**Run:**
```bash
cd backend
node tests/import.unit.test.js
```

**What it tests:**
- Sanitization of data values with trailing semicolons
- Creation of 3 users with proper role assignment
- Manager relationship linking despite sanitization issues
- Warning logging for missing managers

### `import.integration.test.js`
Full integration test that starts an HTTP server and makes actual API requests.

**Run:**
```bash
cd backend
node tests/import.integration.test.js
```

**Requirements:**
- Database must be running and configured in `config/db.js`
- JWT secret should be set in environment or will use default 'secret'

### `import-test-data.csv`
Sample CSV file with the exact data structure specified in requirements, including:
- Trailing semicolons in headers and values to test sanitization
- Three users with manager relationships:
  - Linguine (manager)
  - Kaua (reports to Linguine)
  - Karol (reports to Kaua)

---

## Helper Scripts

Located in `backend/scripts/`:

### `list-users.js`
Lists all users and shows the organizational hierarchy.

```bash
node scripts/list-users.js
```

Output example:
```
📋 Users in database:

👤 Linguine (linguine@azis.com) - Level 2
   └─ Kaua (kaua@azis.com)
      └─ Karol (karol@azis.com)
```

### `cleanup-test-users.js`
Deletes test users (linguine, kaua, karol) to allow re-importing.

```bash
node scripts/cleanup-test-users.js
```

### `final-test.js`
Complete end-to-end test simulating the entire import process.

```bash
node scripts/final-test.js
```

Runs all 7 steps:
1. Cleanup existing test users
2. Create admin user
3. Prepare test data (with sanitization issues)
4. Call createUsers controller
5. Verify users created
6. Verify manager relationships
7. Show complete organizational structure

---

## Expected Flow

### Before Import
```
Database: (empty)
Frontend: No users
```

### During Import
```
CSV Parse ➜ Sanitize ➜ Transform ➜ Validate ➜ Create Users ➜ Link Managers
```

### After Import
```
Database: 3 users with relationships
Frontend: Users appear in Organizational Structure
Linguine (manager) ➜ Kaua (staff) ➜ Karol (staff)
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 0 users created | Users already exist | Run `cleanup-test-users.js` |
| No manager relationships | Database issue | Check `list-users.js` output |
| Manager not found warning | Manager email typo | Check email spelling in CSV |
| CSV parse error | Wrong delimiters | Verify CSV has commas, not semicolons |
| Users not in structure | Permissions issue | User must be Level 2+ to see |

---

## Frontend Updates

The frontend now also shows **duplicates** in the error list:
- Before: "0 Successfully Created, 0 Errors" (confusing!)
- After: "0 Successfully Created, 3 Duplicates" (clear!)

Location: `frontend/src/pages/UserImport.tsx`

---

## Step-by-Step First Import

1. **Ensure database is clean:**
   ```bash
   node scripts/cleanup-test-users.js
   ```

2. **Start backend:**
   ```bash
   npm start
   ```

3. **In browser, navigate to "Importar Usuários"**

4. **Upload `import-test-data.csv`**
   - Should show: "3 Successfully Created, 0 Errors"

5. **Verify in "Estrutura Organizacional":**
   - Check that Linguine, Kaua, Karol appear
   - Check that manager relationships are correct

6. **Check console for warnings:**
   - Verify no missing manager warnings
