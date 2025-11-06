from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstudianteCursoViewSet, EstudianteTareasViewSet, EstudiantecalificacionViewSet, EstudianteEntregaViewSet

router = DefaultRouter()
router.register(r'cursos', EstudianteCursoViewSet, basename='curso')
router.register(r'tareas', EstudianteTareasViewSet, basename='tarea')
router.register(r'calificacion', EstudiantecalificacionViewSet, basename='calificacion')
# esta funcionalidad estará desactivada hasta que se consiga como guardar los ficheros de las tareas dentro de una DB externa 
# como Google Cloud Storage
# router.register(r'entrega_tareas', EstudianteEntregaViewSet, basename='entrega_tareas') 

urlpatterns = [
    path('', include(router.urls)),
]
