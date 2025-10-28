"""
Django settings for dailystretch project.
"""

from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv

# ------------------------------
# Base Directory & Environment
# ------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

load_dotenv(os.path.join(BASE_DIR, ".env"))


# ------------------------------
# Security
# ------------------------------
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-*-&su5(umv95o$-1v0ae)q3*&&o&5fdcf&cdoy9u@b&mo!1l+u"
)
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split() or []

# ------------------------------
# Application definition
# ------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'dailystretch_app',  # your app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dailystretch.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dailystretch.wsgi.application'

# ------------------------------
# Database Configuration
# ------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'postgres',
        'USER': 'postgres.toutspsgjnhlfryvevqi',
        'PASSWORD': 'qUMJN?L&M.sq&X6',  # use the raw password, no encoding
        'HOST': 'aws-1-ap-southeast-1.pooler.supabase.com',
        'PORT': '6543',
    }
}


# ------------------------------
# Password validation
# ------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ------------------------------
# Internationalization
# ------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ------------------------------
# Static files
# ------------------------------
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / "static"]

# ------------------------------
# Default primary key field type
# ------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
