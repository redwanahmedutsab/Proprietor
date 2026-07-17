# Proprietor 🏘️

> A full-stack real estate platform for Bangladesh — built with Django REST Framework, React, and PostgreSQL.

Inspired by Airbnb and Zillow, Proprietor lets users browse, list, book, and pay for properties across Bangladesh. It features JWT authentication, SSLCommerz payment integration, a 3D virtual tour embed system, and a full admin approval workflow.

---

## 🖥️ Live Demo

| Service     | URL      |
|-------------|----------|
| Frontend    | Vercel   |
| Backend API | Render   |
| Database    | Neon     |
| Admin Panel | `/admin` |

---

## ✨ Features

### 👀 Without Login
- Browse and search properties
- Filter by city, price, category, bedrooms
- View property details with image gallery
- Embed 3D / virtual tours (YouTube & Matterport)
- See property location on Google Maps

### 🔐 With Login
- Register / login with JWT authentication
- Post property listings with multiple image uploads
- Book properties for rent or purchase
- Pay online via SSLCommerz (bKash, Nagad, Rocket, cards)
- Meet & Pay offline option
- Save properties to wishlist ❤️
- Leave star ratings and reviews
- Manage listings from personal dashboard

### 👑 Admin
- Approve or reject property listings
- Manage users, bookings, and payments
- Bulk actions from Django Admin panel

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) with refresh token rotation |
| Database | PostgreSQL |
| Payments | SSLCommerz (Bangladesh gateway) |
| AI Pricing | FastAPI, LightGBM, pandas (separate `ml_service` container) |
| Storage | Django media files (local / cloud) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 📁 Project Structure

```
Proprietor/
├── backend/
│   ├── config/          # Django settings, urls, wsgi
│   ├── users/           # Custom user model, JWT auth
│   ├── properties/      # Property listings, images, wishlist
│   ├── bookings/        # Rent & buy booking system
│   ├── payments/        # SSLCommerz payment integration
│   ├── reviews/         # Star ratings & reviews
│   ├── utils/           # Email notification helpers
│   ├── manage.py
│   └── requirements.txt
│
├── ml_service/          # AI price-suggestion microservice (FastAPI)
│   ├── data/             # Source CSVs (Sale+Rent listings, Dhaka rentals)
│   ├── train/             # Data cleaning + LightGBM training scripts
│   ├── app/               # FastAPI app: /predict/sale, /predict/rent
│   ├── models/             # Trained artifacts (generated on first boot)
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/         # Axios API calls (auth, property, booking)
│       ├── components/  # Navbar, Footer, PropertyCard, MapView, etc.
│       ├── context/     # AuthContext (global auth state)
│       ├── hooks/       # useAuth, useProperties
│       ├── pages/       # Home, Properties, Detail, Dashboard, etc.
│       └── styles/      # Global CSS, booking styles, polish
│
├── vercel.json
└── README.md
```

---

## 🗄️ Database Models

```
CustomUser
 ├── Properties (1:N)
 ├── Bookings (1:N)
 ├── Reviews (1:N)
 └── Wishlist (1:N)

Property
 ├── PropertyImage (1:N)
 ├── Bookings (1:N)
 ├── Reviews (1:N)
 └── Wishlist (1:N)

Booking
 └── Payment (1:1)
```

---

## 🔌 API Endpoints

### Auth — `/api/auth/`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `register/` | Open | Create new account |
| POST | `login/` | Open | Get JWT tokens |
| POST | `token/refresh/` | Open | Refresh access token |
| GET | `profile/` | Auth | Get own profile |
| PATCH | `profile/` | Auth | Update profile |
| POST | `change-password/` | Auth | Change password |
| POST | `logout/` | Auth | Blacklist refresh token |

