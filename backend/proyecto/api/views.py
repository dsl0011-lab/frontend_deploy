from rest_framework import viewsets
from .models import UsuarioPersonalizado
from .serializers import (
    UsuarioPersonalizadoSerializer,
    RegistroSerializer,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class IsAdminOrSelf(BasePermission):
    """
    Permite acceso total a ADMIN/superuser y acceso de objeto al propio usuario.
    Se usa junto con IsAuthenticated.
    """
    def has_permission(self, request, view):
        # Permiso general: debe estar autenticado para el ViewSet
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # ADMIN o superuser -> acceso total
        if request.user.is_superuser or getattr(request.user, "role", None) == "ADMIN":
            return True
        # De lo contrario, solo al propio registro
        return obj.id == request.user.id


class UsuarioPersonalizadoViewSet(viewsets.ModelViewSet):
    """
    ViewSet que gestiona las operaciones CRUD del modelo UsuarioPersonalizado.
    Esto incluye:
    - GET /api/usuarios/        → listar usuarios
    - POST /api/usuarios/       → crear un nuevo usuario
    - GET /api/usuarios/{id}/   → ver un usuario específico
    - PUT /api/usuarios/{id}/   → actualizar usuario
    - DELETE /api/usuarios/{id}/→ eliminar usuario
    """

    queryset = UsuarioPersonalizado.objects.all()
    serializer_class = UsuarioPersonalizadoSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]

    # Búsqueda y ordenación útiles
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["username", "email", "first_name", "last_name", "role"]
    ordering = ["id"]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, "role", None) == "ADMIN":
            return UsuarioPersonalizado.objects.all()
        # No-ADMIN solo su propio registro
        return UsuarioPersonalizado.objects.filter(id=user.id)

    def perform_create(self, serializer):
        """
        Crea usuario respetando set_password si viene 'password' en el body.
        Ojo: los checks de role/is_active los gestiona el serializer (solo ADMIN).
        """
        user = serializer.save()
        password = self.request.data.get("password")
        if password:
            user.set_password(password)
            user.save()

    def destroy(self, request, *args, **kwargs):
        """
        Restringe la eliminación a ADMIN/superuser.
        """
        if not (request.user.is_superuser or getattr(request.user, "role", None) == "ADMIN"):
            return Response({"detail": "Solo ADMIN puede eliminar usuarios."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Devuelve el perfil del usuario autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"], url_path="set-password")
    def set_password(self, request):
        """
        Cambia la contraseña del usuario autenticado.
        Body: { "new_password": "..." } (mín. 8)
        """
        new_password = request.data.get("new_password")
        if not new_password or len(new_password) < 8:
            return Response({"detail": "Nueva contraseña inválida (mínimo 8 caracteres)."},
                            status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({"ok": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegistroSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"ok": True, "email": user.email}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Campo extra en el payload
        token["role"] = getattr(user, "role", None)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = getattr(self.user, "role", None)
        data["username"] = self.user.username
        return data
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
