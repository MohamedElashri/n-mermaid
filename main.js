// Theme management
function setTheme(isDark) {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        // Show sun icon in dark mode
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        // Show moon icon in light mode
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }
    
    // Re-render diagram with new theme
    updateDiagram();
}

function toggleTheme() {
    const isDark = !document.documentElement.classList.contains('dark');
    setTheme(isDark);
}

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }
    
    // Initialize mermaid
    mermaid.initialize({
        startOnLoad: true,
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
        securityLevel: 'loose'
    });
    
    // Initial diagram render
    updateDiagram();
});

// Update diagram when theme changes
function updateDiagram() {
    const input = document.getElementById('mermaidInput');
    const output = document.getElementById('mermaidOutput');
    
    try {
        // Clear previous diagram
        output.innerHTML = '';
        
        // Set theme based on current mode
        mermaid.initialize({
            startOnLoad: true,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
            securityLevel: 'loose'
        });
        
        // Render new diagram
        mermaid.render('mermaid-diagram', input.value)
            .then(({ svg }) => {
                output.innerHTML = svg;
                const svgElement = output.querySelector('svg');
                if (svgElement) {
                    // Set initial viewBox if not present
                    if (!svgElement.getAttribute('viewBox')) {
                        const bbox = svgElement.getBBox();
                        svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                    }
                }
            })
            .catch(error => {
                output.innerHTML = `<div class="text-red-500 dark:text-red-400">Error rendering diagram: ${error.message}</div>`;
            });
    } catch (error) {
        output.innerHTML = `<div class="text-red-500 dark:text-red-400">Error: ${error.message}</div>`;
    }
}

// Zoom management
let currentZoom = 100;
const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;

function updateZoom() {
    const output = document.getElementById('mermaidOutput');
    const zoomLevel = document.getElementById('zoomLevel');
    
    output.style.transform = `scale(${currentZoom / 100})`;
    zoomLevel.textContent = `${currentZoom}%`;
}

function zoomIn() {
    if (currentZoom < MAX_ZOOM) {
        currentZoom += ZOOM_STEP;
        updateZoom();
    }
}

function zoomOut() {
    if (currentZoom > MIN_ZOOM) {
        currentZoom -= ZOOM_STEP;
        updateZoom();
    }
}

// Export settings
const exportSettings = {
    scale: 2,
    margin: 10, // mm
    maxSize: 8000, // max dimension in pixels
    showLoading: true
};

// Function to show loading indicator
function showLoading(show) {
    const loadingEl = document.getElementById('exportLoading');
    if (show) {
        if (!loadingEl) {
            const loading = document.createElement('div');
            loading.id = 'exportLoading';
            loading.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow';
            loading.textContent = 'Exporting...';
            document.body.appendChild(loading);
        }
    } else if (loadingEl) {
        loadingEl.remove();
    }
}

// Function to get the Mermaid SVG element
function getMermaidSVG() {
    const output = document.getElementById('mermaidOutput');
    if (!output) throw new Error('Output element not found');
    
    const svg = output.querySelector('svg');
    if (!svg) throw new Error('SVG element not found');
    
    // Ensure SVG has proper viewBox
    if (!svg.getAttribute('viewBox')) {
        const bbox = svg.getBBox();
        svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    }
    return svg;
}

// Function to temporarily switch theme for export
async function withLightTheme(callback) {
    const wasDark = document.documentElement.classList.contains('dark');
    if (wasDark) {
        // Temporarily switch to light theme
        document.documentElement.classList.remove('dark');
        // Re-render the diagram with light theme
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            securityLevel: 'loose'
        });
        await updateDiagram();
        // Wait for the diagram to re-render
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    try {
        return await callback();
    } finally {
        if (wasDark) {
            // Switch back to dark theme
            document.documentElement.classList.add('dark');
            mermaid.initialize({
                startOnLoad: true,
                theme: 'dark',
                securityLevel: 'loose'
            });
            await updateDiagram();
        }
    }
}

