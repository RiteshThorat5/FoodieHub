# FoodieHub - Online Food Ordering and Food Management System

FoodieHub is a modern, full-stack online food ordering and food management web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It supports multi-role operations for Customers, Restaurants, Riders, and Admins.

---

## Architecture and Multi-Role Workflow

FoodieHub implements a complete 4-role operational workflow:

```
                  FOODIEHUB
                      |
        +-------------+-------------+
        |             |             |
     CUSTOMER    RESTAURANT       RIDER
        |             |             |
      Order         Accept        Accept
        |             |             |
        +-----> Prepare Food <------+
                      |
                 Ready Pickup
                      |
                      v
                    Rider
                      |
                   Pickup
                      |
                Out for Delivery
                      |
                      v
                   Customer
                      |
                  Delivered
                      |
                  Completed
                      |
                      v
                    ADMIN
             (Manages Everything)
```

1. **Customer (Roshan)**: Browses menu, adds food to cart, checks out, and tracks real-time live order status.
2. **Restaurant (Samarth)**: Receives pending customer orders, accepts order, prepares food, and marks ready for pickup.
3. **Rider (Vishal)**: Views ready pickup orders, accepts delivery, confirms food pickup, and delivers to customer.
4. **Admin (Ritesh)**: Oversees business metrics, revenue, customers, food catalog, categories, and all order operations.

---

## Features

### Customer Features
- Authentication: Secure registration and login using JWT and bcrypt.
- Dynamic Food Menu: Browse foods categorized by Burger, Pizza, Biryani, Snacks, Drinks, Desserts.
- Search and Filtering: Case-insensitive instant search by name, description, or category.
- Food Details: View high-resolution images, prices, ratings, ingredients list, availability, and select quantities.
- Interactive Cart: Add to cart, adjust quantities (+ / -), live subtotal, and automatic delivery charge calculation.
- Checkout and Order Placement: Enter delivery address, contact phone (masked in public UI for privacy), and choose payment method.
- Order Confirmation and Tracking: Instant confirmation dialog with Order ID and tracking badge.
- My Orders: Real-time order history tracking through order status stages:
  Pending -> Confirmed -> Preparing -> Out for Delivery -> Delivered.
- Customer Profile: View and update profile details and default delivery address.

### Restaurant Dashboard
- View newly placed orders requiring kitchen preparation.
- Accept incoming orders and mark them as Preparing.
- Transition orders to Ready for Pickup when kitchen finishes.
- View customer delivery address and masked contact details.

### Rider Delivery Dashboard
- View orders that are Ready for Pickup across restaurants.
- Accept delivery assignments.
- Mark orders as Picked Up and Out for Delivery.
- Mark orders as Delivered upon customer handover.

### Admin Panel
- Role-Based Authorization: Protected routes accessible only to administrator accounts.
- Live Business Dashboard: Metric cards for Total Customers, Food Items, Categories, Orders, Pending Orders, Delivered Orders, and Delivered Revenue.
- Food Management: Add new food, edit details, set ratings and ingredients, delete items, and toggle real-time availability.
- Category Management: Create, view, and delete categories.
- Order Management: View all customer orders, delivery addresses, items, and update order status through each stage.
- Customer Management: View registered customers with masked phone numbers for privacy.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Axios, React Context API, CSS3 (Responsive Mobile-First) |
| Backend | Node.js, Express.js (RESTful API), Mongoose 9 |
| Database | MongoDB Atlas / Local MongoDB Server |
| Authentication | JSON Web Tokens (JWT), bcryptjs password hashing |
| Styling | Custom FoodieHub Orange and White design identity |

---

## Project Structure

```
FoodieHub/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── foodController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Food.js
│   │   ├── Category.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   ├── hero-chef.png
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── FoodDetailsModal.jsx
│   │   │   ├── CheckoutModal.jsx
│   │   │   ├── OrderSuccessModal.jsx
│   │   │   ├── MyOrdersModal.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── AdminModal.jsx
│   │   │   ├── RestaurantModal.jsx
│   │   │   └── RiderModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── maskPhone.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── .env.example
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update the values:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
LOCAL_MONGO_URI=mongodb://127.0.0.1:27017/foodiehub
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## How to Run Locally

### 1. Backend Setup
```bash
cd backend
npm install
node seed.js    # Seeds demo users, categories and foods
node server.js  # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev     # Starts Vite dev server on http://localhost:5173
```

---

## Role Accounts

Default accounts created by `seed.js`:

| Role | Display Name | Email | Password Reference |
|---|---|---|---|
| Admin | Ritesh | `admin@foodiehub.com` | Defined in seed configuration |
| Restaurant | Samarth | `restaurant@foodiehub.com` | Defined in seed configuration |
| Rider | Vishal | `rider@foodiehub.com` | Defined in seed configuration |
| Customer | Roshan | `customer@test.com` | Defined in seed configuration |

---

## REST API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Register customer
- `POST /login` - Login customer/restaurant/rider/admin & receive JWT token
- `GET /me` - Get authenticated user details [Protected]

### Foods (`/api/foods`)
- `GET /` - Get all food items (supports `?category=...&search=...`)
- `GET /:id` - Get food details by ID
- `POST /` - Add food item [Admin Only]
- `PUT /:id` - Update food item [Admin Only]
- `DELETE /:id` - Delete food item [Admin Only]
- `PUT /:id/availability` - Toggle food availability [Admin Only]

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `GET /:id` - Get single category
- `POST /` - Create category [Admin Only]
- `PUT /:id` - Update category [Admin Only]
- `DELETE /:id` - Delete category [Admin Only]

### Orders (`/api/orders`)
- `POST /` - Place new order [Customer]
- `GET /my` - Get logged-in customer order history [Customer]
- `GET /restaurant` - Get incoming orders for kitchen [Restaurant]
- `GET /rider` - Get orders ready for delivery [Rider]
- `GET /:id` - Get single order details [Protected]
- `GET /` - Get all orders [Admin]
- `PUT /:id/status` - Update order flow status [Authorized Roles]
- `GET /stats/dashboard` - Get dashboard statistics & revenue [Admin]

### Users (`/api/users`)
- `GET /` - List all customers [Admin]
- `GET /:id` - Get user profile [Protected]
- `PUT /:id` - Update profile details [Protected]
- `DELETE /:id` - Delete user [Admin]

---

## License
(c) 2026 FoodieHub. All rights reserved.
