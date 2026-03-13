create table users (
    id serial primary key,
    username varchar(255) not null unique,
    firstname varchar(100) not null,
    lastname varchar(100) not null,
    password varchar(255) not null
);