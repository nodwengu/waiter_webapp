module.exports = function CreateWaiter(pool) {
   let color = '';

   async function getAllDays() {
      let query = `SELECT * FROM weekdays ORDER BY curr_day`;
      let results = await pool.query(query);

      return results.rows;
   }

   async function getAllWaiters() {
      let query = `SELECT * FROM waiters`;
      let results = await pool.query(query);

      return results.rows;
   }

   async function setWaiterDays(waiter) {
      let data = [
         waiter.username,
         waiter.day_name,
      ];
      let query = `INSERT INTO waiterdays(username, day_name) VALUES($1, $2)`;
      return await pool.query(query, data);
   }

   async function createUser(user) {
      let data = [
         user.username,
         user.password
      ];
      let query = `INSERT INTO waiters(username, password) VALUES($1, $2)`;
      return await pool.query(query, data);
   }

   async function getAllWaiterDays() {
      let query = `SELECT * FROM waiterdays`;
      let results = await pool.query(query);
      return results.rows;
   }

   async function updateDayCounter(day) {
      let query = `UPDATE weekdays
                  SET days_counter = days_counter + 1
                  WHERE day_name = '${day.day_name}'`;

      return await pool.query(query);
   }

   async function getCounterByDayName(day_name) {
      let query = `SELECT days_counter FROM weekdays WHERE day_name = '${day_name}'`;
      let results = await pool.query(query);
      return results.rows[0];
   }

   async function getDaysByName(username) {
      let query = `SELECT * FROM waiterdays WHERE username = '${username}' `;
      let results = await pool.query(query);

      return results.rows;
   }

   async function setColor(theDay) {
      let days = await getAllDays();
      let color = '';

      for(let day of days) {
         if(day.day_name == theDay) {
            if(day.days_counter === 3) {
               color = 'enough';
            } else if(day.days_counter < 3) {
               color = 'less';
            } else if(day.days_counter > 3) {
               color = 'extra';
            }
         }
      }
      let query = `UPDATE weekdays
               SET avail_status = '${color}'
               WHERE day_name = '${theDay}'`;

      return await pool.query(query);
   }

   async function getColor() {
      return color;
   }

   async function deleteWaiterDays() {
      return pool.query('DELETE FROM waiterdays;');
   }

   //update counter and avail_status from weekday
   async function resetAll() {
      let query = `UPDATE weekdays SET days_counter = 0, avail_status = 'less';`
      return await pool.query(query);
   }

   async function setDates(newDate, dayName) {
      let query = `UPDATE weekdays SET curr_date = ${newDate} WHERE day_name = '${dayName}'`;
      return await pool.query(query);
   }

   async function updateCurrentDate() {
      let daysList = await getAllDays();

      for(let day of daysList) {
         let myDate = new Date();
         myDate.setDate( myDate.getDate() + (  day.curr_day - myDate.getDay() ) );
         let curr_date = myDate.getDate();
         
         //console.log(`Date: ${curr_date}`);
         await setDates(curr_date, day.day_name);
      }
   }

   async function isDayRepeated(name, theDay) {
      let isRepeated = false;
      let userDays = await getDaysByName(name);
 
      for(let day of userDays) {
         if(day.day_name === theDay) {
            isRepeated = true;
            break;
         }
      }
      return isRepeated;
   }

   //Returns all waiters that are working on a specific day
   async function getAllByDay(dayName) {
      let query = `SELECT * FROM waiterdays WHERE day_name = '${dayName}'`;
      let results = await pool.query(query);

      return results.rows;
   }

   //Returns all waiters that are NOT working on a selected day
   async function getAllAvailableWaiters(theDay) {
      let query = `SELECT username FROM waiters
                  WHERE usertype = 'waiter' 
                  EXCEPT 
                     SELECT username FROM waiterdays
                     WHERE day_name = '${theDay}' `;
      let results = await pool.query(query);

      return results.rows;
   }

   //Remove a waiter from a particular day
   async function removeFromDay(theDay, theName) {
      let query = `DELETE FROM waiterdays
         WHERE username = '${theName}' AND day_name = '${theDay}'`;

      return await pool.query(query);
   }

   async function reduceDayCounter(day) {
      let query = `UPDATE weekdays
                  SET days_counter = days_counter - 1
                  WHERE day_name = '${day.day_name}'`;

      return await pool.query(query);
   }

   async function getWaiterByUsername(theName) {
      let query = `SELECT * FROM waiters WHERE username = '${theName}'`;
      let results = await pool.query(query);

      return results.rows[0];
   }
   
   return {
      getAllDays,
      getAllWaiters,

      setWaiterDays,
      getAllWaiterDays,
      updateDayCounter,
      getCounterByDayName,

      setColor,
      getColor,
      deleteWaiterDays,
      resetAll,
      getDaysByName,
      setDates,
      updateCurrentDate,
      isDayRepeated,
      getAllByDay,
      getAllAvailableWaiters,
      removeFromDay,
      reduceDayCounter,
      getWaiterByUsername,

      createUser

      // getDaysByDayName,
   };
};