from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConversacionViewSet
from .views import directorio_usuarios

router = DefaultRouter()
router.register(r'conversaciones', ConversacionViewSet, basename='conversacion')

urlpatterns = [
    path('', include(router.urls)),
    path('directorio/', directorio_usuarios, name='mensajeria_directorio'),
]
