from rest_framework import serializers
from cursos.models import Curso, Tarea, Entrega, Calificacion
from cursos.serializers import TutoriaSerializer


# esta logica se debe modificar. Mirar el views.py o urls.py para mas informacion al respecto 
class EstudianteEntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__'


class EstudianteTareaSerializer(serializers.ModelSerializer):
    curso = serializers.CharField(source='curso.nombre')
    entregas = EstudianteEntregaSerializer(many=True, read_only=True)
    class Meta:
        model = Tarea
        fields = '__all__'


class EstudianteCursoSerializer(serializers.ModelSerializer):
    nombre_profesor = serializers.CharField(source='profesor.first_name')
    apellidos_profesor = serializers.CharField(source='profesor.last_name')
    # tutorias = TutoriaSerializer(many=True, read_only=True)
    tareas = EstudianteTareaSerializer(many=True, read_only=True)
    class Meta:
        model = Curso
        fields = ['nombre', 'nombre_profesor', 'apellidos_profesor', "id", "descripcion", "tareas"]


class EstudianteCalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = '__all__'


