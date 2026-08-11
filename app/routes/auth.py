from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from marshmallow import Schema, fields, ValidationError

from app.models import db
from app.models.users import User

# Create a Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)

# ====================== VALIDATION SCHEMAS ======================

class RegisterSchema(Schema):
    """Schema to validate registration data"""
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=lambda x: len(x) >= 8)

class LoginSchema(Schema):
    """Schema to validate login data"""
    email = fields.Email(required=True)
    password = fields.String(required=True)

# Create schema instances
register_schema = RegisterSchema()
login_schema = LoginSchema()

# ====================== REGISTER ROUTE ======================

@auth_bp.route('/register', methods=['POST'])
def register():
    # Validate incoming JSON data
    try:
        data = register_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Check if the email is already registered
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 409

    try:
        # Create new user instance
        user = User(email=data['email'])
        
        # Hash and set the password securely
        user.set_password(data['password'])

        # Save user to the database
        db.session.add(user)
        db.session.commit()

        # Generate JWT access token
        access_token = create_access_token(identity=str(user.id))

        # Return success response with token
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email
            }
        }), 201

    except Exception as e:
        # Rollback in case of any database error
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ====================== LOGIN ROUTE ======================

@auth_bp.route('/login', methods=['POST'])
def login():
    # Validate incoming JSON data
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # Verify user exists and password is correct
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT access token
    access_token = create_access_token(identity=str(user.id))

    # Return success response with token
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email
        }
    }), 200