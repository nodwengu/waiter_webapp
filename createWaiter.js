module.exports = function CreateWaiter(pool) {
   async function getAllDays() {
      let query = `SELECT * FROM days`;
      let results = await pool.query(query);

      return results.rows;
   }

   async function getAllWaiters() {
      let query = `SELECT * FROM waiters`;
      let results = await pool.query(query);

      return results.rows;
   }

   return {
      getAllDays,
      getAllWaiters
   }
}