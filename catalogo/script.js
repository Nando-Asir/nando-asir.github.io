/**
 * Catálogo de Libros y Comics - Script principal
 * 
 * Este script implementa la lógica para mostrar y filtrar un catálogo
 * de libros y comics obtenidos desde data.json
 */

// Gestor del estado y datos de la aplicación
class CatalogoApp {
    constructor() {
      this.data = null;
      this.state = {
        categoriaActual: 'todos',
        paginaActual: 1,
        itemsPorPagina: 5,
        searchTerm: '',
      };
      
      this.elementos = {
        contenedor: document.getElementById('contenedor-libros'),
        filtros: document.getElementById('filtros'),
        paginacion: document.getElementById('pagination-container'),
        searchBar: null,
        selector: null,
      };
      
      this.init();
    }
    
    async init() {
      try {
        // Inicializar la UI mientras se cargan los datos
        this.mostrarCargando();
        
        // Cargar datos
        await this.cargarDatos();
        
        // Configurar UI
        this.configurarUI();
        
        // Mostrar datos iniciales
        this.actualizarVista();
      } catch (error) {
        this.mostrarError(error);
      }
    }
    
    mostrarCargando() {
      this.elementos.contenedor.innerHTML = '<div class="loading" role="status" aria-live="polite">Cargando datos...</div>';
    }
    
    async cargarDatos() {
      try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
          throw new Error(`Error al cargar los datos: ${response.status}`);
        }
        
        this.data = await response.json();
        
