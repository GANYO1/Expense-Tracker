from flask import Flask
from .config import config
from .models import db

def create_app(environment='development'):
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[environment])
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.expenses import expenses_bp
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(expenses_bp, url_prefix='/api/v1/expenses')
    
    return app