from rest_framework import serializers
from cursos.models import Curso, Tarea, Entrega, Calificacion, Tutoria
from cursos.serializers import TutoriaSerializer
from api.models import UsuarioPersonalizado
from django.contrib.auth import get_user_model


# esta logica se debe modificar. Mirar el views.py o urls.py para mas informacion al respecto 
class EstudianteEntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = ["id", "tarea", "alumno", "texto", "archivo", "enviada_en"]
        read_only_fields = ["alumno", "enviada_en"]


class EstudianteTareaSerializer(serializers.ModelSerializer):
    curso = serializers.CharField(source='curso.nombre')
    entregas = EstudianteEntregaSerializer(many=True, read_only=True)
    class Meta:
        model = Tarea
        fields = '__all__'


class EstudianteCursoSerializer(serializers.ModelSerializer):
    nombre_profesor = serializers.CharField(source='profesor.first_name')
    apellidos_profesor = serializers.CharField(source='profesor.last_name')
    username = serializers.CharField(source='profesor.username')
    # tutorias = TutoriaSerializer(many=True, read_only=True)
    tareas = EstudianteTareaSerializer(many=True, read_only=True)
    class Meta:
        model = Curso
        fields = ['nombre', 'nombre_profesor', 'apellidos_profesor', "id", "descripcion", "tareas", "profesor", "username"]


class EstudianteCalificacionSerializer(serializers.ModelSerializer):
    tarea_titulo = serializers.CharField(
        source="entrega.tarea.titulo", read_only=True
    )
    curso = serializers.IntegerField(
        source="entrega.tarea.curso.id", read_only=True
    )
    curso_nombre = serializers.CharField(
        source="entrega.tarea.curso.nombre", read_only=True
    )
    fecha_evaluacion = serializers.DateTimeField(
        source="calificada_en", read_only=True
    )
    calificacion_texto = serializers.SerializerMethodField()

    class Meta:
        model = Calificacion
        fields = [
            "id",
            "entrega",
            "nota",
            "feedback",
            "fecha_evaluacion",
            "tarea_titulo",
            "curso",
            "curso_nombre",
            "calificacion_texto",
        ]

    def get_calificacion_texto(self, obj):
        nota = float(obj.nota)
        if nota < 5.0:
            return "Suspenso"
        if nota < 6.0:
            return "Aprobado"
        if nota < 7.0:
            return "Bien"
        if nota < 9.0:
            return "Notable"
        return "Sobresaliente"


class EstudianteTutoriaSerializer(serializers.ModelSerializer):
    profesor_username = serializers.CharField(source='profesor.username', read_only=True)
    profesor = serializers.PrimaryKeyRelatedField(
    queryset=UsuarioPersonalizado.objects.filter(role="T"))
    alumno = serializers.PrimaryKeyRelatedField(read_only=True)
    alumno_username = serializers.CharField(source='alumno.username', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    alumno_nombre_completo = serializers.SerializerMethodField()
    profesor_nombre_completo = serializers.SerializerMethodField()
    class Meta:
        model = Tutoria
        fields = "__all__"
    
    def get_alumno_nombre_completo(self, obj):
        return f"{obj.alumno.first_name} {obj.alumno.last_name}".strip() or obj.alumno.username

    def get_profesor_nombre_completo(self, obj):
        return f"{obj.profesor.first_name} {obj.profesor.last_name}".strip() or obj.profesor.username
