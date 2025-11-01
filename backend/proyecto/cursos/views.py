from django.db.models import Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Curso, Matricula, Tarea, Entrega, Calificacion
from .serializers import (
    CursoSerializer, MatriculaSerializer, TareaSerializer,
    EntregaSerializer, CalificacionSerializer
)
from .permisos import IsTeacherOrAdmin, IsOwnerTeacherOrAdmin
from authentication import CookieJWTAuthentication #middleware personalizado para leer token desde cookie httponly

class CursoViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = CursoSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        qs = Curso.objects.all().annotate(alumnos_count=Count('matriculas'))
        user = self.request.user
        if user.role == 'A':
            return qs
        return qs.filter(profesor=user)  # Profesor ve solo sus cursos

    def perform_create(self, serializer):
        serializer.save(profesor=self.request.user)

    def get_permissions(self):
        if self.action in ['retrieve','update','partial_update','destroy']:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return super().get_permissions()

    @action(methods=['post'], detail=True, permission_classes=[ IsTeacherOrAdmin, IsOwnerTeacherOrAdmin])
    def matricular(self, request, pk=None):
        curso = self.get_object()
        alumno_id = request.data.get('alumno')
        if not alumno_id:
            return Response({'detail':'alumno requerido'}, status=400)
        m, created = Matricula.objects.get_or_create(curso=curso, alumno_id=alumno_id)
        return Response(MatriculaSerializer(m).data, status=201 if created else 200)

class TareaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]  
    serializer_class = TareaSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Tarea.objects.select_related('curso')
        if user.role == 'A':
            return qs
        return qs.filter(curso__profesor=user)

    def get_permissions(self):
        if self.action in ['retrieve','update','partial_update','destroy','create']:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return super().get_permissions()

class EntregaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    El profesor puede listar/leer entregas de sus cursos.
    (Crear entrega lo hará el estudiante en otro endpoint/app)
    """
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EntregaSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Entrega.objects.select_related('tarea','alumno','tarea__curso')
        if user.role == 'A':
            return qs
        return qs.filter(tarea__curso__profesor=user)

class CalificacionViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = CalificacionSerializer
    permission_classes = [IsTeacherOrAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = Calificacion.objects.select_related('entrega','entrega__tarea','entrega__tarea__curso')
        if user.role == 'A':
            return qs
        return qs.filter(entrega__tarea__curso__profesor=user)

    def get_permissions(self):
        if self.action in ['create','update','partial_update','destroy','retrieve','list']:
            return [IsTeacherOrAdmin(), IsOwnerTeacherOrAdmin()]
        return super().get_permissions()
