# Proprietor

**Proprietor** is a full-stack AI-assisted real estate platform that allows users to explore properties and estimate house prices using machine learning. The system uses a **React** frontend, **Django REST** backend, **PostgreSQL** database, and a house price prediction model.

---

## 🚀 Project Overview

The goal of this project is to build a property platform where users can:

* **Browse** properties
* **Add** property listings
* **Estimate** property prices
* **Use AI** to assist with house valuation
* **Integrate** machine learning predictions into the web application

The system architecture combines modern web technologies with machine learning.

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* Axios
* React Router

### Backend

* Django
* Django REST Framework
* PostgreSQL
* psycopg2

### Machine Learning

* Python
* Scikit-Learn
* Pandas
* NumPy
* Joblib

### Dev Tools

* Git / GitHub
* Virtual Environment (venv)

---

## 📁 Project Structure

```text
Proprietor
│
├── backend                # Django backend API
│   ├── backend            # Django project configuration
│   ├── manage.py
│   └── requirements.txt
│
├── frontend               # React frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── ml                     # Machine learning components
│   ├── data               # datasets (ignored in git)
│   ├── models             # trained models
│   ├── training           # model training scripts
│   └── inference          # prediction logic
│
└── README.md

```

---

## 🏗 System Architecture

The flow of data within the application:
**User** → **React Frontend** → **Django REST API** → **PostgreSQL Database** → **Machine Learning Model**

The ML model will analyze property attributes and return predicted property prices.

---

## ✨ Features

* Property listing system
* Backend REST API
* PostgreSQL database integration
* Machine learning price prediction
* Modular ML pipeline
* Scalable full-stack architecture

### Future Features

* Voice-based property input
* Smart price estimation
* Property recommendation system
* Map-based search

---

## ⚙️ Installation & Setup

### Backend Setup

Navigate to the backend directory:

```bash
cd backend

```

Create and activate virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

```

Install dependencies:

```bash
pip install -r requirements.txt

```

Run migrations and start server:

```bash
python manage.py migrate
python manage.py runserver

```

> **Backend runs at:** `http://127.0.0.1:8000`

### Frontend Setup

Navigate to frontend directory:

```bash
cd frontend

```

Install dependencies and start development server:

```bash
npm install
npm run dev

```

> **Frontend runs at:** `http://localhost:5173`

---

## 🤖 Machine Learning Pipeline

The ML system will train a model using historical property data.

**Training workflow:**

1. Collect housing dataset
2. Preprocess data
3. Train regression model
4. Save trained model
5. Load model inside Django API
6. Return predicted property price

**Example model types:** Linear Regression, Random Forest, XGBoost.

---

## 📡 API Example

**Endpoint:** `POST /api/predict-price`

**Example Input:**

```json
{
  "area": 1200,
  "bedrooms": 3,
  "bathrooms": 2,
  "age": 5
}

```

**Example Response:**

```json
{
  "estimated_price": 8500000
}

```

---

## 🚫 Git Ignore

Sensitive or large files are excluded from Git:

* `venv/`
* `node_modules/`
* `.env`
* `ml/data/`
* `ml/models/`

---

## 📈 Future Improvements

* Geospatial price prediction
* AI property assistant
* NLP based user queries
* Property recommendation engine
* Real estate analytics dashboard

---

## 👤 Author

**Redwan Ahmed Utsab**
*Software Engineer | AI & Full-Stack Development*