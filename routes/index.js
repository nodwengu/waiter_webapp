const express = require('express');
const router = express.Router();

const { Pool, Client } = require('pg');

let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
   useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/waiterapp_db';

const pool = new Pool({
   connectionString,
   ssl: useSSL
});

const CreateWaiter = require('../createWaiter');
const createWaiter = CreateWaiter(pool);

router.get('/', async (req, res, next) => {
   try {
      let daysList = await createWaiter.getAllDays();
      createWaiter.updateCurrentDate();

      res.render('index', {
         days: daysList,
         waiters: await createWaiter.getAllWaiters(),
         messages: req.flash('info')
      });

   } catch (error) {
      next(error);
   }
});

router.get('/waiters/:username', async (req, res, next) => {
   try {
      let username = req.params.username;
      res.render('options', {
         username,
         days: await createWaiter.getAllDays(),
         waiters: await createWaiter.getAllWaiters(),
         waiterDays: await createWaiter.getDaysByName(username),
         messages: req.flash('info')
      })

   } catch (error) {
      next(error);
   }
});

router.post('/waiters/:username', async (req, res, next) => {
   try {
      let username = req.params.username;
      let days = await createWaiter.getAllDays();
      let waiterDays = await createWaiter.getDaysByName(username);
      let waiterSelections;
      
      if(typeof req.body.days === 'string') {
         waiterSelections = [req.body.days];
      } else {
         waiterSelections = req.body.days;
      }

      if(waiterSelections !== undefined) {
         if(waiterSelections.length >= 5) {
            req.flash('info', 'MORE THAN FIVE');
            console.log("NEED TO SELECT FIVE");
            //return;
         } else {
            for (let day of days) {
               for (let selection of waiterSelections) {
                  if (day.day_name === selection) {
                     await createWaiter.updateDayCounter({ day_name: day.day_name });
                     await createWaiter.setWaiterDays({ username, day_name: selection });
                     await createWaiter.setColor(day.day_name)
                  }
               }
            }
         }
      } else {
         //FLASH MESSAGE WILL GO HERE
         req.flash('info', 'Input needed!!!');
         console.log("Input needed!!!");
      }

      res.redirect(`/waiters/${req.params.username}`)
   }
   catch (error) {
      next(error);
   }
});

router.get('/delete', async (req, res, next) => {
   try {
      await createWaiter.deleteWaiterDays();
      await createWaiter.resetAll();

      res.redirect(`/`)

   } catch (error) {
      next(error);
   }

});

module.exports = router;