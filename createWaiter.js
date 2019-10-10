module.exports = function CreateWaiter(pool) {
   let color = '';
   let waiterCounter = 0;

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
      ]
      let query = `INSERT INTO waiterdays(username, day_name) VALUES($1, $2)`;
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
      let query = `SELECT day_name FROM waiterdays WHERE username = '${username}' `;
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
               color = 'less'
            } else if(day.days_counter > 3) {
               color = 'extra'
            }
         }
      }
      let query = `UPDATE weekdays
               SET availability = '${color}'
               WHERE day_name = '${theDay}'`;

      return await pool.query(query);
   }

   async function getColor() {
      return color;
   }

   async function deleteWaiterDays() {
      return pool.query('DELETE FROM waiterdays;');
   }

   //update counter and availability from weekday
   async function resetAll() {
      let query = `UPDATE weekdays SET days_counter = 0, availability = 'less';`
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
      let userDays = await getDaysByName(name)
 
      for(let day of userDays) {
         if(day.day_name === theDay) {
            isRepeated = true;
            break;
         }
      }
      return isRepeated;
   }

   async function getAllByDay(dayName) {
      let query = `SELECT username FROM waiterdays WHERE day_name = '${dayName}'`;
      let results = await pool.query(query);

      return results.rows;
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
      getAllByDay
   }
}