from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversacion, Mensaje


User = get_user_model()


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")


class MensajeSerializer(serializers.ModelSerializer):
    autor = UserLiteSerializer(read_only=True)
    leido = serializers.SerializerMethodField()

    class Meta:
        model = Mensaje
        fields = ("id", "conversacion", "autor", "texto", "creado_en", "leido")
        read_only_fields = ("id", "autor", "creado_en", "leido")

    def get_leido(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        return obj.leido_por.filter(id=user.id).exists()


class ConversacionSerializer(serializers.ModelSerializer):
    participantes = UserLiteSerializer(many=True, read_only=True)
    ultimo_mensaje = serializers.SerializerMethodField()
    no_leidos = serializers.SerializerMethodField()

    class Meta:
        model = Conversacion
        fields = ("id", "asunto", "participantes", "creado_en", "actualizado_en", "ultimo_mensaje", "no_leidos")
        read_only_fields = ("id", "creado_en", "actualizado_en", "no_leidos")

    def get_ultimo_mensaje(self, obj):
        last = obj.mensajes.order_by('-creado_en').first()
        if not last:
            return None
        ctx = self.context
        return MensajeSerializer(last, context=ctx).data

    def get_no_leidos(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return 0
        return obj.mensajes.exclude(autor=user).exclude(leido_por=user).count()


class ConversacionCreateSerializer(serializers.Serializer):
    asunto = serializers.CharField(required=False, allow_blank=True)
    usernames = serializers.ListField(child=serializers.CharField(), required=False)
    participantes = serializers.ListField(child=serializers.IntegerField(), required=False)
    destinatario = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # Permitir alias 'destinatario' como un único username
        if not attrs.get('usernames') and attrs.get('destinatario'):
            attrs['usernames'] = [attrs['destinatario']]

        if not attrs.get('usernames') and not attrs.get('participantes'):
            raise serializers.ValidationError("Debe indicar 'usernames' o 'participantes' (ids)")
        return attrs
