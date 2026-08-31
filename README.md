# Expense Tracker

A personal finance tracking API that allows users to register, log in, manage income and expenses, organize transactions by categories, and view financial summaries.

## Features

- User authentication (Register & Login) with JWT
- Create and manage categories (Income / Expense)
- Add, view income records
- Add, view expense records
- Dashboard summary (Total Income, Total Expenses, Balance)
- Protected routes (only authenticated users can access data)
- Responsive basic frontend

## Tech Stack

**Backend**
- Python
- Flask
- Flask-SQLAlchemy
- Flask-JWT-Extended
- Flask-Migrate
- Marshmallow
- SQLite (development)

**Frontend**
- HTML
- CSS
- Vanilla JavaScript

## Project Structure

```text
expense-tracker/
├── app/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── __init__.py
│   └── config.py
├── frontend/
│   ├── css/
│   ├── js/
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── categories.html
│   ├── expenses.html
│   └── income.html
├── migrations/
├── run.py
├── requirements.txt
├── .env
└── README.md

### Getting Started
## Prerequisites

Python 3.x
pip
Virtual environment

git clone https://github.com/GANYO-1/expense-tracker.git
cd expense-tracker
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

## Environment Variables
Create a .env file in the root directory:
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
SQLALCHEMY_DATABASE_URI=sqlite:///expense_tracker.db

### Run the Application
python run.py

Backend will run on:
## Live API
Base URL: https://expense-tracker-1qo7.onrender.com

### API Endpoints
Authentication

POST /api/v1/auth/register
POST /api/v1/auth/login

Categories

GET /api/v1/categories
POST /api/v1/categories

Expenses

GET /api/v1/expenses
POST /api/v1/expenses

Income

GET /api/v1/income
POST /api/v1/income

Summary

GET /api/v1/summary

## Usage

Register a new account
Login to receive a JWT token
Create categories
Add income and expenses
View financial summary on the dashboard

### Deployed to render

## Future Improvements

Edit and delete functionality on the frontend
Category dropdown instead of manual category ID
Better UI/UX design
Expense filtering by date and category
User profile settings

## Author
GitHub: GANYO-1
