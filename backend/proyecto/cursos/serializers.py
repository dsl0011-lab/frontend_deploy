from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Curso, Matricula, Tarea, Entrega, Calificacion, Tutoria

class CursoSerializer(serializers.ModelSerializer):
    alumnos_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Curso
        fields = ['id','nombre','descripcion','profesor','creado_en','alumnos_count']
        read_only_fields = ['profesor','creado_en','alumnos_count']

class MatriculaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matricula
        fields = ['id','curso','alumno','fecha']

class TareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarea
        fields = ['id','curso','titulo','descripcion','fecha_entrega','publicado','creado_en']
        read_only_fields = ['creado_en']

class EntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = ['id','tarea','alumno','texto','archivo','enviada_en']
        read_only_fields = ['enviada_en']

class CalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = ['id','entrega','nota','feedback','calificada_en']
        read_only_fields = ['calificada_en']

class AlumnoResumenSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    cursos = serializers.ListField(child=serializers.DictField(), default=list)


class AlumnoOptionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)


class TutoriaSerializer(serializers.ModelSerializer):
    profesor_nombre = serializers.SerializerMethodField()
    profesor_username = serializers.CharField(source='profesor.username', read_only=True)
    alumno_nombre = serializers.SerializerMethodField()
    alumno_username = serializers.CharField(source='alumno.username', read_only=True)
    alumno_username_input = serializers.CharField(write_only=True, required=False, allow_blank=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    class Meta:
        model = Tutoria
        fields = [
            'id',
            'profesor',
            'profesor_nombre',
            'profesor_username',
            'alumno',
            'alumno_nombre',
            'alumno_username',
            'alumno_username_input',
            'asignatura',
            'fecha',
            'estado',
            'estado_display',
            'notas',
            'creado_en',
        ]
        read_only_fields = [
            'id',
            'profesor',
            'profesor_nombre',
            'profesor_username',
            'alumno_nombre',
            'alumno_username',
            'estado_display',
            'creado_en',
        ]

    def get_profesor_nombre(self, obj):
        return obj.profesor.get_full_name() or obj.profesor.username

    def get_alumno_nombre(self, obj):
        return obj.alumno.get_full_name() or obj.alumno.username

    def validate(self, attrs):
        attrs = super().validate(attrs)
        alumno = attrs.get('alumno')
        if alumno:
            return attrs

        username = self.initial_data.get('alumno_username') or self.initial_data.get('alumno_username_input')
        if not username:
            raise serializers.ValidationError({'alumno': 'Debes indicar el alumno (id) o su username.'})

        User = get_user_model()
        try:
            attrs['alumno'] = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError({'alumno_username': 'No existe un usuario con ese username.'})
        return attrs
