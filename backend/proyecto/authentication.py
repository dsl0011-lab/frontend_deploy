from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('jwt')
        if not access_token:
            print("No se encontró token de acceso en las cookies")
            return None  # <- no bloquear, deja que el endpoint maneje
        try:
            validated_token = self.get_validated_token(access_token)
            return self.get_user(validated_token), validated_token
        except TokenError:
            print("No se encontró token de acceso en las cookies")
            # No devuelvas 401 aquí, simplemente no autentica
            return None
