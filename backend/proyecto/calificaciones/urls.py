from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CalificacionViewSet, AsistenciaViewSet, EventoExamenViewSet

router = DefaultRouter()
router.register(r'notas', CalificacionViewSet, basename='calificacion')
router.register(r'asistencias', AsistenciaViewSet, basename='asistencia')
router.register(r'examenes', EventoExamenViewSet, basename='evento_examen')

urlpatterns = [
    path('', include(router.urls)),
]
