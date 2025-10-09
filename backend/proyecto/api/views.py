from rest_framework import viewsets
from .models import UsuarioPersonalizado
from .serializers import UsuarioPersonalizadoSerializer

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
