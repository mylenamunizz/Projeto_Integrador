const { pool } = require('./config/db');
(async () => {
  try {
    const r = await pool.query(`SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_name='rewards' ORDER BY ordinal_position`);
    console.log(JSON.stringify(r.rows, null, 2));
    await pool.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
