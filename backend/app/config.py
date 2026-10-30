import os
from datetime import timedelta

class Config:
    """Base application configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'vitawatch-spectra-dev-secret-key-9f8a2b4c6e')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'vitawatch-jwt-secret-key-1a3b5c7d9e')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get('JWT_EXPIRES_HOURS', 24)))
    
    # Database
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL', 
        f"sqlite:///{os.path.join(BASE_DIR, 'vitawatch_spectra.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    
    # Device Ingestion Security
    DEVICE_INGEST_KEY = os.environ.get('DEVICE_INGEST_KEY', 'esp32-spectra-gateway-key-2026')
    
    # Application Mode: 'demo' or 'live'
    APP_MODE = os.environ.get('APP_MODE', 'demo')

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key'
    JWT_SECRET_KEY = 'test-jwt-secret'
