from rest_framework import serializers
from .models import UsuarioPersonalizado

class UsuarioPersonalizadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioPersonalizado
        fields = '__all__'
        extra_kwargs = {
            'contraseña': {'write_only': True}  # (Para que la contraseña no se devuelva en las respuestas)
        }
