let productos = JSON.parse(localStorage.getItem("productos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActual = localStorage.getItem("sesion") || null;
let filtroActual = "todos";

/* -------- AUTH -------- */
function abrirAuth() {
  modalAuth.classList.remove("oculto");
  document.getElementById("carrusel").style.display = "none";
}

function cerrarAuth() {
  modalAuth.classList.add("oculto");
  document.getElementById("carrusel").style.display = "block";
}

function registrar() {
  let user = usuario.value;
  let pass = password.value;

  if (!user || !pass) return alert("Completa campos");

  if (usuarios.find(u => u.user === user)) {
    return alert("Usuario ya existe");
  }

  usuarios.push({ user, pass });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Registrado ✔");
}

function login() {
  let user = usuario.value;
  let pass = password.value;

  let encontrado = usuarios.find(u => u.user === user && u.pass === pass);

  if (!encontrado) return alert("Error en datos");

  usuarioActual = user;
  localStorage.setItem("sesion", user);

  document.querySelector(".acciones-header").innerHTML = `
    <span>👤 ${user}</span>
    <button onclick="abrirFormulario()">+ Publicar</button>
  `;

  cerrarAuth();
}

/* -------- FORM -------- */
function abrirFormulario() {
  // 🔥 YA NO requiere login
  modalForm.classList.remove("oculto");
}

function cerrarFormulario() {
  modalForm.classList.add("oculto");
}

/* -------- IMAGEN -------- */
function convertirImagen(file) {
  return new Promise((resolve) => {
    let reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/* -------- PUBLICAR -------- */
async function publicar() {
  let nombre = document.getElementById("nombre").value;
  let descripcion = document.getElementById("descripcion").value;
  let tipo = document.getElementById("tipo").value;
  let file = document.getElementById("imagen").files[0];

  if (!nombre || !descripcion || !tipo || !file) {
    return alert("Completa todos los campos");
  }

  // 👇 Aviso opcional si no hay usuario
  if (!usuarioActual) {
    let continuar = confirm("Publicarás como anónimo. ¿Quieres iniciar sesión?");
    if (continuar) {
      abrirAuth();
      return;
    }
  }

  let img = await convertirImagen(file);

  let producto = {
    nombre,
    descripcion,
    tipo,
    imagen: img,
    usuario: usuarioActual || "Anónimo"
  };

  productos.push(producto);
  localStorage.setItem("productos", JSON.stringify(productos));

  mostrarProductos();
  cerrarFormulario();
}

/* -------- MOSTRAR -------- */
function mostrarProductos() {
  let lista = document.getElementById("lista");
  let texto = document.getElementById("busqueda").value.toLowerCase();

  lista.innerHTML = "";

  productos
    .filter(p =>
      (filtroActual === "todos" || p.tipo === filtroActual) &&
      p.nombre.toLowerCase().includes(texto)
    )
    .forEach(p => {
      lista.innerHTML += `
        <div class="producto">
          <img src="${p.imagen}">
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <small>${p.tipo.toUpperCase()} | 👤 ${p.usuario}</small>
        </div>
      `;
    });
}

/* -------- FILTROS -------- */
function filtrar(tipo) {
  filtroActual = tipo;
  mostrarProductos();
}

function buscar() {
  mostrarProductos();
}

/* -------- CARRUSEL -------- */
let indiceSlide = 0;

function mostrarSlide(index) {
  let slides = document.querySelectorAll(".slide");

  if (index >= slides.length) indiceSlide = 0;
  if (index < 0) indiceSlide = slides.length - 1;

  slides.forEach(s => s.classList.remove("activo"));
  slides[indiceSlide].classList.add("activo");
}

function cambiarSlide(direccion) {
  indiceSlide += direccion;
  mostrarSlide(indiceSlide);
}

setInterval(() => {
  indiceSlide++;
  mostrarSlide(indiceSlide);
}, 4000);

/* -------- INIT -------- */
window.onload = () => {
  if (usuarioActual) {
    document.querySelector(".acciones-header").innerHTML = `
      <span>👤 ${usuarioActual}</span>
      <button onclick="abrirFormulario()">+ Publicar</button>
    `;
  }

  mostrarProductos();
};