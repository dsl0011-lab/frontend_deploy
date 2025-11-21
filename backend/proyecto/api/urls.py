
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (TokenRefreshView, TokenVerifyView)

from api.views import (
    # CookieTokenVerifyView,
    UsuarioPersonalizadoViewSet,
    MyTokenObtainPairView,
    register_user,
    InicioAutomatico,
    logout,
    CookieTokenRefreshView,
    CookieTokenVerifyView,
    tareas_curso_para_alumno,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioPersonalizadoViewSet, basename='usuarios')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/token/refresh_cookie/', CookieTokenRefreshView.as_view(), name='token_refresh_cookie'), #endpoint para refresh usando cookie httponly
    path("auth/token/verify_cookie/", CookieTokenVerifyView.as_view(), name="token_verify_cookie"), #endpoint para verify usando cookie httponly
    path('auth/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/inicioAutomatico', InicioAutomatico.as_view(), name='token_obtain_pair'),
    path('auth/register/', register_user, name='register'),
    path('auth/logout', logout, name='logout'), #endpoint para logout eliminando la cookie httponly
    # Alumno: tareas publicadas de un curso concreto
    path('alumno/cursos/<int:curso_id>/tareas/', tareas_curso_para_alumno, name='alumno_tareas_curso'),
]
