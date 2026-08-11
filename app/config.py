import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class with common settings."""
    
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError('No SECRET_KEY set in environment variables')

    # Use JWT_SECRET_KEY if available, otherwise fallback to SECRET_KEY
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or SECRET_KEY

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Optional JWT settings
    JWT_ACCESS_TOKEN_EXPIRES = False   # You can set a timedelta later

class DevelopmentConfig(Config):
    """Settings used during local development."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///expense_tracker.db')

class ProductionConfig(Config):
    """Settings used in production."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')

class TestingConfig(Config):
    """Settings used when running tests."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URL', 'sqlite:///test.db')

# Dictionary used by the application factory
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}