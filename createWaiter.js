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

   async function setDay(day) {
      let data = [
         day.day_name,
         day.day_code,
         day.waiter_id
      ]
      let query = `INSERT INTO days(day_name, day_code, waiter_id) VALUES($1, $2, $3)`;
      return await pool.query(query, data);
   }

   async function getWaiterIdByName() {
      let queryResult = `SELECT waiter_id FROM waiters WHERE username LIKE '${name}'`;
      let results = await pool.query(queryResult);
      
      return results.rows[0].town_id;
   }

   return {
      getAllDays,
      getAllWaiters
   }
}