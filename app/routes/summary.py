from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, extract

from app.models import db
from app.models.income import Income
from app.models.expense import Expense

# Create Blueprint
summary_bp = Blueprint('summary', __name__)

@summary_bp.route('', methods=['GET'])
@jwt_required()
def get_summary():
    """
    Get financial summary for the logged-in user.
    """
    current_user_id = get_jwt_identity()

    # Optional filters
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)

    try:
        # Base queries
        income_query = db.session.query(func.sum(Income.amount))\
            .filter(Income.user_id == current_user_id)

        expense_query = db.session.query(func.sum(Expense.amount))\
            .filter(Expense.user_id == current_user_id)

        # Apply year filter if provided
        if year:
            income_query = income_query.filter(extract('year', Income.date) == year)
            expense_query = expense_query.filter(extract('year', Expense.date) == year)

        # Apply month filter if provided
        if month:
            income_query = income_query.filter(extract('month', Income.date) == month)
            expense_query = expense_query.filter(extract('month', Expense.date) == month)

        total_income = income_query.scalar() or 0
        total_expenses = expense_query.scalar() or 0
        balance = total_income - total_expenses

        return jsonify({
            "total_income": float(total_income),
            "total_expenses": float(total_expenses),
            "balance": float(balance),
            "year": year,
            "month": month,
            "currency": "GHS"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500