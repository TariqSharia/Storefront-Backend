# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 

## API Endpoints
#### Products
- Index `/products` [GET]
- Show  `/products/:id` [GET]
- Create `/products` [POST] [token required]
- [OPTIONAL] Top 5 most popular products `products/popular` [GET]
- [OPTIONAL] Products by category (args: product category) `products/category/:category` [GET]

#### Users
- Index: `/users` [GET] [token required]
- Show: `/users/:id` [GET] [token required]
- Create: `/users` [POST]
- Authenticate: `/users/authenticate` [POST]

#### Orders
- Current Order by user: `/orders` [GET] [token required]
- Show Order: `/orders/:id` [GET] [token required]
- Create Order: `/orders` [POST] [token required]
- Add Product to Order: `/orders/:id/products` [POST] [token required]
- [OPTIONAL] Completed Orders by user: `/orders/completed/:user_id` [GET] [token required]


## Data Shapes
#### Product
-  id serial primary key
- name varchar(100) not null
- price numeric(10,2) not null
- [OPTIONAL] category varchar(100)

#### User
- id serial primary key
- username varchar(255) not null, unique
- firstName varchar(100) not null
- lastName varchar(100) not null
- password varchar(255) not null, hashed with brcrypt

#### Orders
- id serial primary key
- quantity integer not null
- user_id integer foreign key to users table (id)
- status of order varchar(20)

#### Order Products
- id erial primary key
- order_id integer foreign key to orders table (id)
- product_id integer references products table (id)
- quantity integer not null