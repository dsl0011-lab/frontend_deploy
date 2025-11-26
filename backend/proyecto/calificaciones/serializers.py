from rest_framework import serializers
from .models import NotaAcademica, Asistencia, EventoExamen
from django.db.models import Avg, Count

class NotaAcademicaSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.username', read_only=True)
    curso_nombre = serializers.CharField(source='curso.nombre', read_only=True)
    calificacion_texto = serializers.ReadOnlyField()
    
    class Meta:
        model = NotaAcademica
        fields = '__all__'
        read_only_fields = ['profesor', 'fecha_registro', 'actualizado']

class AsistenciaSerializer(serializers.ModelSerializer):
    estudiante_nombre = serializers.CharField(source='estudiante.username', read_only=True)
    curso_nombre = serializers.CharField(source='curso.nombre', read_only=True)
    
    class Meta:
        model = Asistencia
        fields = '__all__'
        read_only_fields = ['profesor', 'fecha_registro', 'actualizado']


class EventoExamenSerializer(serializers.ModelSerializer):
    curso_nombre = serializers.CharField(source='curso.nombre', read_only=True)
    profesor_nombre = serializers.CharField(source='profesor.username', read_only=True)

    class Meta:
        model = EventoExamen
        fields = [
            'id',
            'curso',
            'curso_nombre',
            'profesor',
            'profesor_nombre',
            'titulo',
            'descripcion',
            'fecha_examen',
            'visible_estudiantes',
            'creado_en',
            'actualizado',
        ]
        read_only_fields = ['profesor', 'creado_en', 'actualizado']
