
let usuarioActual = null;

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notification = document.getElementById('notification');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-md text-white font-medium fade-in ${
        tipo === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = mensaje;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function cerrarModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function mostrarLogin() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function mostrarRegistro() {
    document.getElementById('register-modal').classList.remove('hidden');
}

async function verificarSesion() {
    try {
        const response = await fetch('./api/routes/usuarios.php?action=verificar-sesion');
        const data = await response.json();
        
        if (data.logueado) {
            usuarioActual = data.usuario;
            actualizarUI(true);
        } else {
            actualizarUI(false);
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        actualizarUI(false);
    }
}

function actualizarUI(logueado) {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');

    const postulacionesLink = document.getElementById('postulaciones-link');
    
    if (logueado && usuarioActual) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'flex';

        postulacionesLink.style.display = 'block';
        
        document.getElementById('user-name').textContent = usuarioActual.nombre;
        document.getElementById('user-avatar').textContent = usuarioActual.nombre.charAt(0).toUpperCase();
    } else {
        authButtons.style.display = 'flex';
        userMenu.style.display = 'none';

        postulacionesLink.style.display = 'none';
    }
}

async function logout() {
    try {
        const response = await fetch('./api/routes/usuarios.php?action=logout', {
            method: 'POST'
        });
        const data = await response.json();
        
        if (data.success) {
            usuarioActual = null;
            actualizarUI(false);
            mostrarEmpleos();
            mostrarNotificacion('Sesión cerrada exitosamente');
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarNotificacion('Error al cerrar sesión', 'error');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await fetch('./api/routes/usuarios.php?action=login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                usuarioActual = data.usuario;
                actualizarUI(true);
                cerrarModal('login-modal');
                mostrarNotificacion('¡Bienvenido de nuevo!');
                document.getElementById('login-form').reset();
               localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            mostrarNotificacion('Error al conectar con el servidor', 'error');
        }
    });
    
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const response = await fetch('./api/routes/usuarios.php?action=register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                cerrarModal('register-modal');
                mostrarNotificacion('Usuario registrado exitosamente. ¡Ahora puedes iniciar sesión!');
                document.getElementById('register-form').reset();
                setTimeout(() => mostrarLogin(), 1000);
            } else {
                mostrarNotificacion(data.message, 'error');
            }
        } catch (error) {
            console.error('Error al registrar:', error);
            mostrarNotificacion('Error al conectar con el servidor', 'error');
        }
    });
    
    verificarSesion();
    
    cargarEmpleos();
});

function mostrarEmpleos() {
    document.getElementById('empleos-view').style.display = 'block';
    document.getElementById('postulaciones-view').style.display = 'none';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('border-b-2', 'border-blue-600', 'text-gray-900');
        link.classList.add('text-gray-500');
    });
    
    document.querySelector('[onclick="mostrarEmpleos()"]').classList.add('border-b-2', 'border-blue-600', 'text-gray-900');
    document.querySelector('[onclick="mostrarEmpleos()"]').classList.remove('text-gray-500');
}

function mostrarMisPostulaciones() {
    if (!usuarioActual) {
        mostrarLogin();
        return;
    }
    
    document.getElementById('empleos-view').style.display = 'none';
    document.getElementById('postulaciones-view').style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('border-b-2', 'border-blue-600', 'text-gray-900');
        link.classList.add('text-gray-500');
    });
    
    document.querySelector('[onclick="mostrarMisPostulaciones()"]').classList.add('border-b-2', 'border-blue-600', 'text-gray-900');
    document.querySelector('[onclick="mostrarMisPostulaciones()"]').classList.remove('text-gray-500');
    
    cargarMisPostulaciones();
}



async function cargarEmpleos() {
    try {
        const response = await fetch('./api/routes/llamados.php');
        const data = await response.json();
        
        const jobsGrid = document.getElementById('container');
        jobsGrid.innerHTML = '';
        
        const empleosActivos = document.getElementById('empleos-activos');
        if (empleosActivos) {
            empleosActivos.textContent = data.llamados.length;
        }
        
        for (const llamado of data.llamados) {
            const card = await crearCardEmpleo(llamado);
            jobsGrid.appendChild(card);
        }
    } catch (error) {
        console.error('Error al cargar los empleos:', error);
        mostrarNotificacion('Error al cargar los empleos', 'error');
    }
}

