import { jsPDF } from 'jspdf';
import logo from '../../assets/calcemasLogo.jpg';

// Configuración de tamaño de página (en mm)
// Ancho: 80mm
// Alto: Ajusta este valor para cambiar el largo de la hoja
const PAGE_WIDTH = 80;  // mm
const PAGE_HEIGHT = 150; // mm - Ajusta este valor para hacer el recibo más corto o largo

/**
 * Genera un PDF de recibo de cobro usando jsPDF
 * @param {Object} data - Datos del recibo
 * @returns {jsPDF} - Instancia del PDF generado
 */
const generateReciboPDF = (data) => {
  // Crear documento PDF con tamaño personalizado
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [PAGE_WIDTH, PAGE_HEIGHT]
  });

  let yPosition = 5; // Posición vertical inicial

  // Cargar y agregar logo
  const img = new Image();
  img.src = logo;
  doc.addImage(img, 'JPEG', 5, yPosition, 25, 18);
  yPosition += 20;

  // Título
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Recibo de Dinero', PAGE_WIDTH / 2, yPosition, { align: 'center' });
  yPosition += 6;

  // Número de recibo
  doc.setFontSize(10);
  doc.text(`Nro.Recibo: ${data.numeroRecibo}`, 5, yPosition);
  yPosition += 5;

  // Fecha
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.fecha, 5, yPosition);
  yPosition += 6;

  // Caja de monto
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.rect(5, yPosition, PAGE_WIDTH - 10, 8);
  doc.text(`Total Cobrado: Gs.${data.monto.toLocaleString()}`, PAGE_WIDTH / 2, yPosition + 5, { align: 'center' });
  yPosition += 13;

  // Descripción
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const descripcionLines = doc.splitTextToSize(data.descripcion, PAGE_WIDTH - 10);
  doc.text(descripcionLines, 5, yPosition);
  yPosition += descripcionLines.length * 4 + 3;

  // Saldos
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Saldo Factura: ${data.saldoFactura.toLocaleString()}`, 5, yPosition);
  yPosition += 4;
  doc.text(`Saldo Total: ${data.saldoTotal.toLocaleString()}`, 5, yPosition);
  yPosition += 6;

  // Cargado por
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Cargado por:', 5, yPosition);
  yPosition += 3;
  doc.text(data.cargadoPor, 5, yPosition);
  yPosition += 6;

  // Agradecimiento
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('¡Gracias por su pago!', PAGE_WIDTH / 2, yPosition, { align: 'center' });

  // Datos del Cliente (esquina inferior izquierda)
  const bottomY = PAGE_HEIGHT - 12;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Código: ${data.codigoCliente}`, 5, bottomY);
  doc.text(`Cliente: ${data.nombreCliente}`, 5, bottomY + 3);
  doc.text(`Teléfono: ${data.telefonoCliente}`, 5, bottomY + 6);

  return doc;
};

/**
 * Genera y descarga el PDF del recibo
 * @param {Object} data - Datos del recibo
 * @param {string} filename - Nombre del archivo (opcional)
 */
export const downloadReciboPDF = (data, filename = 'recibo.pdf') => {
  const doc = generateReciboPDF(data);
  doc.save(filename);
};

/**
 * Genera el PDF como Blob para enviar por email
 * @param {Object} data - Datos del recibo
 * @returns {Blob} - Blob del PDF
 */
export const getReciboPDFBlob = (data) => {
  const doc = generateReciboPDF(data);
  return doc.output('blob');
};

export default generateReciboPDF;
