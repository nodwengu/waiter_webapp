DROP TABLE IF EXISTS waiters, weekdays, waiterdays;

CREATE TABLE waiters(
    waiter_id SERIAL NOT NULL,
    username TEXT NOT NULL PRIMARY KEY,
    password TEXT NOT NULL,
    usertype TEXT NOT NULL DEFAULT 'waiter' 
);

CREATE TABLE weekdays(
    day_name TEXT NOT NULL  PRIMARY KEY,
    days_counter INT NOT NULL DEFAULT 0,
    curr_day INT NOT NULL DEFAULT 0, 
    avail_status TEXT NOT NULL DEFAULT 'less',
    curr_date INT NOT NULL DEFAULT 0

);

CREATE TABLE waiterdays(
    id SERIAL NOT NULL PRIMARY KEY,
    username TEXT NOT NULL,
    day_name TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES waiters(username),
    FOREIGN KEY (day_name) REFERENCES weekDays(day_name)
);
INSERT INTO waiters(username, userType) VALUES('Thando', 'admin'),('Johno', 'waiter'),('Vuyo', 'waiter'),('Mark', 'waiter'),('James', 'waiter'),('Admin', 'admin');

-- INSERT INTO waiters(username) VALUES('Thando'),('Johno'),('Vuyo'),('Mark'),('James');
INSERT INTO weekdays(day_name, curr_day) VALUES('Sunday', 0),('Monday', 1),('Tuesday', 2),('Wednesday', 3),('Thursday', 4),('Friday', 5),('Saturday', 6);
INSERT INTO waiterdays(username, day_name) VALUES('Thando','Sunday'),('Vuyo','Monday'),('Thando','Monday');

