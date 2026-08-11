from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models so SQLAlchemy can detect them
from .users import User
from .category import Category
from .expense import Expense
from .income import Income

__all__ = ['db', 'User', 'Category', 'Expense', 'Income']