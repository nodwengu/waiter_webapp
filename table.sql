DROP TABLE IF EXISTS waiters, days;

CREATE TABLE waiters(
    waiter_id SERIAL NOT NULL PRIMARY KEY,
    username TEXT NOT NULL  
);

CREATE TABLE days(
    day_id SERIAL NOT NULL PRIMARY KEY,
    day_name TEXT NOT NULL,
    day_code TEXT NOT NULL,
    waiter_id INT NOT NULL,
    FOREIGN KEY (waiter_id) REFERENCES waiters(waiter_id)
);

INSERT INTO waiters(username)
VALUES('Thando'),('Johno'),('Vuyo');