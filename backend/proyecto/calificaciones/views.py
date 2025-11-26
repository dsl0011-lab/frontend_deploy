from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from .models import NotaAcademica, Asistencia, EventoExamen
from .serializers import (
    NotaAcademicaSerializer,
    AsistenciaSerializer,
    EventoExamenSerializer,
)
from cursos.models import Curso, Calificacion as CalificacionTarea
from authentication import CookieJWTAuthentication

class CalificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotaAcademicaSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user

        queryset = NotaAcademica.objects.select_related("estudiante", "curso", "profesor")

        role = getattr(user, "role", None)
        # Estudiante: solo sus notas visibles
        if role == "S":
            queryset = queryset.filter(estudiante=user, visible_estudiante=True)
        # Profesor / Admin: solo notas que ha puesto él
        elif role in ("T", "A"):
            queryset = queryset.filter(profesor=user)

        curso_id = self.request.query_params.get("curso", None)
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)
            
        return queryset
    
    def perform_create(self, serializer):
        """
        El profesor logeado crea la nota académica.
        Solo se permite si es profesor/admin y el curso pertenece a él
        (salvo admin, que puede todo).
        """
        user = self.request.user
        role = getattr(user, "role", None)

        if role not in ("T", "A") and not getattr(user, "is_superuser", False):
            return Response(
                {"detail": "Solo profesores o administradores pueden crear calificaciones."},
                status=status.HTTP_403_FORBIDDEN,
            )

        curso = serializer.validated_data.get("curso")
        if curso and role == "T" and curso.profesor_id != user.id:
            return Response(
                {"detail": "Solo puedes calificar exámenes de tus propios cursos."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer.save(profesor=user)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        user = request.user
        
        notas = NotaAcademica.objects.filter(estudiante=user, visible_estudiante=True)
        cursos_stats = []
        
        for curso_id in notas.values_list("curso", flat=True).distinct():
            notas_curso = notas.filter(curso=curso_id)

            # media de exámenes (NotaAcademica)
            notas_examen = notas_curso.filter(tipo_evaluacion="EXAMEN")
            media_examen = notas_examen.aggregate(Avg("nota"))["nota__avg"] or 0

            # media de tareas (Calificacion sobre Entregas del curso)
            califs_tareas = CalificacionTarea.objects.filter(
                entrega__alumno=user, entrega__tarea__curso_id=curso_id
            )
            media_tareas = califs_tareas.aggregate(Avg("nota"))["nota__avg"] or 0

            # 90% exámenes + 10% tareas
            media = 0.9 * float(media_examen) + 0.1 * float(media_tareas)

            asists = Asistencia.objects.filter(estudiante=user, curso=curso_id)
            total_asist = asists.count()
            presentes = asists.filter(presente=True).count()
            porcentaje_asist = (presentes / total_asist * 100) if total_asist > 0 else 100
            
            cursos_stats.append({
                "curso_id": curso_id,
                "curso_nombre": notas_curso.first().curso.nombre,
                "media_calificaciones": round(media, 2),
                "total_calificaciones": notas_curso.count(),
                "porcentaje_asistencia": round(porcentaje_asist, 2),
            })
        
        return Response(cursos_stats)

class AsistenciaViewSet(viewsets.ModelViewSet):
    serializer_class = AsistenciaSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Asistencia.objects.select_related("estudiante", "curso", "profesor")

        role = getattr(user, "role", None)
        # Si es alumno, solo ve su propia asistencia
        if role == "S":
            queryset = queryset.filter(estudiante=user)
        elif role == "T":
            # Profesor: solo asistencia de sus cursos
            queryset = queryset.filter(curso__profesor=user)

        # Filtros opcionales por query params (para profesores/admin)
        estudiante_id = self.request.query_params.get("estudiante")
        if estudiante_id:
            queryset = queryset.filter(estudiante_id=estudiante_id)

        curso_id = self.request.query_params.get("curso")
        if curso_id:
            queryset = queryset.filter(curso_id=curso_id)

        return queryset
    
    def perform_create(self, serializer):
        serializer.save(profesor=self.request.user)


class EventoExamenViewSet(viewsets.ModelViewSet):
    """
    Gestión de eventos de examen (para calendarios).
    - Profesor/Admin: crea y edita eventos de sus cursos.
    - Alumno: solo puede listar los eventos de sus cursos.
    """

    serializer_class = EventoExamenSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        qs = EventoExamen.objects.select_related("curso", "profesor")
        role = getattr(user, "role", None)

        if role == "S":
            # eventos de cursos donde está matriculado
            return qs.filter(
                curso__matriculas__alumno=user,
                visible_estudiantes=True,
            )
        if role == "T":
            return qs.filter(curso__profesor=user)
        if role == "A" or getattr(user, "is_superuser", False):
            return qs
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, "role", None)
        if role not in ("T", "A") and not getattr(user, "is_superuser", False):
            raise PermissionDenied(
                "Solo profesores o administradores pueden crear exámenes."
            )
        curso = serializer.validated_data.get("curso")
        if curso and role == "T" and curso.profesor_id != user.id:
            raise PermissionDenied(
                "Solo puedes crear exámenes para tus propios cursos."
            )
        serializer.save(profesor=user)
