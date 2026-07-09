# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

- `POST /admin/login`
- `GET /admin/me`
- `POST /admin/logout`
- `POST /admin/change-password`

Bearer token authentication is required for protected admin routes.

Example header:

```http
Authorization: Bearer <token>
```

## Dashboard

- `GET /dashboard/stats`

## Site Content

- `GET /site-settings`
- `PUT /site-settings`
- `GET /contact-settings`
- `PUT /contact-settings`
- `GET /home`
- `PUT /home`
- `GET /about`
- `PUT /about`
- `GET /seo`
- `PUT /seo`

## Categories

- `GET /categories`
- `GET /categories?all=1`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

## Services

- `GET /services`
- `GET /services?all=1`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`

## Products

- `GET /products`
- `GET /products?all=1`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `DELETE /products/:id`

Supported product payload fields include:

- `name`
- `slug`
- `category` or `category_id`
- `rent_price`
- `buy_price`
- `rent_unit`
- `price_type`
- `image`
- `images`
- `description`
- `features`
- `specifications`
- `benefits`
- `related_products`
- `is_top_selling`
- `display_order`
- `is_active`

## Gallery

- `GET /gallery`
- `GET /gallery?all=1`
- `POST /gallery`
- `PUT /gallery/:id`
- `DELETE /gallery/:id`

## Testimonials

- `GET /testimonials`
- `GET /testimonials?all=1`
- `POST /testimonials`
- `PUT /testimonials/:id`
- `DELETE /testimonials/:id`

## Blogs

- `GET /blogs`
- `GET /blogs?all=1`
- `GET /blogs/:id`
- `POST /blogs`
- `PUT /blogs/:id`
- `DELETE /blogs/:id`

## Enquiries

- `POST /enquiries`
- `GET /enquiries`
- `PUT /enquiries/:id`
- `DELETE /enquiries/:id`

Supports pagination and search with:

- `page`
- `limit`
- `status`
- `search`

## Vendors

- `POST /vendors`
- `GET /vendors`
- `GET /vendors?status=pending`
- `PUT /vendors/:id`
- `DELETE /vendors/:id`

## Uploads

- `POST /uploads`
- `POST /uploads/multiple`

## Health

- `GET /health`

## Notes

- The backend is implemented in PHP and creates the `sahyadri_surgical` database automatically if it does not exist.
- Seed content is loaded from `backend/seed-data.json` when tables are empty.
