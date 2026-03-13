create table order_products(
    id serial primary key,
    order_id integer references orders(id) on delete cascade,
    product_id integer references products(id) on delete cascade,
    quantity integer not null
);