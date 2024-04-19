let IDFinal; // Declarar la variable fuera de la función
// Agregar evento de escucha de teclado al campo de entrada de texto
document.getElementById('municipioInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      buscarIdMunicipio(); // Llamar a la función de búsqueda si se presiona la tecla "Enter"
    }
  });

async function cargarMunicipios() {
  try {
      const response = await fetch('api.json');
      const municipiosData = await response.json();
      return municipiosData;
  } catch (error) {
      console.error('Error al cargar el archivo JSON:', error);
      return null;
  }
}

async function buscarIdMunicipio() {
    // Limpiar mensaje de error
    limpiarError();

    const nombreMunicipioBuscar = document.getElementById('municipioInput').value.trim().toLowerCase();
    const municipiosData = await cargarMunicipios();
    if (!municipiosData) {
        mostrarError('Error al cargar los datos de municipios. Por favor, inténtelo de nuevo más tarde.');
        return;
    }

    let municipioEncontrado = false;
    for (const municipio of municipiosData) {
      if (municipio.Municipio.toLowerCase().includes(nombreMunicipioBuscar)) {
          municipioEncontrado = true;
          IDFinal = municipio.IDMunicipio;
          console.log(`El ID del municipio '${municipio.Municipio}' es: ${municipio.IDMunicipio}`);
          cargarEstacionesPorMunicipio(IDFinal);
          // Mostrar nombre del municipio
          document.getElementById('municipioNombre').textContent = municipio.Municipio;
          break;
      }
    }

    if (!municipioEncontrado) {
        mostrarError(`No se encontró el municipio '${nombreMunicipioBuscar}'.`);
    }
}

function limpiarError() {
    const errorDiv = document.getElementById('errorDiv');
    errorDiv.textContent = '';
}

function limpiarNombre() {
  const municipioNombre2 = document.getElementById('municipioNombre');
  municipioNombre2.textContent = '';
}
  

// Función para mostrar errores
function mostrarError(mensaje) {
    const errorDiv = document.getElementById('errorDiv');
    errorDiv.textContent = mensaje;
    errorDiv.style.color = 'red';
}




async function cargarEstacionesPorMunicipio(IDMunicipio) {
    const enlace = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/FiltroMunicipio/' + IDMunicipio;
    fetch(enlace)
      .then(response => {
        if (!response.ok) {
          mostrarError('Error al obtener los datos. Por favor, inténtelo de nuevo más tarde.');
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const precioSeleccionado = document.getElementById('precioSelector').value;
        const estacionesConPrecio = data.ListaEESSPrecio.filter(estacion => estacion[precioSeleccionado] !== "" && !isNaN(parsePrecio(estacion[precioSeleccionado])));
        const estacionesOrdenadas = estacionesConPrecio.sort((a, b) => parsePrecio(a[precioSeleccionado]) - parsePrecio(b[precioSeleccionado]));
        mostrarEstaciones(estacionesOrdenadas);
      })
      .catch(error => console.error('Error al obtener los datos:', error));
}

  


function mostrarEstaciones(estaciones) {
    const tablaBody = document.getElementById('tabla-body');
    tablaBody.innerHTML = ''; // Limpiar contenido previo
    if(estaciones.length === 0){
      limpiarNombre();
      mostrarError(`No hay gasolineras en este municipio.`);
    }else{
      estaciones.forEach(estacion => {
        const fila = document.createElement('tr');
        // Reemplazar comas por puntos en latitud y longitud
        const latitud = estacion['Latitud'].replace(',', '.');
        const longitud = estacion['Longitud (WGS84)'].replace(',', '.');
        // Crear el enlace al mapa con la imagen
        const mapaLink = `https://www.google.com/maps?q=${latitud},${longitud}`;
        const mapaImagen = `<a href="${mapaLink}" target="_blank"><img src="logoMapa.png" alt="Mapa" width="50" height="50"></a>`;
        // Verificar y mostrar los precios
        const precios = ['Precio Gasolina 95 E5', 'Precio Gasolina 95 E5 Premium', 'Precio Gasoleo A', 'Precio Gasoleo Premium'];
        precios.forEach(precio => {
            if (!estacion[precio]) {
                estacion[precio] = '-'; // Si no hay precio, asignar un guion (-)
            }
        });
        fila.innerHTML = `
          <td>${estacion['Rótulo']}</td>
          <td>${estacion['Dirección']}</td>
          <td>${estacion['Precio Gasolina 95 E5']}</td>
          <td>${estacion['Precio Gasolina 95 E5 Premium']}</td>
          <td>${estacion['Precio Gasoleo A']}</td>
          <td>${estacion['Precio Gasoleo Premium']}</td>
          <td>${mapaImagen}</td>
        `;
        tablaBody.appendChild(fila);
      })
    }
    
    ;
    // Mostrar nota de la API
    document.getElementById('apiNote').textContent = 'Nota: La actualización de precios se realiza cada media hora, con los precios en vigor en ese momento.';
}



  
  
  
  
  

function parsePrecio(precioString) {
  return parseFloat(precioString.replace(',', '.').replace(/\./g, '').replace(/ /g, ''));
}









