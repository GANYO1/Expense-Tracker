from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError

from app.models import db
from app.models.category import Category

# Create Blueprint for category routes
category_bp = Blueprint('category', __name__)

# ====================== SCHEMAS ======================

class CategorySchema(Schema):
    """Schema for creating and returning categories"""
    id = fields.Int(dump_only=True)
    name = fields.String(required=True)
    type = fields.String(required=True)

class UpdateCategorySchema(Schema):
    """Schema for updating categories (all fields optional)"""
    name = fields.String(required=False)
    type = fields.String(required=False)

category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)
update_category_schema = UpdateCategorySchema()

# ====================== CREATE CATEGORY ======================

@category_bp.route('', methods=['POST'])
@jwt_required()
def create_category():
    """
    Create a new category for the logged-in user.
    """
    current_user_id = get_jwt_identity()

    try:
        data = category_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Validate type
    if data['type'] not in ['expense', 'income']:
        return jsonify({"error": "Type must be 'expense' or 'income'"}), 400

    try:
        new_category = Category(
            name=data['name'],
            type=data['type'],
            user_id=current_user_id
        )

        db.session.add(new_category)
        db.session.commit()

        return jsonify({
            "message": "Category created successfully",
            "category": category_schema.dump(new_category)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== GET ALL CATEGORIES ======================

@category_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    """
    Get all categories belonging to the logged-in user.
    """
    current_user_id = get_jwt_identity()

    categories = Category.query.filter_by(user_id=current_user_id).all()

    return jsonify(categories_schema.dump(categories)), 200

# ====================== GET SINGLE CATEGORY ======================

@category_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category(category_id):
    """
    Get a single category by ID (only if it belongs to the user).
    """
    current_user_id = get_jwt_identity()

    category = Category.query.filter_by(
        id=category_id,
        user_id=current_user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    return jsonify(category_schema.dump(category)), 200

# ====================== UPDATE CATEGORY ======================

@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
def update_category(category_id):
    """
    Update a category (only if it belongs to the logged-in user).
    """
    current_user_id = get_jwt_identity()

    category = Category.query.filter_by(
        id=category_id,
        user_id=current_user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    try:
        data = update_category_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    if 'name' in data:
        category.name = data['name']

    if 'type' in data:
        if data['type'] not in ['expense', 'income']:
            return jsonify({"error": "Type must be 'expense' or 'income'"}), 400
        category.type = data['type']

    try:
        db.session.commit()
        return jsonify({
            "message": "Category updated successfully",
            "category": category_schema.dump(category)
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ====================== DELETE CATEGORY ======================

@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    """
    Delete a category (only if it belongs to the logged-in user).
    """
    current_user_id = get_jwt_identity()

    category = Category.query.filter_by(
        id=category_id,
        user_id=current_user_id
    ).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500