// Function to export as SVG
async function exportSVG() {
    try {
        await withLightTheme(async () => {
            const svgElement = getMermaidSVG();
            
            // Clone the SVG and prepare it
            const svgClone = svgElement.cloneNode(true);
            svgClone.style.backgroundColor = '#ffffff';
            
            // Ensure viewBox is set
            if (!svgClone.getAttribute('viewBox')) {
                const bbox = svgElement.getBBox();
                svgClone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
            }
            
            // Convert to string
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgClone);
            
            // Create download link
            const link = document.createElement('a');
            link.download = 'mermaid-diagram.svg';
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        });
    } catch (error) {
        alert('Error exporting SVG: ' + error.message);
    }
}

// Function to export as PNG
async function exportPNG() {
    if (exportSettings.showLoading) showLoading(true);
    try {
        await withLightTheme(async () => {
            const svgElement = getMermaidSVG();
            const bbox = svgElement.getBBox();
            
            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = `${bbox.width + (bbox.x * 2)}px`;
            container.style.height = `${bbox.height + (bbox.y * 2)}px`;
            container.style.backgroundColor = '#ffffff';
            container.style.zIndex = '-1000';
            container.style.overflow = 'visible';
            
            // Clone the SVG and prepare it for export
            const svgClone = svgElement.cloneNode(true);
            svgClone.style.backgroundColor = '#ffffff';
            svgClone.style.width = '100%';
            svgClone.style.height = '100%';
            svgClone.style.overflow = 'visible';
            container.appendChild(svgClone);
            
            document.body.appendChild(container);
            
            // Wait a bit for the SVG to be properly rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: exportSettings.scale,
                logging: false,
                useCORS: true,
                allowTaint: false,
                foreignObjectRendering: true,
                letterRendering: true,
                width: bbox.width + (bbox.x * 2),
                height: bbox.height + (bbox.y * 2)
            });
            
            // Cleanup
            document.body.removeChild(container);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'mermaid-diagram.png';
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/png', 1.0);
        });
    } catch (error) {
        alert('Error exporting PNG: ' + error.message);
    } finally {
        if (exportSettings.showLoading) showLoading(false);
    }
}

// Function to export as PDF
async function exportPDF() {
    if (exportSettings.showLoading) showLoading(true);
    try {
        await withLightTheme(async () => {
            const svgElement = getMermaidSVG();
            const bbox = svgElement.getBBox();
            
            // Create a temporary container
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = `${bbox.width + (bbox.x * 2)}px`;
            container.style.height = `${bbox.height + (bbox.y * 2)}px`;
            container.style.backgroundColor = '#ffffff';
            container.style.zIndex = '-1000';
            container.style.overflow = 'visible';
            
            // Clone the SVG and prepare it for export
            const svgClone = svgElement.cloneNode(true);
            svgClone.style.backgroundColor = '#ffffff';
            svgClone.style.width = '100%';
            svgClone.style.height = '100%';
            svgClone.style.overflow = 'visible';
            container.appendChild(svgClone);
            
            document.body.appendChild(container);
            
            // Wait a bit for the SVG to be properly rendered
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const canvas = await html2canvas(container, {
                backgroundColor: '#ffffff',
                scale: exportSettings.scale,
                logging: false,
                useCORS: true,
                allowTaint: false,
                foreignObjectRendering: true,
                letterRendering: true
            });
            
            // Cleanup
            document.body.removeChild(container);
            
            // Convert to blob and create PDF
            canvas.toBlob(async (blob) => {
                const imgUrl = URL.createObjectURL(blob);
                const { jsPDF } = window.jspdf;
                
                // Calculate PDF dimensions
                const pdfWidth = (bbox.width / exportSettings.scale) * 0.264583; // convert px to mm
                const pdfHeight = (bbox.height / exportSettings.scale) * 0.264583;
                
                // Create PDF with custom dimensions plus margins
                const pdf = new jsPDF({
                    orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: [pdfWidth + (exportSettings.margin * 2), pdfHeight + (exportSettings.margin * 2)],
                    compress: true
                });
                
                // Add image with margins
                pdf.addImage(imgUrl, 'PNG', exportSettings.margin, exportSettings.margin, pdfWidth, pdfHeight, undefined, 'FAST');
                pdf.save('mermaid-diagram.pdf');
                URL.revokeObjectURL(imgUrl);
            }, 'image/png', 1.0);
        });
    } catch (error) {
        alert('Error exporting PDF: ' + error.message);
    } finally {
        if (exportSettings.showLoading) showLoading(false);
    }
}

// Theme toggle button handler
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
