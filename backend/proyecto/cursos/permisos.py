from rest_framework.permissions import BasePermission


class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ("T", "A")


class IsOwnerTeacherOrAdmin(BasePermission):
    """
    Para objetos ligados a un curso: solo el profesor dueño o un administrador.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == "A":
            return True

        if hasattr(obj, "profesor_id"):
            return obj.profesor_id == request.user.id

        curso = getattr(obj, "curso", None)
        if curso is None and hasattr(obj, "tarea"):
            curso = obj.tarea.curso
        if curso is None and hasattr(obj, "entrega"):
            curso = obj.entrega.tarea.curso

        return bool(curso and curso.profesor_id == request.user.id)
