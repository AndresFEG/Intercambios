/* ==========================
   DATOS
========================== */

let productos = JSON.parse(localStorage.getItem("productos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let usuarioActual = JSON.parse(localStorage.getItem("sesion"))?.user || null;
let filtroActual = "todos";

/* ==========================
   INICIO APP
========================== */

window.onload = () => {

  usuarioActual = JSON.parse(localStorage.getItem("sesion"))?.user || null;

  actualizarHeader();     // primero usuario
  mostrarProductos();     // luego productos
  mostrarSlide(0);
};

/* ==========================
   AUTENTICACIÓN
========================== */

function abrirAuth() {
  document.getElementById("modalAuth").classList.remove("oculto");
  document.getElementById("carrusel").style.display = "none";
}

function cerrarAuth() {
  document.getElementById("modalAuth").classList.add("oculto");
  document.getElementById("carrusel").style.display = "block";
}

function registrar() {

  let user = document.getElementById("usuario").value.trim();
  let pass = document.getElementById("password").value.trim();

  if (!user || !pass) {
    return alert("Completa todos los campos");
  }

  let existe = usuarios.find(u => u.user === user);

  if (existe) {
    return alert("El usuario ya existe");
  }

  usuarios.push({ user, pass });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Usuario registrado");

  document.getElementById("usuario").value = "";
  document.getElementById("password").value = "";
}

function login() {

  let user = document.getElementById("usuario").value.trim();
  let pass = document.getElementById("password").value.trim();

  let encontrado = usuarios.find(
    u => u.user === user && u.pass === pass
  );

  if (!encontrado) {
    return alert("Datos incorrectos");
  }

  usuarioActual = user;

  localStorage.setItem("sesion", JSON.stringify({ user }));

  actualizarHeader();
  mostrarProductos();
  cerrarAuth();

  alert("Bienvenido " + user);
}

function logout() {

  usuarioActual = null;
  localStorage.removeItem("sesion");

  actualizarHeader();
  mostrarProductos();

  alert("Sesión cerrada");
}

/* ==========================
   HEADER
========================== */

function actualizarHeader() {

  let acciones = document.querySelector(".acciones-header");

  if (usuarioActual) {

    acciones.innerHTML = `
      <span>👤 ${usuarioActual}</span>

      <button onclick="abrirFormulario()">
        Publicar
      </button>

      <button onclick="logout()">
        Salir
      </button>
    `;

  } else {

    acciones.innerHTML = `
      <button onclick="abrirAuth()">
        Ingresar
      </button>
    `;
  }
}

/* ==========================
   FORMULARIO
========================== */

function abrirFormulario() {
  document.getElementById("modalForm").classList.remove("oculto");
}

function cerrarFormulario() {
  document.getElementById("modalForm").classList.add("oculto");
}

/* ==========================
   IMAGEN
========================== */

function convertirImagen(file) {

  return new Promise((resolve) => {

    let reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.readAsDataURL(file);
  });
}

/* ==========================
   PUBLICAR
========================== */

async function publicar() {

  let nombre = document.getElementById("nombre").value.trim();
  let descripcion = document.getElementById("descripcion").value.trim();
  let tipo = document.getElementById("tipo").value;
  let precio = document.getElementById("precio").value;
  let file = document.getElementById("imagen").files[0];

  if (!nombre || !descripcion || !tipo || !file) {
    return alert("Completa todos los campos");
  }

  let img = await convertirImagen(file);

 let producto = {
  id: Date.now(),
  nombre,
  descripcion,
  tipo,
  precio: tipo === "venta" ? precio : null,
  imagen: img,
  usuario: usuarioActual || "Anónimo",
  fecha: new Date().toLocaleDateString(),
  estado: "Disponible"
};

  productos.push(producto);

  localStorage.setItem("productos", JSON.stringify(productos));

  limpiarFormulario();
  mostrarProductos();
  cerrarFormulario();

  alert("Publicación creada");
}

function limpiarFormulario() {

  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("tipo").value = "";
  document.getElementById("imagen").value = "";
}

/* ==========================
   MOSTRAR PRODUCTOS
========================== */

function mostrarProductos() {

  let lista = document.getElementById("lista");

  let texto = document.getElementById("busqueda")
    .value
    .toLowerCase();

  lista.innerHTML = "";

  let filtrados = productos.filter(p => {

    let okFiltro =
      filtroActual === "todos" ||
      p.tipo === filtroActual;

    let okBusqueda =
      p.nombre.toLowerCase().includes(texto);

    return okFiltro && okBusqueda;
  });

  filtrados.forEach(p => {

    lista.innerHTML += `
      <div class="producto">

        <img src="${p.imagen}">

        <h3>${p.nombre}</h3>

        <p>${p.descripcion}</p>

        ${p.tipo === "venta"
  ? `<p class="precio">💰 $${p.precio}</p>`
  : ""
}

        <small>
          ${p.tipo.toUpperCase()}
          | 🏢 Gestionado por Intercambielo PS
          | 📅 ${p.fecha}
        </small>

        <br><br>

        <br><br>

<button
  class="btn-intermediario"
  onclick="abrirChatBot(${p.id})">

  ${p.tipo === "venta"
      ? "💰 Comprar"
      : "🔄 Solicitar intercambio"}

</button>

${
  usuarioActual === p.usuario
    ? `
      <button class="btn-eliminar"
        onclick="eliminarProducto(${p.id})">
        🗑 Eliminar
      </button>
    `
    : ""
}

      </div>
    `;
  });
}

/* ==========================
   ELIMINAR
========================== */

function eliminarProducto(id) {

  let confirmar = confirm("¿Eliminar publicación?");

  if (!confirmar) return;

  productos = productos.filter(p => p.id !== id);

  localStorage.setItem("productos", JSON.stringify(productos));

  mostrarProductos();

  alert("Eliminado");
}

/* ==========================
   FILTROS
========================== */

function filtrar(tipo) {
  filtroActual = tipo;
  mostrarProductos();
}

/* ==========================
   BUSCADOR
========================== */

function buscar() {
  mostrarProductos();
}

/* ==========================
   CARRUSEL
========================== */

let indiceSlide = 0;

function mostrarSlide(index) {

  let slides = document.querySelectorAll(".slide");

  if (!slides.length) return;

  if (index >= slides.length) indiceSlide = 0;
  if (index < 0) indiceSlide = slides.length - 1;

  slides.forEach(s => s.classList.remove("activo"));

  slides[indiceSlide].classList.add("activo");
}

function cambiarSlide(d) {
  indiceSlide += d;
  mostrarSlide(indiceSlide);
}

setInterval(() => {

  let slides = document.querySelectorAll(".slide");

  if (!slides.length) return;

  indiceSlide++;

  mostrarSlide(indiceSlide);

}, 4000);

document.getElementById("tipo").addEventListener("change", function () {

  let precio = document.getElementById("precio");

  if (this.value === "venta") {
    precio.style.display = "block";
  } else {
    precio.style.display = "none";
    precio.value = "";
  }
});

let productoSeleccionado = null;

function abrirChatBot(id){

  productoSeleccionado = productos.find(
    p => p.id === id
  );

  document
    .getElementById("modalChat")
    .classList.remove("oculto");

}

function cerrarChatBot(){

  document
    .getElementById("modalChat")
    .classList.add("oculto");

}

function enviarMensaje(){

  let input =
    document.getElementById("mensajeUsuario");

  let mensaje =
    input.value.trim();

  if(!mensaje) return;

  let chat =
    document.getElementById("chatMensajes");

  chat.innerHTML += `
    <div class="usuario">
      ${mensaje}
    </div>
  `;

  setTimeout(()=>{

    let respuesta = "";

    if(productoSeleccionado.tipo === "venta"){

      respuesta = `
      Gracias por tu interés.<br><br>

      Hemos recibido tu solicitud de compra.<br><br>

      Un asesor de Intercambielo PS<br>
      revisará la disponibilidad del producto<br>
      y continuará el proceso.<br><br>

      📌 Por favor diligencia los siguientes datos:<br>
      👤 Nombre completo<br>
      📱 WhatsApp<br>
      📍 Ciudad<br><br>

      🧑‍💼 Un asesor se comunicará contigo.
      `;

    }else{

      respuesta = `
      Gracias por tu interés.<br><br>

      Describe el producto que deseas ofrecer a cambio.<br><br>

      📌 Por favor diligencia los siguientes datos:<br>
      👤 Nombre completo<br>
      📱 WhatsApp<br>
      📍 Ciudad<br>
      🎁 Producto que ofreces a cambio<br><br>

      🧑‍💼 Nuestro equipo evaluará la propuesta y se comunicará contigo.
      `;

    }

    chat.innerHTML += `
      <div class="bot">
        ${respuesta}
      </div>
    `;

    chat.scrollTop =
      chat.scrollHeight;

  },800);

  input.value = "";

}
