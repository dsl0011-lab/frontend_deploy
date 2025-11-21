from django.contrib.auth import get_user_model
from django.db.models import Count
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import SAFE_METHODS, IsAuthenticated
from rest_framework.response import Response

from .models import (
    Curso,
    Matricula,
    Tarea,
    Entrega,
    Calificacion,
    Tutoria,
)
from .permisos import IsTeacherOrAdmin, IsOwnerTeacherOrAdmin
from .serializers import (
    CursoSerializer,
    MatriculaSerializer,
    TareaSerializer,
    EntregaSerializer,
    CalificacionSerializer,
    AlumnoResumenSerializer,
    TutoriaSerializer,
    AlumnoOptionSerializer,
)
from authentication import CookieJWTAuthentication

User = get_user_model()


class CursoViewSet(viewsets.ModelViewSet):
    """
    ViewSet unificado: cursos del profesor + acciones extra.
    """

    authentication_classes = [CookieJWTAuthentication]
    serializer_class = CursoSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Curso.objects.all().annotate(alumnos_count=Count("matriculas"))
        if getattr(user, "role", None) == "A" or getattr(user, "is_superuser", False):
            return qs
        return qs.filter(profesor=user)

    def perform_create(self, serializer):
        serializer.save(profesor=self.request.user)

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return [IsTeacherOrAdmin()]

    @action(
        methods=["post"],
        detail=True,
        permission_classes=[IsTeacherOrAdmin, IsOwnerTeacherOrAdmin],
    )
    def matricular(self, request, pk=None):
        """
        POST /api/profesor/cursos/<id>/matricular/
        Acepta username o id de alumno.
        """

        curso = self.get_object()
        username = request.data.get("username")
        alumno_id = (
            request.data.get("alumno")
            or request.data.get("alumno_id")
            or request.data.get("user_id")
        )

        if not username and not alumno_id:
            return Response(
                {"detail": "Falta 'username' o 'alumno' (id)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if username:
            alumno = get_object_or_404(User, username=username)
        else:
            alumno = get_object_or_404(User, pk=alumno_id)

        matricula, created = Matricula.objects.get_or_create(
            curso=curso, alumno=alumno
        )
        return Response(
            MatriculaSerializer(matricula).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="resumen-alumnos",
        permission_classes=[IsTeacherOrAdmin],
    )
    def resumen_alumnos(self, request):
        alumnos = User.objects.filter(role="S").values(
            "id",
            "username",
            "first_name",
            "last_name",
        )
        agrupado = {
            alumno["id"]: {
                "id": alumno["id"],
                "username": alumno["username"],
                "first_name": alumno["first_name"] or "",
                "last_name": alumno["last_name"] or "",
                "cursos": [],
            }
            for alumno in alumnos
        }

        matriculas = Matricula.objects.select_related("alumno", "curso")
        for matricula in matriculas:
            alumno = matricula.alumno
            if getattr(alumno, "role", None) != "S":
                continue
            if alumno.id not in agrupado:
                agrupado[alumno.id] = {
                    "id": alumno.id,
                    "username": alumno.username,
                    "first_name": alumno.first_name or "",
                    "last_name": alumno.last_name or "",
                    "cursos": [],
                }
            agrupado[alumno.id]["cursos"].append(
                {
                    "id": matricula.curso.id,
                    "nombre": getattr(matricula.curso, "nombre", str(matricula.curso)),
                }
            )

        data = list(agrupado.values())
        serializer = AlumnoResumenSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["get"],
        url_path="alumnos",
        permission_classes=[IsTeacherOrAdmin, IsOwnerTeacherOrAdmin],
    )
    def alumnos_inscritos(self, request, pk=None):
        curso = self.get_object()
        matriculas = Matricula.objects.select_related("alumno").filter(curso=curso)
        payload = [
            {
                "id": m.alumno.id,
                "username": m.alumno.username,
                "first_name": m.alumno.first_name or "",
                "last_name": m.alumno.last_name or "",
            }
            for m in matriculas
        ]
        serializer = AlumnoOptionSerializer(payload, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TareaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = TareaSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Tarea.objects.select_related("curso")
        if getattr(user, "role", None) == "A":
            return qs
        return qs.filter(curso__profesor=user)

    def get_permissions(self):
        if self.action in ["retrieve", "update", "partial_update", "destroy", "create"]:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return super().get_permissions()


class EntregaViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EntregaSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Entrega.objects.select_related("tarea", "alumno", "tarea__curso")
        if getattr(user, "role", None) == "A":
            return qs
        return qs.filter(tarea__curso__profesor=user)


class CalificacionViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = CalificacionSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Calificacion.objects.select_related(
            "entrega",
            "entrega__tarea",
            "entrega__tarea__curso",
        )
        if getattr(user, "role", None) == "A":
            return qs
        return qs.filter(entrega__tarea__curso__profesor=user)

    def get_permissions(self):
        if self.action in [
            "create",
            "update",
            "partial_update",
            "destroy",
            "retrieve",
            "list",
        ]:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return super().get_permissions()


class TutoriaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = TutoriaSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAuthenticated()]
        return [IsTeacherOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        qs = Tutoria.objects.select_related("profesor", "alumno")
        if getattr(user, "is_superuser", False) or getattr(user, "role", None) == "A":
            return qs
        if getattr(user, "role", None) == "T":
            return qs.filter(profesor=user)
        return qs.filter(alumno=user)

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == "A":
            serializer.save()
        else:
            serializer.save(profesor=user)