async function crearCardEmpleo(llamado) {
    let yaPostulado = false;
    if (usuarioActual) {
        try {
            const response = await fetch(`./api/routes/postulaciones.php?action=verificar&llamado_id=${llamado.id}`);
            const data = await response.json();
            yaPostulado = data.postulado;
        } catch (error) {
            console.error('Error al verificar postulación:', error);
        }
    }
    
    const card = document.createElement('div');
    card.className = 'job-card bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md cursor-pointer';
    
    const botonTexto = yaPostulado ? 'Ya Postulado' : 'Postular';
    const botonClase = yaPostulado ? 
        'bg-gray-400 cursor-not-allowed' : 
        'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
                ${llamado.logo ? `<img src="${llamado.logo}" alt="Logo" class="w-12 h-12 rounded-lg object-cover">` : ''}
                <div>
                    <h3 class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">${llamado.titulo}</h3>
                    <p class="text-sm text-gray-500">Empresa: ${llamado.empresa_nombre}</p>
                </div>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
               #${llamado.id}
            </span>
        </div>
        <p class="text-gray-700 text-sm leading-relaxed mb-4">${llamado.descripcion}</p>
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 110-4 2 2 0 000 4z" clip-rule="evenodd" />
                    </svg>
                    ${llamado.tipo || 'No especificado'}
                </span>
                <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                    </svg>
                    ${(() => {
                        if (!llamado.fecha) return 'Sin fecha';
                        const fechaLlamado = new Date(llamado.fecha);
                        const hoy = new Date();
                        fechaLlamado.setHours(0,0,0,0);
                        hoy.setHours(0,0,0,0);
                        const diffTime = hoy - fechaLlamado;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'Hoy' : `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
                    })()}
                </span>
            </div>
            <button 
                onclick="postularseAEmpleo(${llamado.id})" 
                ${yaPostulado ? 'disabled' : ''}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${botonClase}">
                ${botonTexto}
            </button>
        </div>
    `;
    
    return card;
}

async function postularseAEmpleo(llamadoId) {
    if (!usuarioActual) {
        mostrarLogin();
        return;
    }
    
    try {
        const response = await fetch('./api/routes/postulaciones.php?action=postular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                usuario_id: usuarioActual.id,
                llamado_id: llamadoId 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('¡Postulación enviada exitosamente!');
            cargarEmpleos();
        } else {
            mostrarNotificacion(data.message, 'error');
        }
    } catch (error) {
        console.error('Error al postular:', error);
        mostrarNotificación('Error al enviar postulación', 'error');
    }
}

async function cargarMisPostulaciones() {
    try {
        const usuario_id = JSON.parse(localStorage.getItem('usuarioActual'));

        const response = await fetch('./api/routes/postulaciones.php?action=mis-postulaciones');
        const data = await response.json();
        
        const container = document.getElementById('postulaciones-container');
        
        if (data.success && data.postulaciones.length > 0) {
            container.innerHTML = data.postulaciones.map(postulacion => `
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            ${postulacion.logo ? `<img src="${postulacion.logo}" alt="Logo" class="w-12 h-12 rounded-lg object-cover">` : ''}
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">${postulacion.titulo}</h3>
                                <p class="text-sm text-gray-500">${postulacion.empresa_nombre}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Postulado
                            </span>
                            <p class="text-xs text-gray-500 mt-1">
                                ${new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                    </div>
                    <p class="text-gray-700 text-sm leading-relaxed mb-4">${postulacion.descripcion}</p>
                    <div class="flex items-center space-x-4 text-sm text-gray-500">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 110-4 2 2 0 000 4z" clip-rule="evenodd" />
                            </svg>
                            ${postulacion.tipo || 'No especificado'}
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                            </svg>
                            ID: #${postulacion.llamado_id}
                        </span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900">No tienes postulaciones</h3>
                    <p class="mt-1 text-sm text-gray-500">Empieza postulándote a empleos que te interesen.</p>
                    <div class="mt-6">
                        <button onclick="mostrarEmpleos()" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Ver Empleos
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error al cargar postulaciones:', error);
        mostrarNotificacion('Error al cargar postulaciones', 'error');
    }
}
