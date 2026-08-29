from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, validate, ValidationError
# from datetime import datetime

from app.models import db
from app.models.expense import Expense

# Create Blueprint
expense_bp = Blueprint('expense', __name__)

# ====================== SCHEMAS ======================

class ExpenseSchema(Schema):
    """Schema for creating an expense"""
    amount = fields.Decimal(
        required=True,
        places=2,
        validate=validate.Range(min=0, min_inclusive=False) # must be > 0
    )
    description = fields.String(required=True, validate=validate.Length(min=1))
    category_id = fields.Int(required=True)
    date = fields.Date(required=True)

class UpdateExpenseSchema(Schema):
    """Schema for updating an expense (all fields optional)"""
    amount = fields.Decimal(required=False)
    description = fields.String(required=False)
    category_id = fields.Int(required=False)
    date = fields.Date(required=False)


expense_schema = ExpenseSchema()
expenses_schema = ExpenseSchema(many=True)
update_expense_schema = UpdateExpenseSchema()

# ====================== CREATE EXPENSE ======================

@expense_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    """
    Create a new expense for the logged-in user.
    """
    current_user_id = get_jwt_identity()

    try:
        data = expense_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    try:
        new_expense = Expense(
            amount=data['amount'],
            description=data['description'],
            category_id=data['category_id'],
            date=data['date'],
            user_id=current_user_id
        )

        db.session.add(new_expense)
        db.session.commit()

        return jsonify({
            "message": "Expense created successfully",
            "expense": new_expense.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== GET ALL EXPENSES ======================

@expense_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    """
    Get all expenses belonging to the logged-in user.
    """
    current_user_id = get_jwt_identity()

    expenses = Expense.query.filter_by(user_id=current_user_id).all()

    return jsonify({
        "expenses": [expense.to_dict() for expense in expenses],
        "count": len(expenses)
    }), 200

# ====================== GET SINGLE EXPENSE ======================

@expense_bp.route('/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(expense_id):
    """
    Get a single expense by ID (only if it belongs to the user).
    """
    current_user_id = get_jwt_identity()

    expense = Expense.query.filter_by(
        id=expense_id,
        user_id=current_user_id
    ).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    return jsonify(expense.to_dict()), 200

# ====================== UPDATE EXPENSE ======================

@expense_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    """
    Update an existing expense (only if it belongs to the user).
    """
    current_user_id = get_jwt_identity()

    expense = Expense.query.filter_by(
        id=expense_id,
        user_id=current_user_id
    ).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    try:
        data = update_expense_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    if 'amount' in data:
        expense.amount = data['amount']
    if 'description' in data:
        expense.description = data['description']
    if 'category_id' in data:
        expense.category_id = data['category_id']
    if 'date' in data:
        expense.date = data['date']

    try:
        db.session.commit()
        return jsonify({
            "message": "Expense updated successfully",
            "expense": expense.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== DELETE EXPENSE ======================

@expense_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    """
    Delete an expense (only if it belongs to the logged-in user).
    """
    current_user_id = get_jwt_identity()

    expense = Expense.query.filter_by(
        id=expense_id,
        user_id=current_user_id
    ).first()

    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    try:
        db.session.delete(expense)
        db.session.commit()
        return jsonify({"message": "Expense deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



