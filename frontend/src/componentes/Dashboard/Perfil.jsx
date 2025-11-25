import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UsuarioContext } from "../useContext/UsuarioContext";
import { apiFetch } from "../Profesor/api";
import { ComponenteLoading } from '../PantallaLoading/ComponenteLoading';
import HelpElement from '../Authorization/HelpElement'

const Perfil = () => {
  const { usuario, setUsuario } = useContext(UsuarioContext);

  const [info, setInfo] = useState({
    nombre: "",
    email: "",
    rol: "",
    asignaturas: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ help, setHelp ] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false);

  // Avatar
  const avatarKey = usuario?.id ? `perfil_avatar_${usuario.id}` : "perfil_avatar";
  const [avatarType, setAvatarType] = useState("default1");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Modal editar perfil
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPassword2, setEditPassword2] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editOk, setEditOk] = useState("");

  // Cargar avatar del almacenamiento local
  useEffect(() => {
    try {
      const raw = localStorage.getItem(avatarKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setAvatarType(parsed.type || "default1");
      setAvatarDataUrl(parsed.dataUrl || "");
    } catch {
      // ignorar errores de parseo
    }
  }, [avatarKey]);

  // Asegurar que tenemos el id del usuario en contexto
  useEffect(() => {
    if (!usuario || usuario.id) return;
    let cancelado = false;

    const cargarMe = async () => {
      try {
        const me = await apiFetch("/usuarios/me/").catch(() => null);
        if (!me || cancelado) return;
        setUsuario((prev) => ({ ...prev, ...me }));
      } catch {
        // ignorar errores de /me
      }
    };

    cargarMe();
    return () => {
      cancelado = true;
    };
  }, [usuario, setUsuario]);

  // Cargar info real desde API
  useEffect(() => {
    if (!usuario?.role) return;
    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setError("");
      try {
        if (usuario.role === "S") {
          // Alumno: cursos en los que está matriculado
          const data = await apiFetch("/usuarios/mis-cursos/").catch(() => []);
          if (cancelado) return;
          const listCursos = Array.isArray(data) ? data : [];
          setInfo({
            nombre:
              `${usuario.first_name || ""} ${usuario.last_name || ""}`.trim() ||
              usuario.username,
            email: usuario.email,
            rol: "Estudiante",
            asignaturas: listCursos.map((c) => c.nombre),
          });
        } else {
          // Profesor / Admin: cursos que imparte
          const data = await apiFetch("/profesor/cursos/").catch(() => []);
          if (cancelado) return;
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
            ? data.results
            : [];
          setInfo({
            nombre:
              `${usuario.first_name || ""} ${usuario.last_name || ""}`.trim() ||
              usuario.username,
            email: usuario.email,
            rol: usuario.role === "T" ? "Profesor" : "Administrador",
            asignaturas: list.map((c) => c.nombre),
          });
        }
      } catch {
        if (!cancelado) {
          setError("No se pudo cargar la información del perfil");
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [usuario]);

  // Avatar helpers
  const handleAvatarSelect = (type) => {
    setAvatarType(type);
    if (type !== "custom") setAvatarDataUrl("");
    try {
      localStorage.setItem(
        avatarKey,
        JSON.stringify({ type, dataUrl: type === "custom" ? avatarDataUrl : "" })
      );
    } catch {
      // ignore
    }
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result || "";
      setAvatarDataUrl(dataUrl);
      setAvatarType("custom");
      try {
        localStorage.setItem(
          avatarKey,
          JSON.stringify({ type: "custom", dataUrl })
        );
      } catch {
        // ignore
      }
    };
    reader.readAsDataURL(file);
  };

  const renderAvatar = () => {
    if (avatarType === "custom" && avatarDataUrl) {
      return (
        <img
          src={avatarDataUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/60 shadow"
        />
      );
    }
    const base =
      avatarType === "default1"
        ? "bg-gradient-to-br from-sky-500 to-blue-700"
        : avatarType === "default2"
        ? "bg-gradient-to-br from-emerald-500 to-teal-700"
        : "bg-gradient-to-br from-purple-500 to-pink-600";
    const initials = `${(usuario.first_name || usuario.username || "U")[0] || ""}${
      (usuario.last_name || "")[0] || ""
    }`.toUpperCase();
    return (
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white ${base} shadow`}
      >
        {initials}
      </div>
    );
  };

  // Editar perfil
  const openEditProfile = () => {
    setEditError("");
    setEditOk("");
    setEditUsername(usuario.username || "");
    setEditEmail(usuario.email || "");
    setEditPassword("");
    setEditPassword2("");
    setEditOpen(true);
    setMenuOpen(false);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault?.();
    setEditError("");
    setEditOk("");
    if (!editUsername.trim() || !editEmail.trim()) {
      setEditError("Usuario y email son obligatorios");
      return;
    }
    if (editPassword || editPassword2) {
      if (editPassword !== editPassword2) {
        setEditError("Las contraseñas no coinciden");
        return;
      }
      if (editPassword.length < 8) {
        setEditError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
    }
    try {
      setSavingProfile(true);
      await apiFetch(`/usuarios/${usuario.id}/`, {
        method: "PATCH",
        body: { username: editUsername.trim(), email: editEmail.trim() },
      });
      if (editPassword) {
        await apiFetch("/usuarios/set-password/", {
          method: "POST",
          body: { new_password: editPassword },
        });
      }
      setUsuario((prev) => ({
        ...prev,
        username: editUsername.trim(),
        email: editEmail.trim(),
      }));
      setEditOk("Perfil actualizado correctamente");
      setTimeout(() => setEditOpen(false), 800);
    } catch {
      setEditError("No se pudo actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  if (!usuario?.role || loading) {
    return <ComponenteLoading />
  }

  const labelAsignaturas =
    usuario.role === "S" ? "Asignaturas inscritas" : "Asignaturas";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tarjeta principal */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow relative">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            {renderAvatar()}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Perfil {info.rol}
              </h1>
              <p className="text-sm text-gray-400">@{usuario.username}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
              aria-label="Opciones de perfil"
            >
              <span className="text-xl text-gray-700 dark:text-gray-200">
                {"\u2699"}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/40 font-semibold">
                  Opciones
                </div>
                <button
                  type="button"
                  onClick={openEditProfile}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Editar perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 transition-colors"
                >
                  Cambiar foto de perfil
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Datos principales */}
        <div className="grid md:grid-cols-2 gap-8 mt-2">
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                Nombre completo
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {info.nombre}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                Email
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {info.email}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                Rol
              </div>
              <div className="inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-semibold border border-blue-500/50 text-blue-300 bg-blue-500/10">
                {info.rol}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                {labelAsignaturas}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {info.asignaturas && info.asignaturas.length > 0
                  ? info.asignaturas.join(", ")
                  : "Sin asignaturas"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta accesos directos */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
          Accesos directos
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/40 hover:bg-blue-500/20 transition-colors"
          >
            Inicio
          </Link>
          {(usuario.role === "T" || usuario.role === "A") && (
            <Link
              to="/profesor"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/20 transition-colors"
            >
              Panel profesor
            </Link>
          )}
          <Link
            to="/tutorias"
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 transition-colors"
          >
            Tutorías
          </Link>
          <Link
            to="/mensajes"
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/40 hover:bg-purple-500/20 transition-colors"
          >
            Mensajes
          </Link>
        </div>
      </div>

      {/* Modal cambiar avatar */}
      {avatarModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-[420px]">
            <h3 className="text-lg font-semibold mb-3 text-white">
              Cambiar foto de perfil
            </h3>
            <div className="flex gap-3 mb-4">
              {["default1", "default2", "default3"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAvatarSelect(t)}
                  className={`w-12 h-12 rounded-full border-2 ${
                    avatarType === t ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <div
                    className={
                      "w-full h-full rounded-full " +
                      (t === "default1"
                        ? "bg-gradient-to-br from-sky-500 to-blue-700"
                        : t === "default2"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-700"
                        : "bg-gradient-to-br from-purple-500 to-pink-600")
                    }
                  />
                </button>
              ))}
            </div>
            <div className="mb-4 text-sm text-gray-200">
              <label className="block mb-1">O subir imagen propia</label>
              <input type="file" accept="image/*" onChange={handleAvatarFile} />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="px-3 py-1 rounded border border-gray-600 text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar perfil */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          {/* componente de ayuda para ingresar correctamente la contraseña */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 w-[460px]">
            <h3 className="text-lg font-semibold mb-3 text-white">
              Editar perfil
            </h3>
            <form
              onSubmit={handleSaveProfile}
              className="relative space-y-3 text-sm text-white"
              >
              {help === true && <HelpElement />}
              <div>
                <label className="block mb-1">Nombre de usuario</label>
                <input
                  className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1">Nueva contraseña</label>
                  <input
                    onMouseOver={() => setHelp(true)}
                    onMouseOut={()=>setHelp(false)}
                    type="password"
                    className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Dejar en blanco para no cambiarla"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).+$" minLength={8} maxLength={30}
                  />
                </div>
                <div>
                  <label className="block mb-1">Repetir contraseña</label>
                  <input
                    onMouseOver={() => setHelp(true)}
                    onMouseOut={()=>setHelp(false)}
                    type="password"
                    className="w-full rounded border border-gray-600 bg-transparent px-3 py-2"
                    value={editPassword2}
                    onChange={(e) => setEditPassword2(e.target.value)}
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).+$" minLength={8} maxLength={30}
                  />
                </div>
              </div>
              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editOk && <p className="text-xs text-emerald-400">{editOk}</p>}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-1 rounded border border-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-3 py-1 rounded border border-blue-500 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