### Properties — `/api/properties/`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Open | List with filters |
| POST | `/` | Auth | Create listing |
| GET | `/<id>/` | Open | Property detail |
| PATCH | `/<id>/` | Owner | Update listing |
| DELETE | `/<id>/` | Owner | Delete listing |
| GET | `/mine/` | Auth | My listings |
| GET | `/featured/` | Open | Featured properties |
| POST | `/<id>/images/` | Owner | Upload images |
| POST | `/<id>/approve/` | Admin | Approve listing |
| POST | `/<id>/wishlist/` | Auth | Toggle wishlist |

### Bookings — `/api/bookings/`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Auth | Create booking |
| GET | `/mine/` | Auth | My bookings |
| GET | `/<id>/` | Auth | Booking detail |
| POST | `/<id>/cancel/` | Auth | Cancel booking |

### Payments — `/api/payments/`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/initiate/<bookingId>/` | Auth | Start SSLCommerz session |
| POST | `/success/` | IPN | Payment confirmed callback |
| POST | `/fail/` | IPN | Payment failed callback |
| GET | `/status/<bookingId>/` | Auth | Poll payment status |

### Reviews — `/api/properties/<id>/reviews/`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Open | List reviews |
| POST | `/` | Auth | Add review |
| DELETE | `/api/reviews/<id>/` | Owner | Delete review |

---

## 🤖 AI Price Suggestion

A standalone `ml_service` container gives both sellers/landlords and
buyers/tenants a data-driven price estimate, trained on real Bangladesh
property listings.

### How it works

1. Two datasets are bundled into the `ml_service` image under `data/`:
   - `PropertyAIrealestateBangladeshdataset.csv` — ~34k listings (Sale
     **and** Rent) across Bangladesh with location, size, building type,
     and amenity data.
   - `houserentdhaka.csv` — ~29k Dhaka-only rental listings, merged in to
     strengthen the rent model.
2. On first container boot, `docker-entrypoint.sh` checks whether trained
   model files already exist in the `ml_models` volume. If not, it runs
   `train/train_all.py`, which:
   - Cleans both datasets (parses `"1.6 Lakh"`-style price strings,
     drops nonsense outliers, aligns column names).
   - Splits `PropertyAIrealestateBangladeshdataset.csv` by `purpose`
     (`Sale` vs `Rent`) and merges the Rent half with the cleaned
     `houserentdhaka.csv`.
   - Trains **two separate LightGBM regressors** — one for **Sale**
     price, one for **Rent** price — on a log-transformed price target,
     using area, bedrooms, bathrooms, building type, division, city, and
     locality (plus amenity count for Sale) as features.
   - Saves `sale_model.joblib`, `rent_model.joblib`, and a `metadata.json`
     (valid dropdown values + accuracy metrics) into the volume.
3. A FastAPI app (`app/main.py`) then serves the trained models:

   | Method | Endpoint        | Description                                   |
   |--------|-----------------|------------------------------------------------|
   | GET    | `/health`       | Liveness + whether models are loaded            |
   | GET    | `/metadata`     | Valid divisions/cities/localities/types + ranges, and each model's accuracy |
   | POST   | `/predict/sale` | Suggested selling price + range                |
   | POST   | `/predict/rent` | Suggested monthly rent + range                 |

4. In the frontend, **Price AI** (`/price-estimator`) first asks the user
   whether they want a **Selling** or **Rental** price — this determines
   which model gets called — then collects area, bed/bath count,
   property type, and location, and shows a suggested price with a
   realistic low–high range. The same tool works for both a seller
   pricing a new listing and a buyer/tenant sanity-checking one.

### Current model accuracy (holdout set)

| Model | R² (log-price) | Typical error (MAPE) |
|-------|-----------------|------------------------|
| Sale  | ~0.86           | ~15%                   |
| Rent  | ~0.89           | ~16%                   |

Exact figures are written to `ml_service/models/metadata.json` on every
training run and returned live from `/metadata`. Location is captured at
the *locality* (neighbourhood) level, not exact coordinates, which is the
main source of remaining error — treat the suggested range as a
negotiating starting point, not an appraisal.

