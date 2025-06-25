window.addEventListener('load', () => {
    
    const clientsTable = document.getElementById('clientsTable');
    const uploadSummary = document.getElementById('uploadSummary');
    const qrContainer = document.getElementById('qrContainer');
    const whatsappStatus = document.getElementById('whatsappStatus');
    const clientSelection = document.getElementById('clientSelection');
    const sendStatus = document.getElementById('sendStatus');
    
    const uploadClientsBtn = document.getElementById('uploadClients');
    const addClientManualBtn = document.getElementById('addClientManual');
    const downloadClientsBtn = document.getElementById('downloadClients');
    const downloadTemplateBtn = document.getElementById('downloadTemplate');
    const disconnectWhatsAppBtn = document.getElementById('disconnectWhatsApp');
    const sendMessagesBtn = document.getElementById('sendMessages');
    const selectAllClientsCheckbox = document.getElementById('selectAllClients');

    const mainModal = new bootstrap.Modal(document.getElementById('mainModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');

    let clients = [];

    function showAlert(title, message) {
        modalTitle.textContent = title;
        modalBody.innerHTML = `<p>${message}</p>`;
        modalConfirmBtn.style.display = 'none';
        mainModal.show();
    }

    function showClientFormModal(clientData = null, callback) {
        const isEditing = clientData !== null;
        modalTitle.textContent = isEditing ? 'Editar Cliente' : 'Agregar Nuevo Cliente';
        
        modalBody.innerHTML = `
            <form id="clientForm">
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre (*)</label>
                    <input type="text" class="form-control" id="nombre" value="${clientData?.nombre || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="celular" class="form-label">Celular (*)</label>
                    <input type="text" class="form-control" id="celular" value="${clientData?.celular || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="tiponegocio" class="form-label">Tipo Negocio (*)</label>
                    <input type="text" class="form-control" id="tiponegocio" value="${clientData?.tiponegocio || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input type="text" class="form-control" id="direccion" value="${clientData?.direccion || ''}">
                </div>
                <div class="mb-3">
                    <label for="ciudad" class="form-label">Ciudad</label>
                    <input type="text" class="form-control" id="ciudad" value="${clientData?.ciudad || ''}">
                </div>
                <div class="mb-3">
                    <label for="telefono" class="form-label">Teléfono</label>
                    <input type="text" class="form-control" id="telefono" value="${clientData?.telefono || ''}">
                </div>
                <div class="mb-3">
                    <label for="redessociales" class="form-label">Redes Sociales</label>
                    <input type="text" class="form-control" id="redessociales" value="${clientData?.redessociales || ''}">
                </div>
                    <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" value="${clientData?.email || ''}">
                </div>
                <div class="mb-3">
                    <label for="contacto" class="form-label">Contacto</label>
                    <input type="text" class="form-control" id="contacto" value="${clientData?.contacto || ''}">
                </div>
            </form>
        `;
        modalConfirmBtn.style.display = 'block';
        modalConfirmBtn.textContent = isEditing ? 'Guardar Cambios' : 'Agregar Cliente';

        modalConfirmBtn.onclick = () => {
            const form = document.getElementById('clientForm');
            if (form.checkValidity()) {
                const newClientData = {
                    id: clientData?.id || (clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1),
                    transactionId: clientData?.transactionId || crypto.randomUUID(),
                    nombre: document.getElementById('nombre').value,
                    direccion: document.getElementById('direccion').value,
                    ciudad: document.getElementById('ciudad').value,
                    celular: document.getElementById('celular').value,
                    telefono: document.getElementById('telefono').value,
                    redessociales: document.getElementById('redessociales').value,
                    email: document.getElementById('email').value,
                    contacto: document.getElementById('contacto').value,
                    tiponegocio: document.getElementById('tiponegocio').value,
                };
                callback(newClientData);
                mainModal.hide();
            } else {
                form.reportValidity();
            }
        };

        mainModal.show();
    }


    // --- Lógica de Gestión de Clientes ---

    // Cargar clientes desde localStorage al iniciar
    function loadClients() {
        clients = JSON.parse(localStorage.getItem('clients')) || [];
        renderClientsTable();
        renderClientSelection();
    }

    // Guardar clientes en localStorage
    function saveClients() {
        localStorage.setItem('clients', JSON.stringify(clients));
        renderClientsTable();
        renderClientSelection();
    }

    // Renderizar la tabla de clientes
    function renderClientsTable() {
        clientsTable.innerHTML = '';
        if (clients.length === 0) {
            clientsTable.innerHTML = `<tr><td colspan="11" class="text-center">No hay clientes para mostrar.</td></tr>`;
            return;
        }

        clients.forEach(client => {
            const row = clientsTable.insertRow();
            row.innerHTML = `
                <td>${client.id || 'N/A'}</td>
                <td>${client.nombre || ''}</td>
                <td>${client.direccion || ''}</td>
                <td>${client.ciudad || ''}</td>
                <td>${client.celular || ''}</td>
                <td>${client.telefono || ''}</td>
                <td>${client.redessociales || ''}</td>
                <td>${client.email || ''}</td>
                <td>${client.contacto || ''}</td>
                <td>${client.tiponegocio || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-btn" data-id="${client.transactionId}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${client.transactionId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
    }
    
    // Manejar click en la tabla para delegación de eventos
    clientsTable.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const transactionId = editBtn.dataset.id;
            const clientToEdit = clients.find(c => c.transactionId === transactionId);
            showClientFormModal(clientToEdit, (updatedClient) => {
                const index = clients.findIndex(c => c.transactionId === transactionId);
                clients[index] = updatedClient;
                saveClients();
            });
        }
        
        const deleteBtn = e.target.closest('.delete-btn');
        if(deleteBtn) {
            const transactionId = deleteBtn.dataset.id;
            if(confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
                clients = clients.filter(c => c.transactionId !== transactionId);
                saveClients();
            }
        }
    });


    // Agregar cliente manualmente
    addClientManualBtn.addEventListener('click', () => {
        showClientFormModal(null, (newClient) => {
            clients.push(newClient);
            saveClients();
            displaySummaryMessage(`${newClient.nombre} fue agregado manualmente.`, 'success');
        });
    });


    // Cargar clientes desde archivo Excel
    uploadClientsBtn.addEventListener('click', () => {
        const fileInput = document.getElementById('clientFile');
        if (!fileInput.files.length) {
            showAlert('Error de carga', 'Por favor, selecciona un archivo Excel (.xlsx o .xls).');
            return;
        }
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if(rows.length < 2) {
                    displaySummaryMessage('El archivo está vacío o no tiene datos.', 'error');
                    return;
                }

                const headers = rows[0].map(h => String(h).trim().toLowerCase().replace(/\s/g, '').replace('í', 'i'));
                const requiredHeaders = ['nombre', 'celular', 'tiponegocio'];
                const missingHeaders = requiredHeaders.filter(rh => !headers.includes(rh));

                if(missingHeaders.length > 0) {
                    displaySummaryMessage(`El archivo no tiene las columnas obligatorias: ${missingHeaders.join(', ')}`, 'error');
                    return;
                }

                let successCount = 0;
                let errorMessages = [];
                const newClients = [];

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (row.length === 0 || row.every(cell => cell === null || cell === '')) continue; // Skip empty rows

                    const client = { transactionId: crypto.randomUUID() };
                    headers.forEach((header, index) => {
                        client[header] = row[index] ? String(row[index]).trim() : '';
                    });

                    if (!client.nombre || !client.celular || !client.tiponegocio) {
                        errorMessages.push(`Fila ${i + 1}: Faltan datos obligatorios (Nombre, Celular, Tipo Negocio).`);
                        continue;
                    }
                    newClients.push(client);
                    successCount++;
                }

                const maxId = clients.length > 0 ? Math.max(...clients.map(c => c.id || 0)) : 0;
                newClients.forEach((nc, index) => {
                    if(!nc.id) {
                        nc.id = maxId + index + 1;
                    }
                })
                
                clients.push(...newClients);
                saveClients();
                
                let summaryHtml = `<div class="status-message success alert alert-success alert-dismissible fade show" role="alert">
                                        ${successCount} clientes cargados correctamente.
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                                    </div>`;
                if (errorMessages.length > 0) {
                    summaryHtml += `<div class="status-message error alert alert-success alert-dismissible fade show" role="alert">
                                        ${errorMessages.join('<br>')}
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                                    </div>`;
                }
                uploadSummary.innerHTML = summaryHtml;
            
            } catch (error) {
                console.error('Error procesando el archivo Excel:', error);
                showAlert('Error de Archivo', 'No se pudo procesar el archivo. Asegúrate de que tenga el formato correcto.');
            }
        };
        reader.readAsArrayBuffer(file);
    });
    
    function displaySummaryMessage(message, type = 'success') {
            uploadSummary.innerHTML = `<div class="status-message ${type} alert alert-success alert-dismissible fade show" role="alert">
                                        ${message}
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                                    </div>`;

    }

    downloadClientsBtn.addEventListener('click', () => downloadClients());
    downloadTemplateBtn.addEventListener('click', () => downloadClients(true));


    function downloadClients(isTemplate) {

        if (clients.length === 0 && !isTemplate) {
            showAlert('Sin Clientes', 'No hay clientes para descargar.');
            return;
        }
        // Definir las cabeceras en el orden deseado
        const headers = ['ID', 'NOMBRE', 'DIRECCION', 'CIUDAD', 'CELULAR', 'TELEFONO', 'REDES SOCIALES', 'EMAIL', 'CONTACTO', 'TIPO NEGOCIO'];
        const clientKeys = ['id', 'nombre', 'direccion', 'ciudad', 'celular', 'telefono', 'redessociales', 'email', 'contacto', 'tiponegocio'];

        let csvContent = headers.join(',') + '\r\n';
        clients.forEach(client => {
            const row = clientKeys.map(key => {
                let field = client[key] || '';
                // Escapar comillas dobles y encerrar si contiene comas o saltos de línea
                field = String(field).replace(/"/g, '""');
                if (/[",\n]/.test(field)) {
                    field = `"${field}"`;
                }
                return field;
            });
            csvContent += row.join(',') + '\r\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const filenameDate = new Date().toISOString().split('T')[0];
        const filename = isTemplate ? 'plantilla-cargue-clientes.csv' : `clientes_${filenameDate}.csv`;
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }


    // --- Lógica de WhatsApp y WebSocket ---

    const ws = new WebSocket('ws://localhost:3000');
    const whatsappStatusLoader = document.getElementById('whatsappStatus-loader');

    const initWhatsAppBtn = document.createElement('button');
    initWhatsAppBtn.id = 'initWhatsApp';
    initWhatsAppBtn.className = 'btn btn-success mb-3';
    initWhatsAppBtn.innerHTML = '<i class="fas fa-play me-2"></i>Inicializar WhatsApp';
    // Insertar el botón antes del contenedor QR
    qrContainer.parentNode.insertBefore(initWhatsAppBtn, qrContainer);

    let whatsappInitialized = false;

    ws.onopen = () => {
        console.log('WebSocket conectado al servidor.');
        whatsappStatus.textContent = 'Conectado al servidor. Presiona "Inicializar WhatsApp" para comenzar.';
        whatsappStatusLoader.classList.remove('spinner-border');
    };


    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);

        switch (data.type) {
            case 'waiting_initialization':
                whatsappStatus.textContent = 'Esperando inicialización de WhatsApp...';
                initWhatsAppBtn.style.display = 'block';
                whatsappStatusLoader.classList.remove('spinner-border');
                break;
                
            case 'initializing':
                qrContainer.innerHTML = `<p id="whatsappStatus" class="text-center">Inicializando WhatsApp (Esto puede tardar unos minutos)...</p>
                    <div id="whatsappStatus-loader" class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>`;
                initWhatsAppBtn.style.display = 'none';
                whatsappInitialized = true;
                break;
                
            case 'already_initialized':
                whatsappStatus.textContent = 'WhatsApp ya está inicializando...';
                initWhatsAppBtn.style.display = 'none';
                whatsappStatusLoader.classList.add('spinner-border');
                break;
                
            case 'qr':
                qrContainer.innerHTML = '';
                new QRCode(qrContainer, {
                    text: data.qr,
                    width: 250,
                    height: 250,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                whatsappStatus.textContent = 'Escanea el código QR para conectar.';
                whatsappStatusLoader.classList.remove('spinner-border');
                break;
                
            case 'ready':
                qrContainer.innerHTML = '<div class="status-message success"><i class="fas fa-check-circle me-2"></i>¡Conectado a WhatsApp!</div>';
                whatsappStatus.textContent = 'WhatsApp conectado y listo para usar.';
                disconnectWhatsAppBtn.classList.remove('d-none');
                initWhatsAppBtn.style.display = 'none';
                whatsappStatusLoader.classList.remove('spinner-border');
                whatsappInitialized = true;
                break;
                
            case 'disconnected':
                qrContainer.innerHTML = `<div class="status-message error">Desconectado: ${data.reason || 'Sin motivo'}.</div>`;
                whatsappStatus.textContent = 'WhatsApp desconectado. Puedes reinicializar si es necesario.';
                disconnectWhatsAppBtn.classList.add('d-none');
                initWhatsAppBtn.style.display = 'block';
                whatsappStatusLoader.classList.remove('spinner-border');
                whatsappInitialized = false;
                break;
                
            case 'error':
                qrContainer.innerHTML = `<div class="status-message error">Error: ${data.message}</div>`;
                whatsappStatus.textContent = 'Ocurrió un error. Revisa la consola del servidor.';
                whatsappStatusLoader.classList.remove('spinner-border');
                initWhatsAppBtn.style.display = 'block';
                break;
                
            case 'message_status':
                const statusClass = data.success ? 'success' : 'error';
                sendStatus.innerHTML += `<div class="status-message ${statusClass} alert alert-success alert-dismissible fade show" role="alert">
                                        ${data.message}
                                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                                    </div>`;
                break;
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        whatsappStatus.textContent = 'Error de conexión. Asegúrate de que el servidor esté corriendo en el puerto 3000.';
        qrContainer.innerHTML = `<div class="status-message error">No se pudo conectar al servidor WebSocket.</div>`;
        whatsappStatusLoader.classList.remove('spinner-border');
    };

    ws.onclose = () => {
        console.log('WebSocket cerrado.');
        whatsappStatus.textContent = 'Conexión cerrada. El servidor puede haberse detenido.';
        whatsappStatusLoader.classList.remove('spinner-border');
        disconnectWhatsAppBtn.classList.add('d-none');
        initWhatsAppBtn.style.display = 'block';
    };

    initWhatsAppBtn.addEventListener('click', () => {
        if (ws.readyState === WebSocket.OPEN && !whatsappInitialized) {
            ws.send(JSON.stringify({ type: 'initialize_whatsapp' }));
        }
    });

    disconnectWhatsAppBtn.addEventListener('click', () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'disconnect' }));
            initWhatsAppBtn.style.display = 'block';
            whatsappInitialized = false;
            disconnectWhatsAppBtn.classList.add('d-none');
            qrContainer.innerHTML = `<p id="whatsappStatus" class="text-center">WhatsApp desconectado. Puedes reinicializar si es necesario.</p>
                    <div id="whatsappStatus-loader" class="" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>`;
        }
    });

    // --- Lógica de envío de Mensajes ---

    function renderClientSelection() {
        clientSelection.innerHTML = '';
        if(clients.length === 0) {
                clientSelection.innerHTML = '<p class="text-muted">No hay clientes para seleccionar.</p>';
                return;
        }
        clients.forEach(client => {
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input client-checkbox" type="checkbox" value="${client.transactionId}" id="client_${client.transactionId}">
                <label class="form-check-label" for="client_${client.transactionId}">
                    ${client.nombre} (${client.celular})
                </label>
            `;
            clientSelection.appendChild(div);
        });
    }

    selectAllClientsCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.client-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
        });
    });

    sendMessagesBtn.addEventListener('click', () => {
        const message = document.getElementById('messageText').value;
        if (!message.trim()) {
            showAlert('Mensaje Vacío', 'Por favor, escribe un mensaje para enviar.');
            return;
        }

        const selectedClientIds = Array.from(document.querySelectorAll('#clientSelection input:checked')).map(input => input.value);
        if (selectedClientIds.length === 0) {
            showAlert('Sin Selección', 'Debes seleccionar al menos un cliente.');
            return;
        }

        sendStatus.innerHTML = `<div class="status-message success alert alert-success alert-dismissible fade show" role="alert">
                                    Iniciando envío de ${selectedClientIds.length} mensajes
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
                                </div>`;
        
        selectedClientIds.forEach(transactionId => {
            const client = clients.find(c => c.transactionId === transactionId);
            if (client && ws.readyState === WebSocket.OPEN) {
                const personalizedMessage = message.replace(/{nombre}/g, client.nombre);

                ws.send(JSON.stringify({
                    type: 'send_message',
                    // formato de número para WhatsApp
                    phone: `57${client.celular.replace(/\s/g, '').replace('+', '')}`,
                    message: personalizedMessage,
                    name: client.nombre
                }));
            }
        });
    });

    loadClients();
});