const express = require('express');
const bcrypt = require('bcrypt');
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

function validUser(user) {
   let validUsername = typeof user.username === 'string' && user.username.trim() != '';
   let validPassword = typeof user.password === 'string' && user.password.trim() != '' && 
                        user.password.trim().length >=6;

   return validUsername && validPassword;
}
 
router.get('/signup', (req, res, next) => {
   try {
      if(req.signedCookies.userName) {
         res.redirect('/');
      } else {
         res.render('signup', {
            messages: req.flash('info')
         });
      }    
   } catch (error) {
      next(error);
   }
});

router.post('/signup', async (req, res, next) => { 
   try {
      if(validUser(req.body)) {
         
         let user = await createWaiter.getWaiterByUsername(req.body.username);
         
         //If not found
         if(!user) {
            //This is a unique user
            //Hash the password
            let hash = await bcrypt.hash(req.body.password, 10);
            
            //We are now ready to send our user data to the database
            let user = {
               username: req.body.username,
               password: hash
            }

            //Add new user to the database
            createWaiter.createUser(user);

            //Setting the 'set-cookie header'
            res.cookie('userName', req.body.username, {
               httpOnly: true,
               // secure: true,
               signed: true
            });
            // req.flash('info', 'Successfully added new user');
            res.redirect(`/waiters/${req.body.username}`);
         } else {
            req.flash('info', 'Email in use!');
         } 
      } else {
         req.flash('info', 'Invalid user');
      }
   } catch (error) {
      next(error)
   }
});

router.get('/login', async (req, res, next) => {
   try {
      //Redirect if user is already signed in
      if(req.signedCookies.userName) {
         res.redirect('/');
      } else {
         res.render('login', {
            messages: req.flash('info')
         });
      }
   } catch (error) {
      next(error);
   }
});

router.post('/login', async (req, res, next) => {
   try{
      if(validUser(req.body)) {
         let user = await createWaiter.getWaiterByUsername(req.body.username);
         if(user) {
            //Compare password with hashed password
            // Load hash from your password DB.
            let result = await bcrypt.compare(req.body.password, user.password);
           
            //If the password match
            if(result) {
               //Setting the 'set-cookie header'
               res.cookie('userName', user.username, {
                  httpOnly: true,
                  // secure: true,
                  signed: true
               });
            } else {
               req.flash('info', 'Invalid login');
            }     
         } else {
            req.flash('info', 'User does not exist')
         }
      } else {
         req.flash('info', 'Invalid login');
      }     
      res.redirect('/auth/login')
   } 
   catch(error) {
      next(error);
   }
});

router.get('/logout', (req, res, next) => {
   try {   
      res.clearCookie('userName');
      res.redirect(`/`);
   } catch (error) {
      next(error);
   }
})

module.exports = router;