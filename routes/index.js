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
         messages: req.flash('info')
      });

   } catch (error) {
      next(error);
   }
});

router.get('/day/:day_name', async (req, res, next) => {
   res.render('day',{
      day: req.params.day_name,
      waiterDays: await createWaiter.getAllByDay(req.params.day_name),
   });

   console.log(await createWaiter.getAllByDay(req.params.day_name))
});

router.get('/waiters', async (req, res, next) => {
   res.render('waiters', {
      waiters: await createWaiter.getAllWaiters(),
   });
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
         if(waiterSelections.length > 7 || waiterDays.length > 7) {
            req.flash('info', 'MORE THAN 7 days');
         } else {
            //let exit_loops = false;
            for (let day of days) {
               for (let selection of waiterSelections) {
                  let isRepeated = await createWaiter.isDayRepeated(username, selection)    
                  if(!isRepeated) {
                     if (day.day_name === selection) {
                        await createWaiter.updateDayCounter({ day_name: day.day_name });
                        await createWaiter.setWaiterDays({ username, day_name: selection });
                        await createWaiter.setColor(day.day_name)
                     }
                  } 
                  // else {
                  //    exit_loops = true;
                  //    break;
                  // }
               }
               //if (exit_loops){ break; }
            }
         }
      } else {
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