# import classes needed
from flask_cors import CORS
from flask import Flask
from flask_jwt_extended import JWTManager
# from flask_migrate import Migrate

# import modules needed
from .config import config
from .models import db

# Extensions
jwt = JWTManager()
# migrate = Migrate()

def create_app(environment='development'):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[environment])

    CORS(app)
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    # migrate.init_app(app, db)

    with app.app_context():
        db.create_all()

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.expenses import expense_bp
    from .routes.income import income_bp
    from .routes.categories import category_bp
    from .routes.summary import summary_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(expense_bp, url_prefix='/api/v1/expenses')
    app.register_blueprint(income_bp, url_prefix='/api/v1/income')
    app.register_blueprint(category_bp, url_prefix='/api/v1/categories')
    app.register_blueprint(summary_bp, url_prefix='/api/v1/summary')

    return app