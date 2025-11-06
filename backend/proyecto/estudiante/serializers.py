from rest_framework import serializers
from cursos.models import Curso, Tarea, Entrega, Calificacion

class EstudianteCursoSerializer(serializers.ModelSerializer):
    nombre_profesor = serializers.CharField(source='profesor.first_name')
    apellidos_profesor = serializers.CharField(source='profesor.last_name')
    class Meta:
        model = Curso
        fields = ['nombre', 'nombre_profesor', 'apellidos_profesor', "id", "descripcion"]

class EstudianteTareaSerializer(serializers.ModelSerializer):
    curso = serializers.CharField(source='curso.nombre')
    class Meta:
        model = Tarea
        fields = ['titulo', 'descripcion', 'fecha_entrega', 'curso']

class EstudianteCalificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calificacion
        fields = '__all__'



# esta logica se debe modificar. Mirar el views.py o urls.py para mas informacion al respecto 
class EstudianteEntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entrega
        fields = '__all__' 
