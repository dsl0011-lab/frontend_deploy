from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from cursos.models import Curso, Tarea, Entrega, Calificacion
from .serializers import (
    EstudianteCursoSerializer, EstudianteTareaSerializer,
    EstudianteEntregaSerializer, EstudianteCalificacionSerializer
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


# esta logica no ha sido testeada aún
class EstudiantecalificacionViewSet(viewsets.ReadOnlyModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteCalificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # se debera comprobar que esta logica funciona correctamente cuando un profesor califique una tarea
        return Calificacion.objects.filter(curso__matriculas_alumno=user) 


# esta funcionalidad se debera investigar mas a fondo a traves de Google Cloud Storage, Amazon S3, Azure Blob Storage, etc
# la principal premisa será no guardar los ficheros (pdf, word, excel) dentro de la BD como buena practica de desarrollo
# por ende, se desactivara hasta nuevo aviso
class EstudianteEntregaViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    serializer_class = EstudianteEntregaSerializer
    permission_classes = [permissions.IsAuthenticated]