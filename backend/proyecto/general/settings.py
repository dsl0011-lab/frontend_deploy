import os
from dotenv import load_dotenv
from pathlib import Path

# --- Rutas base ---
BASE_DIR = Path(__file__).resolve().parent.parent  # .../backend/proyecto

# 2) Cargar .env de forma robusta
try:
    from dotenv import load_dotenv, find_dotenv
    # intenta el .env en BASE_DIR primero
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        # búsqueda ascendente por si cambia el cwd
        load_dotenv(find_dotenv(filename=".env", usecwd=True))
except Exception as e:
    print("DOTENV WARNING:", e)

# 3) Debug temporal
#print("ENV DEBUG -> BASE_DIR:", BASE_DIR)
#print("ENV DEBUG -> .env exists:", (BASE_DIR / ".env").exists())
#print("ENV DEBUG -> DB_NAME:", os.getenv("DB_NAME"))


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-s3fhyx5h^4z(4k9wgwzw0g()-&bbeipm1pk87!&*-4#k!i-mc-' #pasar la key a un env 

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Configuración de Simple JWT
from datetime import timedelta

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "api",
    "cursos",
    "estudiante",
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'general.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'general.wsgi.application'
ASGI_APPLICATION = 'general.asgi.application'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "semana3_utf8"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "1601"),
        "HOST": os.getenv("POSTGRES_HOST", "127.0.0.1"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# --- Usuario personalizado ---
AUTH_USER_MODEL = "api.UsuarioPersonalizado"

# --- DRF / JWT ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "authentication.CookieJWTAuthentication",        
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_COOKIE": "jwt",          # nombre de la cookie
    "AUTH_COOKIE_HTTP_ONLY": True, # evita que JS lea el token
    "AUTH_COOKIE_SECURE": False,   # True si usas HTTPS
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_CREDENTIALS = True

# --- Otros ---
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
