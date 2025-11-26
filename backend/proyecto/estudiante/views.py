from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from cursos.models import Curso, Tarea, Entrega, Calificacion, Tutoria
from .serializers import (
    EstudianteCursoSerializer, EstudianteTareaSerializer,
    EstudianteEntregaSerializer, EstudianteCalificacionSerializer, EstudianteTutoriaSerializer
)
from authentication import CookieJWTAuthentication #middleware personalizado para leer token desde cookie httponly


class EstudianteCursoViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteCursoSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        curso_id = self.kwargs.get("pk")
        queryset = Curso.objects.filter(matriculas__alumno=user)
        if curso_id:
            queryset = queryset.filter(id=curso_id)
        return queryset.select_related('profesor')


class EstudianteTareasViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteTareaSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Tarea.objects.filter(curso__matriculas__alumno=user)    


class TutoriaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteTutoriaSerializer
    def get_queryset(self):
        print(self.request.data)
        user = self.request.user
        return Tutoria.objects.filter(alumno=user)   
    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(alumno=user)



# esta logica no ha sido testeada aún
class EstudiantecalificacionViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteCalificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Calificaciones de tareas (modelo cursos.Calificacion) para el alumno autenticado
        return Calificacion.objects.filter(
            entrega__alumno=user
        ).select_related("entrega", "entrega__tarea", "entrega__tarea__curso")


# esta funcionalidad se debera investigar mas a fondo a traves de Google Cloud Storage, Amazon S3, Azure Blob Storage, etc
# la principal premisa será no guardar los ficheros (pdf, word, excel) dentro de la BD como buena practica de desarrollo
# por ende, se desactivara hasta nuevo aviso
class EstudianteEntregaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteEntregaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Entrega.objects.filter(
            alumno=user
        ).select_related("tarea", "tarea__curso")

    def perform_create(self, serializer):
        """
        Crea una entrega asociándola siempre al alumno autenticado
        y validando que la tarea pertenece a un curso en el que está matriculado.
        """
        from django.shortcuts import get_object_or_404

        user = self.request.user
        tarea_id = self.request.data.get("tarea")
        tarea = get_object_or_404(
            Tarea,
            pk=tarea_id,
            curso__matriculas__alumno=user,
        )
        serializer.save(alumno=user, tarea=tarea)
