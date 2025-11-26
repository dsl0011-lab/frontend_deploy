from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TutoriaViewSet,
    EstudianteCursoViewSet,
    EstudianteTareasViewSet,
    EstudiantecalificacionViewSet,
    EstudianteEntregaViewSet,
)

router = DefaultRouter()
router.register(r"cursos", EstudianteCursoViewSet, basename="curso")
router.register(r"tareas", EstudianteTareasViewSet, basename="tarea")
router.register(r"calificacion", EstudiantecalificacionViewSet, basename="calificacion")
router.register(r"tutorias", TutoriaViewSet, basename="tutorias")
router.register(r"entregas", EstudianteEntregaViewSet, basename="entregas")

urlpatterns = [
    path("", include(router.urls)),
]

