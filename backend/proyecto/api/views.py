# backend/proyecto/api/views.py

from rest_framework.response import Response
# from urllib import response
from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework import status
from django.conf import settings

from .models import UsuarioPersonalizado
from .serializers import (
    UsuarioPersonalizadoSerializer,
    RegistroSerializer,
)
from authentication import CookieJWTAuthentication #middleware personalizado para leer token desde cookie httponly


class IsAdminOrSelf(BasePermission):
    """
    Permite acceso total a ADMIN/superuser y acceso de objeto al propio usuario.
    Se usa junto con IsAuthenticated.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # superuser o role ADMIN ('A')
        if request.user.is_superuser or getattr(request.user, "role", None) == UsuarioPersonalizado.Role.ADMIN:
            return True
        return obj.id == request.user.id


class UsuarioPersonalizadoViewSet(viewsets.ModelViewSet):
    """
    CRUD de usuarios con seguridad:
    - ADMIN/superuser puede listar/crear/editar/eliminar a cualquiera.
    - No-ADMIN solo ve y edita su propio perfil.
    - Endpoints extra:
        * GET  /api/usuarios/me/
        * POST /api/usuarios/set-password/
        * PATCH /api/usuarios/{id}/set-role/  (solo superuser)
    """
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = UsuarioPersonalizadoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "role"]
    ordering = ["id"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, "role", None) == UsuarioPersonalizado.Role.ADMIN:
            return UsuarioPersonalizado.objects.all()
        return UsuarioPersonalizado.objects.filter(id=user.id)

    def perform_create(self, serializer):
        user = serializer.save()
        password = self.request.data.get("password")
        if password:
            user.set_password(password)
            user.save()

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_superuser or getattr(request.user, "role", None) == UsuarioPersonalizado.Role.ADMIN):
            return Response({"detail": "Solo ADMIN puede eliminar usuarios."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="set-password")
    def set_password(self, request):
        new_password = request.data.get("new_password")
        if not new_password or len(new_password) < 8:
            return Response({"detail": "Nueva contraseña inválida (mínimo 8 caracteres)."},
                            status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({"ok": True})

    # --- set-role: solo superusuario ---
    def get_permissions(self):
        if getattr(self, "action", None) == "set_role":
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=True, methods=["patch"], url_path="set-role")
    def set_role(self, request, pk=None):
        if not request.user.is_superuser:
            return Response({"detail": "Solo el superusuario puede cambiar el rol."},
                            status=status.HTTP_403_FORBIDDEN)

        usuario = self.get_object()
        new_role = request.data.get("role")
        valid_roles = [c[0] for c in UsuarioPersonalizado.Role.choices]  # ["A","T","S"]

        if new_role not in valid_roles:
            return Response({"detail": f"role inválido. Usa: {valid_roles}"},
                            status=status.HTTP_400_BAD_REQUEST)

        usuario.role = new_role
        usuario.save()
        return Response({"detail": "Rol actualizado", "role": usuario.role}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny]) 
@authentication_classes([]) #evita la autenticacion del app por defecto 
def register_user(request):
    serializer = RegistroSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        response_data = {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "id": user.id,
            "gender": user.gender,
            "role": user.role,
        }
        response = Response(response_data, status=status.HTTP_201_CREATED)
        response.set_cookie(
            key="jwt",
            value=access_token,
            httponly=True,
            secure=False,  # True en HTTPS
            samesite="Lax",
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            samesite="Lax",
            secure=False,
            domain=None
            )
        return response
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = getattr(user, "role", None)
        token["username"] = user.username
        token["id"] = user.id
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({
            "role": getattr(self.user, "role", None),
            "username": self.user.username,
            "gender": self.user.gender,
            "first_name": self.user.first_name,
            "last_name": self.user.last_name,
            "email": self.user.email
        })
        # si usas cookie HttpOnly, puedes ocultarlos en el body:
        data.pop("access", None)
        data.pop("refresh", None)
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"respuesta": "Credenciales inválidas"}, status=401)
        access_token = serializer.validated_data.get("access") or super().get_serializer().get_token(serializer.user).access_token
        refresh_token = super().get_serializer().get_token(serializer.user)
        response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        response.set_cookie(
            key="jwt",
            value=str(access_token),
            httponly=True,
            samesite="Lax",
            secure=False,
            domain=None
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            samesite="Lax",
            secure=False,
            domain=None
        )
        return response


@api_view(["POST"])
@permission_classes([AllowAny]) 
def logout(request):
    response = Response({"respuesta": "Sesión cerrada"})
    response.delete_cookie("jwt")
    response.delete_cookie("refresh_token")
    return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"respuesta": "No hay token de refresh token dentro de la cookie"}, status=status.HTTP_401_UNAUTHORIZED)
        # Insertamos el token en el cuerpo para que el serializador de SimpleJWT lo entienda
        request.data["refresh"] = refresh_token
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and "access" in response.data:
            # Guardar el nuevo access token en cookie HttpOnly
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE"],  # normalmente "jwt"
                value=response.data["access"],
                httponly=True,
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                samesite="Lax"
            )
            # opcional: eliminar del body los tokens
            del response.data["access"]
        return response


class CookieTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        access_token = request.COOKIES.get("jwt")
        if not access_token:
            return Response({"respuesta": "No hay token de acceso dentro de la cookie"}, status=status.HTTP_401_UNAUTHORIZED)
        request.data["token"] = access_token
        return super().post(request, *args, **kwargs)
