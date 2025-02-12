# Mermaid Diagram Viewer

A simple, client-side Mermaid diagram viewer with export capabilities. This web application allows you to create, preview, and export Mermaid diagrams to PNG and PDF formats.

## Features

- Live preview of Mermaid diagrams
- Export diagrams to PNG
- Export diagrams to PDF
- Minimal, clean interface using Tailwind CSS
- Completely client-side (no server required)

## Usage

A hosted version of the application is available at [https://melashri.net/n-mermaid](https://melashri.net/n-mermaid).

To use the application locally, follow these steps:

1. Clone the repository: `git clone https://github.com/MohamedElashri/n-mermaid.git`
2. Open the `index.html` file in your web browser
3. Enter your Mermaid diagram code in the left panel
4. Click "Update Diagram" to see the preview
5. Use the export buttons to save your diagram as PNG or PDF

## Dependencies

The application uses the following CDN-hosted libraries:

- Mermaid.js (v10.8.0) - For diagram rendering
- Tailwind CSS - For styling
- html2canvas (v1.4.1) - For PNG export
- jsPDF (v2.5.1) - For PDF export

No installation is required as all dependencies are loaded via CDN.

## Contributing

If you find any bugs or have suggestions for improvement, please open an issue or a pull request on the [GitHub repository](https://github.com/MohamedElashri/n-mermaid).

## License

This project is released under the [MIT License](https://choosealicense.com/licenses/mit/).