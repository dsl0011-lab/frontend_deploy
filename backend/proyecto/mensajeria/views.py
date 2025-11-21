from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status, serializers as drf_serializers
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from authentication import CookieJWTAuthentication

from .models import Conversacion, Mensaje
from .serializers import (
    ConversacionSerializer, MensajeSerializer, ConversacionCreateSerializer
)

User = get_user_model()


class ConversacionViewSet(viewsets.ModelViewSet):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversacionSerializer

    def get_queryset(self):
        user = self.request.user
        return Conversacion.objects.filter(participantes=user).order_by('-actualizado_en')

    def get_serializer_class(self):
        if self.action == 'create':
            return ConversacionCreateSerializer
        return super().get_serializer_class()

    def perform_create(self, serializer):
        data = serializer.validated_data
        usernames = data.get('usernames') or []
        participantes_ids = data.get('participantes') or []
        users = []
        # Buscar usernames case-insensitive individualmente para evitar fallos de coincidencia
        for name in usernames:
            try:
                u = User.objects.get(username__iexact=str(name).strip())
                users.append(u)
            except User.DoesNotExist:
                continue
        for uid in participantes_ids:
            try:
                u = User.objects.get(pk=int(uid))
                users.append(u)
            except Exception:
                continue
        # asegura que el creador esté incluido
        if self.request.user not in users:
            users.append(self.request.user)
        # Si no hay ningun destinatario adicional, devuelve error claro
        destinatarios = [u for u in users if u.id != self.request.user.id]
        if len(destinatarios) == 0:
            raise drf_serializers.ValidationError({"detail": "No se encontraron destinatarios válidos"})

        c = Conversacion.objects.create(asunto=data.get('asunto', ''))
        # Unicos por id
        uniq = {u.id: u for u in users}.values()
        c.participantes.set(list(uniq))
        c.save()
        # devuelve representacion completa
        self._created_obj = c

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        out = ConversacionSerializer(self._created_obj, context={'request': request}).data
        return Response(out, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Solo ADMIN ('A'), profesor ('T') o superuser pueden borrar conversaciones."""
        user = request.user
        role = getattr(user, 'role', None)
        if not (getattr(user, 'is_superuser', False) or role in ('A', 'T')):
            return Response({"detail": "Solo profesores o administradores pueden eliminar conversaciones."},
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get', 'post'], url_path='mensajes')
    def mensajes(self, request, pk=None):
        conv = self.get_object()
        if request.method.lower() == 'get':
            qs = conv.mensajes.select_related('autor').order_by('creado_en')
            data = MensajeSerializer(qs, many=True, context={'request': request}).data
            mark = request.query_params.get('mark_read', '1')
            if str(mark).lower() in ('1', 'true', 'yes', 'y'):
                qs.exclude(autor=request.user).exclude(leido_por=request.user).update()
                for m in qs.exclude(autor=request.user):
                    m.leido_por.add(request.user)
            return Response(data)
        # POST nuevo mensaje
        texto = request.data.get('texto') or request.data.get('mensaje')
        if not texto or not str(texto).strip():
            return Response({'detail': 'texto requerido'}, status=400)
        m = Mensaje.objects.create(conversacion=conv, autor=request.user, texto=str(texto).strip())
        m.leido_por.add(request.user)
        # toca la conversacion para reordenar
        conv.save()
        return Response(MensajeSerializer(m, context={'request': request}).data, status=201)

    @action(detail=True, methods=['post'], url_path='marcar-leidos')
    def marcar_leidos(self, request, pk=None):
        conv = self.get_object()
        for m in conv.mensajes.exclude(autor=request.user):
            m.leido_por.add(request.user)
        return Response({'ok': True})


@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([permissions.IsAuthenticated])
def directorio_usuarios(request):
    """
    Devuelve un directorio de usuarios visible para el solicitante.
    - Si es ADMIN (A): devuelve ADMIN, PROFESORES (T) y ALUMNOS (S)
    - Si es PROFESOR (T): devuelve ADMIN, PROFESORES y ALUMNOS
    - Si es ALUMNO (S): devuelve solo PROFESORES
    """
    me = request.user
    role = getattr(me, 'role', None)
    if role == 'S':
        allowed = ['T']
    elif role == 'T':
        allowed = ['A', 'T', 'S']
    else:  # Admin o superuser
        allowed = ['A', 'T', 'S']

    qs = User.objects.filter(role__in=allowed).values('id', 'username', 'first_name', 'last_name', 'role')
    grouped = { 'A': [], 'T': [], 'S': [] }
    for u in qs:
        grouped.setdefault(u['role'], []).append({
            'id': u['id'],
            'username': u['username'],
            'first_name': u.get('first_name') or '',
            'last_name': u.get('last_name') or '',
            'role': u['role'],
        })
    return Response(grouped, status=200)
