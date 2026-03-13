create table orders(
    id serial primary key,
    status varchar(20) not null,
    user_id integer references users(id) not null
);