        // No necesitamos generar datos simulados ya que el JSON contiene publicacion y rating
        return this.data;
      } catch (error) {
        throw new Error(`Error de red: ${error.message}`);
      }
    }
    
    configurarUI() {
      // Crear selector de categorías
      const selectorContainer = this.crearSelector();
      this.elementos.filtros.prepend(selectorContainer);
      this.elementos.selector = selectorContainer.querySelector('#categoria-selector');
      
      // Configurar barra de búsqueda
      this.elementos.searchBar = document.getElementById('search-bar');
      
      // Crear datalist para autocompletado
      this.crearDatalist();
      
      // Configurar event listeners
      this.configurarEventListeners();
    }
    
    crearSelector() {
      const selectorContainer = document.createElement('div');
      selectorContainer.className = 'selector-container';
      
      const label = document.createElement('label');
      label.setAttribute('for', 'categoria-selector');
      label.textContent = 'Seleccionar categoría';
      label.id = 'categoria-label';
      
      const selector = document.createElement('select');
      selector.id = 'categoria-selector';
      selector.setAttribute('aria-labelledby', 'categoria-label');
      
      // Opción para mostrar todos
      const optionTodos = document.createElement('option');
      optionTodos.value = 'todos';
      optionTodos.textContent = 'Todos';
      selector.appendChild(optionTodos);
  
      // Añadir las categorías disponibles
      const categorias = Object.keys(this.data);
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = this.capitalizarPrimeraLetra(categoria);
        selector.appendChild(option);
      });
      
      selectorContainer.appendChild(label);
      selectorContainer.appendChild(selector);
  
      return selectorContainer;
    }
    
    crearDatalist() {
      // Eliminar datalist existente si hay uno
      const oldDatalist = document.getElementById('sugerencias');
      if (oldDatalist) {
        oldDatalist.remove();
      }
      
      const datalist = document.createElement('datalist');
      datalist.id = 'sugerencias';
      
      // Añadir opciones únicas para autocompletado
      const opciones = new Set();
      
      for (const categoria in this.data) {
        this.data[categoria].forEach(item => {
          if (item.titulo) opciones.add(item.titulo);
          if (item.autor) opciones.add(item.autor);
        });
      }
      
      opciones.forEach(texto => {
        const option = document.createElement('option');
        option.value = texto;
        datalist.appendChild(option);
      });
      
      document.body.appendChild(datalist);
      this.elementos.searchBar.setAttribute('list', 'sugerencias');
    }
    
    configurarEventListeners() {
      // Event listener para cambio de categoría
      this.elementos.selector.addEventListener('change', () => {
        this.cambiarCategoria(this.elementos.selector.value);
      });
      
      // Event listener para búsqueda
      this.elementos.searchBar.addEventListener('input', this.debounce(() => {
        this.cambiarTerminoBusqueda(this.elementos.searchBar.value);
      }, 300));
      
      // Event listener para navegación con teclado en la tabla
      document.addEventListener('keydown', (e) => this.manejarNavegacionTeclado(e));
    }
    
    cambiarCategoria(categoria) {
      this.state.categoriaActual = categoria;
      this.state.paginaActual = 1;
      this.actualizarVista();
    }
    
    cambiarTerminoBusqueda(termino) {
      this.state.searchTerm = termino.toLowerCase();
      this.state.paginaActual = 1;
      this.actualizarVista();
    }
    
    cambiarPagina(pagina) {
      this.state.paginaActual = pagina;
      this.actualizarVista();
      
      // Desplazarse al inicio de la tabla
      this.elementos.contenedor.scrollIntoView({ behavior: 'smooth' });
    }
    
    actualizarVista() {
      // Obtener datos filtrados según el estado actual
      const elementosFiltrados = this.obtenerElementosFiltrados();
      
      // Calcular paginación
      const totalPaginas = Math.ceil(elementosFiltrados.length / this.state.itemsPorPagina);
      const inicio = (this.state.paginaActual - 1) * this.state.itemsPorPagina;
      const fin = inicio + this.state.itemsPorPagina;
      const elementosPagina = elementosFiltrados.slice(inicio, fin);
      
      // Actualizar título según la categoría
      this.actualizarTitulo();
      
      // Renderizar tabla
      this.renderizarTabla(elementosPagina, elementosFiltrados.length === 0);
      
      // Actualizar paginación
      this.actualizarPaginacion(totalPaginas, this.state.paginaActual, elementosFiltrados.length);
    }
    
    obtenerElementosFiltrados() {
      let elementos = [];
      const { categoriaActual, searchTerm } = this.state;
      
      // Obtener elementos según la categoría
      if (categoriaActual === 'todos') {
        for (const cat in this.data) {
          elementos.push(...this.data[cat].map(el => ({ ...el, categoria: cat })));
        }
      } else {
        elementos = this.data[categoriaActual].map(el => ({ ...el, categoria: categoriaActual }));
      }
      
      // Filtrar por término de búsqueda si existe
      if (searchTerm) {
        elementos = elementos.filter(item => 
          (item.titulo?.toLowerCase().includes(searchTerm)) ||
          (item.autor?.toLowerCase().includes(searchTerm))
        );
      }
      
      return elementos;
    }
    
    actualizarTitulo() {
      const h1 = document.querySelector('h1');
      const categoria = this.state.categoriaActual;
      
      h1.textContent = categoria === 'todos' 
        ? 'Catálogo Completo' 
        : `Catálogo de ${this.capitalizarPrimeraLetra(categoria)}`;
    }
    
    renderizarTabla(elementos, sinResultados) {
      this.elementos.contenedor.innerHTML = '';
      
      if (sinResultados) {
        const noResultados = document.createElement('p');
        noResultados.textContent = 'No se encontraron resultados para la búsqueda.';
        noResultados.className = 'no-results';
        noResultados.setAttribute('role', 'alert');
        this.elementos.contenedor.appendChild(noResultados);
        return;
      }
      
      const tabla = this.crearTabla(elementos);
      this.elementos.contenedor.appendChild(tabla);
    }
    
    crearTabla(elementos) {
      const tabla = document.createElement('table');
      tabla.className = 'animate__animated animate__fadeIn';
      tabla.setAttribute('role', 'grid');
      tabla.setAttribute('aria-label', 'Listado de productos');
  
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th scope="col">Título</th>
          <th scope="col">Autor</th>
          <th scope="col">Fecha</th>
          <th scope="col">Rating</th>
          <th scope="col">Precio</th>
          <th scope="col">Categoría</th>
        </tr>
      `;
      tabla.appendChild(thead);
  
      const tbody = document.createElement('tbody');
      elementos.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.setAttribute('aria-rowindex', index + 1);
        tr.setAttribute('tabindex', '0'); // Hacer la fila focusable
        
        // Crear estrellas para el rating
        const estrellas = this.crearEstrellas(parseFloat(item.rating));
        
        tr.innerHTML = `
          <td>${this.valorSeguro(item.titulo, 'Sin título')}</td>
          <td>${this.valorSeguro(item.autor, 'Autor desconocido')}</td>
          <td>${this.valorSeguro(item.publicacion, 'Fecha desconocida')}</td>
          <td>${estrellas}</td>
          <td>${item.precio ? item.precio.toFixed(2) + ' €' : 'No disponible'}</td>
          <td>${this.valorSeguro(item.categoria, '')}</td>
        `;
        tbody.appendChild(tr);
      });
  
      tabla.appendChild(tbody);
      return tabla;
    }
    
    actualizarPaginacion(totalPaginas, paginaActiva, totalItems) {
      const paginationContainer = this.elementos.paginacion;
      paginationContainer.innerHTML = '';
      
      // Si no hay páginas, no mostrar paginación
      if (totalPaginas === 0) return;
      
      // Añadir información de paginación
      const paginaInfo = document.createElement('div');
      paginaInfo.className = 'pagination-info';
      paginaInfo.setAttribute('aria-live', 'polite');
      paginaInfo.textContent = `Página ${paginaActiva} de ${totalPaginas} (${totalItems} items)`;
      paginationContainer.appendChild(paginaInfo);
      
      // Contenedor de botones
      const botonesContainer = document.createElement('div');
      botonesContainer.className = 'botones-paginacion';
      paginationContainer.appendChild(botonesContainer);
  
      // Botón anterior
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Anterior';
      prevButton.className = 'page-button nav-button prev';
      prevButton.disabled = paginaActiva === 1;
      prevButton.setAttribute('aria-label', 'Ir a página anterior');
      prevButton.addEventListener('click', () => {
        if (paginaActiva > 1) {
          this.cambiarPagina(paginaActiva - 1);
        }
      });
      botonesContainer.appendChild(prevButton);
  
      // Crear array con números de página a mostrar
      const paginasAMostrar = this.calcularPaginasAMostrar(totalPaginas, paginaActiva);
      
      // Botones de página
      let ultimoNumero = null;
      
      paginasAMostrar.forEach(numeroOrEllipsis => {
        if (numeroOrEllipsis === '...') {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.className = 'pagination-ellipsis';
          ellipsis.setAttribute('aria-hidden', 'true');
          botonesContainer.appendChild(ellipsis);
        } else {
          const button = document.createElement('button');
          button.textContent = numeroOrEllipsis;
          button.className = 'page-button';
          button.setAttribute('aria-label', `Ir a página ${numeroOrEllipsis}`);
          
          if (numeroOrEllipsis === paginaActiva) {
            button.classList.add('active');
            button.setAttribute('aria-current', 'page');
          }
          
          button.addEventListener('click', () => {
            this.cambiarPagina(numeroOrEllipsis);
          });
          
          botonesContainer.appendChild(button);
          ultimoNumero = numeroOrEllipsis;
        }
      });
  
      // Botón siguiente
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Siguiente';
      nextButton.className = 'page-button nav-button next';
      nextButton.disabled = paginaActiva === totalPaginas || totalPaginas === 0;
      nextButton.setAttribute('aria-label', 'Ir a página siguiente');
      nextButton.addEventListener('click', () => {
        if (paginaActiva < totalPaginas) {
          this.cambiarPagina(paginaActiva + 1);
        }
      });
      botonesContainer.appendChild(nextButton);
    }
    
    calcularPaginasAMostrar(totalPaginas, paginaActiva) {
      const paginas = [];
      
      if (totalPaginas <= 7) {
        // Mostrar todas las páginas si son 7 o menos
        for (let i = 1; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Siempre mostrar la primera página
        paginas.push(1);
        
        // Lógica para páginas intermedias
        if (paginaActiva <= 3) {
          // Cerca del inicio: mostrar 1,2,3,4,5,...,n
          paginas.push(2, 3, 4, 5, '...', totalPaginas);
        } else if (paginaActiva >= totalPaginas - 2) {
          // Cerca del final: mostrar 1,...,n-4,n-3,n-2,n-1,n
          paginas.push('...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas);
        } else {
          // En medio: mostrar 1,...,p-1,p,p+1,...,n
          paginas.push('...', paginaActiva - 1, paginaActiva, paginaActiva + 1, '...', totalPaginas);
        }
      }
      
      return paginas;
    }
    
    crearEstrellas(rating) {
      const estrellaLlena = '★';
      const estrellaVacia = '☆';
      const estrellaMedia = '⯪';
      
      const entero = Math.floor(rating);
      const decimal = rating - entero;
      
      let estrellas = estrellaLlena.repeat(entero);
      let totalEstrellas = entero;
      
      // Añadir media estrella o estrella completa según el decimal
      if (decimal >= 0.3 && decimal < 0.7) {
        estrellas += estrellaMedia;
        totalEstrellas += 0.5;
      } else if (decimal >= 0.7) {
        estrellas += estrellaLlena;
        totalEstrellas += 1;
      }
      
      // Calcular cuántas estrellas vacías necesitamos para llegar a 5
      const estrellasRestantes = Math.round((5 - totalEstrellas) * 10) / 10;
      
      if (estrellasRestantes > 0) {
        estrellas += estrellaVacia.repeat(estrellasRestantes);
      }
      
      return `<span class="rating" title="${rating} de 5">${estrellas} <span class="rating-number">${rating}</span></span>`;
    }
    
    manejarNavegacionTeclado(e) {
      if (e.target.closest('tr') && e.target.closest('table')) {
        const tabla = e.target.closest('table');
        const filas = Array.from(tabla.querySelectorAll('tbody tr'));
        const filaActual = e.target.closest('tr');
        const indiceActual = filas.indexOf(filaActual);
        
        switch (e.key) {
          case 'ArrowDown':
            if (indiceActual < filas.length - 1) {
              e.preventDefault();
              filas[indiceActual + 1].focus();
            }
            break;
          case 'ArrowUp':
            if (indiceActual > 0) {
              e.preventDefault();
              filas[indiceActual - 1].focus();
            }
            break;
          case 'Home':
            if (filas.length > 0) {
              e.preventDefault();
              filas[0].focus();
            }
            break;
          case 'End':
            if (filas.length > 0) {
              e.preventDefault();
              filas[filas.length - 1].focus();
            }
            break;
        }
      }
    }
    
    mostrarError(error) {
      console.error('Error:', error);
      
      this.elementos.contenedor.innerHTML = '';
      
      const errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      errorMsg.setAttribute('role', 'alert');
      errorMsg.setAttribute('aria-live', 'assertive');
      errorMsg.textContent = `Error al cargar los datos: ${error.message}`;
      
      this.elementos.contenedor.appendChild(errorMsg);
    }
    
    // Utilidades
    valorSeguro(valor, valorPorDefecto) {
      return valor ?? valorPorDefecto;
    }
    
    capitalizarPrimeraLetra(texto) {
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
    
    // Función debounce para optimizar las búsquedas
    debounce(func, delay) {
      let timeoutId;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(context, args);
        }, delay);
      };
    }
  }
  
  // Inicializar la aplicación cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    new CatalogoApp();
  });