### Retraining

```bash
# force a retrain even if artifacts already exist
docker compose run -e FORCE_RETRAIN=true ml_service

# or, without Docker
cd ml_service
pip install -r requirements.txt
python -m train.train_all --force
```

---

One command spins up Postgres, the Django API, the AI price-suggestion
service, and the React frontend:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django admin: http://localhost:8000/admin — a superuser is auto-created
  on first boot (default `admin@proprietor.local` / `admin12345`, from
  the root `.env` — change these before sharing the project)
- Price Suggestion API: http://localhost:8001 (docs at `/docs`)

The backend container waits for Postgres, runs migrations, and collects
static files automatically before serving. Local dev defaults live in
the root `.env` file — override `SECRET_KEY`, `DB_PASSWORD`, and the
superuser credentials for anything beyond local use.

**First boot trains the ML models from scratch** (a few minutes, CPU-only)
since `ml_service` has no pre-trained artifacts baked in — see
[AI Price Suggestion](#-ai-price-suggestion) below for details. Subsequent
`docker compose up` runs reuse the trained models from the `ml_models`
volume and start instantly.

To stop: `docker compose down` (add `-v` to also wipe the database *and
trained-model* volumes).

---

## 🚀 Getting Started (manual, without Docker)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Git

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/Proprietor.git
cd Proprietor
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DB credentials and secret key

# Create migrations and migrate
python manage.py makemigrations users
python manage.py makemigrations properties
python manage.py makemigrations bookings
python manage.py makemigrations payments
python manage.py makemigrations reviews
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run the server
python manage.py runserver
```

Backend running at: `http://localhost:8000`

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env — set REACT_APP_API_URL=http://localhost:8000/api

# Start dev server
npm start
```

Frontend running at: `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend — `backend/.env`
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=realestate_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASS=qwerty
SSLCOMMERZ_SANDBOX=True

EMAIL_HOST_USER=your.email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend — `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ML_API_URL=http://localhost:8001
```

### ML Service — set via `docker-compose.yml` / root `.env`
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000
FORCE_RETRAIN=false   # set true to retrain on next boot even if models exist
```

---

## 💳 SSLCommerz Payment Flow

```
User clicks "Book" → fills BookingPage form
  → POST /api/bookings/ (booking created, status: pending)
  → POST /api/payments/initiate/:id/ (calls SSLCommerz API)
  → Redirect to SSLCommerz gateway (bKash / Nagad / Card)
  → SSLCommerz POSTs to /api/payments/success/ (IPN)
  → Django verifies transaction server-side
  → Booking status → confirmed ✅
  → Frontend polls /api/payments/status/ → shows result
```

Get sandbox credentials at [developer.sslcommerz.com](https://developer.sslcommerz.com)

---

## 🌍 Deployment

### Backend → Render.com
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — `render.yaml` is already configured
4. Add secret env vars in the Render dashboard
5. Deploy

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set root directory to `frontend/`
4. Add env var: `REACT_APP_API_URL=https://your-app.onrender.com/api`
5. Deploy

After both are deployed, update `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` in your Render env vars to your Vercel URL.

---

## 🗺️ Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home — hero, search, featured | Public |
| `/properties` | Property listings with filters | Public |
| `/properties/:id` | Property detail, gallery, 3D tour | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | User dashboard, listings, wishlist | Auth |
| `/post-property` | Create new listing | Auth |
| `/price-estimator` | 🤖 AI price suggestion (sale & rent) | Public |
| `/book/:propertyId` | Booking form + payment | Auth |
| `/payment/success` | Payment confirmed | Public |
| `/payment/fail` | Payment failed | Public |

---

## 🤝 Contributing

Pull requests are welcome. For major changes please open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Redwan Ahmed Utsab**
- GitHub: [@redwanahmedutsab](https://github.com/redwanahmedutsab)

---