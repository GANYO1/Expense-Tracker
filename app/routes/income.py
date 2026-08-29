from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, validate, ValidationError
# from datetime import datetime

from app.models import db
from app.models.income import Income

# Create Blueprint
income_bp = Blueprint('income', __name__)

# ====================== SCHEMAS ======================

class IncomeSchema(Schema):
    """Schema for creating income"""
    amount = fields.Decimal(
        required=True,
        places=2,
        validate=validate.Range(min=0, min_inclusive=False)
    )
    source = fields.String(required=True)
    description = fields.String(
        required=False, 
        validate=validate.Length(min=1)
    )
    category_id = fields.Int(required=False)
    date = fields.Date(required=True)

class UpdateIncomeSchema(Schema):
    """Schema for updating income (all fields optional)"""
    amount = fields.Decimal(required=False)
    source = fields.String(required=False)
    description = fields.String(required=False)
    category_id = fields.Int(required=False)
    date = fields.Date(required=False)

income_schema = IncomeSchema()
update_income_schema = UpdateIncomeSchema()

# ====================== CREATE INCOME ======================

@income_bp.route('', methods=['POST'])
@jwt_required()
def create_income():
    """
    Create a new income record for the logged-in user.
    """
    current_user_id = get_jwt_identity()

    try:
        data = income_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    try:
        new_income = Income(
            amount=data['amount'],
            source=data['source'],
            description=data.get('description'),
            category_id=data.get('category_id'),
            date=data['date'],
            user_id=current_user_id
        )

        db.session.add(new_income)
        db.session.commit()

        return jsonify({
            "message": "Income created successfully",
            "income": new_income.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== GET ALL INCOMES ======================

@income_bp.route('', methods=['GET'])
@jwt_required()
def get_incomes():
    """
    Get all income records belonging to the logged-in user.
    """
    current_user_id = get_jwt_identity()

    incomes = Income.query.filter_by(user_id=current_user_id).all()

    return jsonify({
        "incomes": [income.to_dict() for income in incomes],
        "count": len(incomes)
    }), 200

# ====================== GET SINGLE INCOME ======================

@income_bp.route('/<int:income_id>', methods=['GET'])
@jwt_required()
def get_income(income_id):
    """
    Get a single income by ID (only if it belongs to the user).
    """
    current_user_id = get_jwt_identity()

    income = Income.query.filter_by(
        id=income_id,
        user_id=current_user_id
    ).first()

    if not income:
        return jsonify({"error": "Income not found"}), 404

    return jsonify(income.to_dict()), 200

# ====================== UPDATE INCOME ======================

@income_bp.route('/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_income(income_id):
    """
    Update an existing income record.
    """
    current_user_id = get_jwt_identity()

    income = Income.query.filter_by(
        id=income_id,
        user_id=current_user_id
    ).first()

    if not income:
        return jsonify({"error": "Income not found"}), 404

    try:
        data = update_income_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    if 'amount' in data:
        income.amount = data['amount']
    if 'source' in data:
        income.source = data['source']
    if 'description' in data:
        income.description = data['description']
    if 'category_id' in data:
        income.category_id = data['category_id']
    if 'date' in data:
        income.date = data['date']

    try:
        db.session.commit()
        return jsonify({
            "message": "Income updated successfully",
            "income": income.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== DELETE INCOME ======================

@income_bp.route('/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_income(income_id):
    """
    Delete an income record (only if it belongs to the user).
    """
    current_user_id = get_jwt_identity()

    income = Income.query.filter_by(
        id=income_id,
        user_id=current_user_id
    ).first()

    if not income:
        return jsonify({"error": "Income not found"}), 404

    try:
        db.session.delete(income)
        db.session.commit()
        return jsonify({"message": "Income deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500