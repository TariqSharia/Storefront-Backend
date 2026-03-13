create table products (
  id serial primary key,
  name varchar(100) not null,
  price numeric(10, 2) not null,
  category varchar(100) 
);