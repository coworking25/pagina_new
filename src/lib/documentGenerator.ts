import { jsPDF } from 'jspdf';

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  category: 'contracts' | 'forms' | 'guides';
  content: {
    header?: string;
    sections: Array<{
      title: string;
      content?: string[];
      list?: string[];
    }>;
    footer?: string;
  };
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'contrato-arrendamiento',
    title: 'Contrato de Arrendamiento',
    description: 'Modelo de contrato estándar actualizado',
    type: 'PDF',
    category: 'contracts',
    content: {
      header: 'CONTRATO DE ARRENDAMIENTO DE VIVIENDA URBANA',
      sections: [
        {
          title: 'PARTES CONTRATANTES',
          content: [
            'Entre los suscritos, a saber: _________________ mayor de edad, identificado(a) con cédula de ciudadanía No. _________, en calidad de ARRENDADOR, y _________________ mayor de edad, identificado(a) con cédula de ciudadanía No. _________, en calidad de ARRENDATARIO, hemos convenido celebrar el presente contrato de arrendamiento de vivienda urbana.'
          ]
        },
        {
          title: 'OBJETO DEL CONTRATO',
          content: [
            'El ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble ubicado en la dirección: _________________',
            'El inmueble se encuentra en buen estado y se entrega con todos los servicios públicos conectados.'
          ]
        },
        {
          title: 'CANON DE ARRENDAMIENTO',
          content: [
            'El canon mensual de arrendamiento es de: $_________________ pesos colombianos.',
            'El pago se efectuará dentro de los primeros cinco (5) días de cada mes.',
            'El incumplimiento en el pago generará intereses de mora.'
          ]
        },
        {
          title: 'DURACIÓN DEL CONTRATO',
          content: [
            'El presente contrato tendrá una duración de _______ meses.',
            'Iniciará el día _______ y terminará el día _______.',
            'Podrá renovarse por mutuo acuerdo entre las partes.'
          ]
        },
        {
          title: 'OBLIGACIONES DEL ARRENDATARIO',
          list: [
            'Pagar el canon de arrendamiento en la fecha convenida',
            'Usar el inmueble conforme a su destinación',
            'Conservar el inmueble en buen estado',
            'Permitir las inspecciones necesarias',
            'Pagar los servicios públicos',
            'No subarrendar sin autorización escrita'
          ]
        },
        {
          title: 'OBLIGACIONES DEL ARRENDADOR',
          list: [
            'Entregar el inmueble en buen estado',
            'Mantener el inmueble en condiciones de habitabilidad',
            'Pagar el impuesto predial',
            'Realizar las reparaciones necesarias por deterioro normal'
          ]
        }
      ],
      footer: 'En constancia de lo anterior, firmamos en la ciudad de _______, a los _______ días del mes de _______ de _______.'
    }
  },
  {
    id: 'manual-convivencia',
    title: 'Manual de Convivencia',
    description: 'Normas y reglamentos del inmueble',
    type: 'PDF',
    category: 'guides',
    content: {
      header: 'MANUAL DE CONVIVENCIA RESIDENCIAL',
      sections: [
        {
          title: 'OBJETIVO',
          content: [
            'El presente manual tiene como objetivo establecer las normas de convivencia que deben observar todos los residentes del edificio/conjunto.',
            'Estas normas buscan garantizar la armonía, seguridad y bienestar de todos los habitantes.'
          ]
        },
        {
          title: 'HORARIOS',
          content: [
            'Portería: 24 horas',
            'Administración: Lunes a Viernes 8:00 AM - 5:00 PM',
            'Zonas comunes: 6:00 AM - 10:00 PM',
            'Silencio nocturno: 10:00 PM - 6:00 AM'
          ]
        },
        {
          title: 'USO DE ZONAS COMUNES',
          list: [
            'Mantener limpio después del uso',
            'Respetar los horarios establecidos',
            'No consumir bebidas alcohólicas',
            'Los menores deben estar acompañados',
            'Reportar cualquier daño inmediatamente'
          ]
        },
        {
          title: 'SEGURIDAD',
          list: [
            'Portar siempre la tarjeta de identificación',
            'Registrar visitantes en portería',
            'No facilitar códigos de acceso',
            'Reportar personas sospechosas',
            'Mantener cerradas las puertas de acceso'
          ]
        },
        {
          title: 'PROHIBICIONES',
          list: [
            'Hacer ruido excesivo',
            'Arrojar basura desde ventanas',
            'Fumar en áreas comunes',
            'Tener mascotas sin autorización',
            'Realizar modificaciones estructurales',
            'Ejercer actividades comerciales'
          ]
        }
      ]
    }
  },
  {
    id: 'inventario-entrega',
    title: 'Inventario de Entrega',
    description: 'Formato para inventario detallado',
    type: 'PDF',
    category: 'forms',
    content: {
      header: 'INVENTARIO DE ENTREGA DEL INMUEBLE',
      sections: [
        {
          title: 'DATOS DEL INMUEBLE',
          content: [
            'Dirección: _________________',
            'Tipo de inmueble: _________________',
            'Área: _______ m²',
            'Número de habitaciones: _______',
            'Número de baños: _______',
            'Parqueadero: Sí ___ No ___'
          ]
        },
        {
          title: 'ESTADO GENERAL',
          content: [
            'Pisos: _________________',
            'Paredes: _________________',
            'Techos: _________________',
            'Puertas: _________________',
            'Ventanas: _________________',
            'Instalaciones eléctricas: _________________'
          ]
        },
        {
          title: 'ELEMENTOS INCLUIDOS',
          list: [
            'Estufa: ___',
            'Nevera: ___',
            'Lavadora: ___',
            'Calentador: ___',
            'Aire acondicionado: ___',
            'Muebles: _______________'
          ]
        },
        {
          title: 'SERVICIOS PÚBLICOS',
          content: [
            'Energía - Lectura: _______',
            'Agua - Lectura: _______',
            'Gas - Lectura: _______',
            'Internet: Sí ___ No ___',
            'Cable TV: Sí ___ No ___'
          ]
        },
        {
          title: 'OBSERVACIONES',
          content: [
            '_________________________________',
            '_________________________________',
            '_________________________________',
            '_________________________________'
          ]
        }
      ],
      footer: 'Firmas:\nArrendador: _________________ Arrendatario: _________________\nFecha de entrega: _______'
    }
  },
  {
    id: 'formato-solicitud',
    title: 'Formato de Solicitud',
    description: 'Solicitud de arrendamiento',
    type: 'PDF',
    category: 'forms',
    content: {
      header: 'SOLICITUD DE ARRENDAMIENTO',
      sections: [
        {
          title: 'DATOS PERSONALES DEL SOLICITANTE',
          content: [
            'Nombre completo: _________________',
            'Cédula de ciudadanía: _________________',
            'Fecha de nacimiento: _________________',
            'Estado civil: _________________',
            'Teléfono: _________________',
            'Email: _________________',
            'Dirección actual: _________________'
          ]
        },
        {
          title: 'INFORMACIÓN LABORAL',
          content: [
            'Empresa: _________________',
            'Cargo: _________________',
            'Tiempo en la empresa: _________________',
            'Salario: $_________________',
            'Teléfono empresa: _________________',
            'Jefe inmediato: _________________'
          ]
        },
        {
          title: 'REFERENCIAS PERSONALES',
          content: [
            'Referencia 1:',
            'Nombre: _________________',
            'Teléfono: _________________',
            'Relación: _________________',
            '',
            'Referencia 2:',
            'Nombre: _________________',
            'Teléfono: _________________',
            'Relación: _________________'
          ]
        },
        {
          title: 'INFORMACIÓN DEL CODEUDOR',
          content: [
            'Nombre completo: _________________',
            'Cédula: _________________',
            'Teléfono: _________________',
            'Empresa: _________________',
            'Salario: $_________________',
            'Dirección: _________________'
          ]
        }
      ],
      footer: 'Declaro que la información suministrada es veraz.\nFirma: _________________ Fecha: _______'
    }
  },
  {
    id: 'guia-propietario',
    title: 'Guía del Propietario',
    description: 'Manual completo para propietarios',
    type: 'PDF',
    category: 'guides',
    content: {
      header: 'GUÍA PARA PROPIETARIOS - ARRENDAMIENTO DE INMUEBLES',
      sections: [
        {
          title: 'ANTES DE ARRENDAR',
          list: [
            'Verificar que el inmueble esté en perfectas condiciones',
            'Obtener certificado de tradición y libertad',
            'Actualizar el avalúo comercial',
            'Contratar seguros necesarios',
            'Definir el canon de arrendamiento',
            'Preparar la documentación requerida'
          ]
        },
        {
          title: 'DOCUMENTOS NECESARIOS',
          list: [
            'Escritura de propiedad registrada',
            'Certificado de tradición y libertad',
            'Paz y salvo de administración',
            'Recibos de servicios públicos al día',
            'Cédula de ciudadanía del propietario',
            'Autorización del cónyuge (si aplica)'
          ]
        },
        {
          title: 'SELECCIÓN DEL ARRENDATARIO',
          content: [
            'Es fundamental realizar un proceso riguroso de selección que incluya:',
            '- Verificación de ingresos mínimos (3 veces el canon)',
            '- Revisión de referencias laborales y comerciales',
            '- Evaluación del codeudor',
            '- Consulta en centrales de riesgo'
          ]
        },
        {
          title: 'ASPECTOS LEGALES',
          content: [
            'El contrato debe cumplir con la Ley 820 de 2003.',
            'La duración mínima es de un año.',
            'El incremento anual no puede superar el IPC.',
            'Se requiere preaviso de 30 días para terminación.'
          ]
        },
        {
          title: 'DERECHOS DEL PROPIETARIO',
          list: [
            'Recibir el canon puntualmente',
            'Inspeccionar el inmueble con previo aviso',
            'Terminar el contrato por incumplimiento',
            'Actualizar el canon anualmente',
            'Recuperar el inmueble al vencimiento'
          ]
        },
        {
          title: 'OBLIGACIONES DEL PROPIETARIO',
          list: [
            'Entregar el inmueble en buen estado',
            'Realizar reparaciones por deterioro normal',
            'Respetar la privacidad del arrendatario',
            'Pagar el impuesto predial',
            'Mantener las zonas comunes'
          ]
        }
      ]
    }
  },
  {
    id: 'referencias',
    title: 'Formulario de Referencias',
    description: 'Formato para verificación de referencias',
    type: 'PDF',
    category: 'forms',
    content: {
      header: 'VERIFICACIÓN DE REFERENCIAS',
      sections: [
        {
          title: 'DATOS DEL SOLICITANTE',
          content: [
            'Nombre: _________________',
            'Cédula: _________________',
            'Inmueble solicitado: _________________',
            'Fecha de solicitud: _________________'
          ]
        },
        {
          title: 'REFERENCIA LABORAL',
          content: [
            'Empresa: _________________',
            'Contacto: _________________',
            'Teléfono: _________________',
            'Cargo del solicitante: _________________',
            'Tiempo en la empresa: _________________',
            'Salario: $_________________',
            'Concepto: _________________'
          ]
        },
        {
          title: 'REFERENCIA COMERCIAL 1',
          content: [
            'Entidad: _________________',
            'Contacto: _________________',
            'Teléfono: _________________',
            'Tipo de relación: _________________',
            'Tiempo de relación: _________________',
            'Cumplimiento: _________________',
            'Concepto: _________________'
          ]
        },
        {
          title: 'REFERENCIA COMERCIAL 2',
          content: [
            'Entidad: _________________',
            'Contacto: _________________',
            'Teléfono: _________________',
            'Tipo de relación: _________________',
            'Tiempo de relación: _________________',
            'Cumplimiento: _________________',
            'Concepto: _________________'
          ]
        },
        {
          title: 'REFERENCIA PERSONAL',
          content: [
            'Nombre: _________________',
            'Teléfono: _________________',
            'Relación: _________________',
            'Tiempo de conocerlo: _________________',
            'Concepto: _________________'
          ]
        }
      ],
      footer: 'Verificado por: _________________ Fecha: _______ Firma: _________________'
    }
  }
];

export class DocumentGenerator {
  private static getTemplateById(templateId: string): DocumentTemplate | undefined {
    return documentTemplates.find(template => template.id === templateId);
  }

  static getTemplate(
    type: 'purchase_contract' | 'rental_contract' | 'lease_agreement' | 'property_guide' | 'financing_form' | 'inspection_checklist',
    data: { clientName: string; date: string; propertyAddress: string; amount: string }
  ): DocumentTemplate {
    let templateId: string;
    
    switch (type) {
      case 'purchase_contract':
        templateId = 'contrato-compraventa';
        break;
      case 'rental_contract':
        templateId = 'contrato-arrendamiento';
        break;
      case 'lease_agreement':
        templateId = 'acuerdo-arrendamiento';
        break;
      case 'property_guide':
        templateId = 'guia-propiedades';
        break;
      case 'financing_form':
        templateId = 'formulario-financiacion';
        break;
      case 'inspection_checklist':
        templateId = 'checklist-inspeccion';
        break;
      default:
        templateId = 'guia-propiedades';
    }
    
    const template = this.getTemplateById(templateId) || documentTemplates[0];
    
    // Personalizar la plantilla con los datos proporcionados
    const personalizedTemplate: DocumentTemplate = {
      id: template.id,
      title: template.title,
      description: template.description,
      type: template.type,
      category: template.category,
      content: {
        header: template.content.header?.replace('{clientName}', data.clientName)
          .replace('{date}', data.date)
          .replace('{propertyAddress}', data.propertyAddress)
          .replace('{amount}', data.amount),
        sections: template.content.sections.map(section => ({
          title: section.title,
          content: section.content?.map(paragraph => 
            paragraph.replace('{clientName}', data.clientName)
              .replace('{date}', data.date)
              .replace('{propertyAddress}', data.propertyAddress)
              .replace('{amount}', data.amount)
          ),
          list: section.list
        })),
        footer: template.content.footer
      }
    };
    
    return personalizedTemplate;
  }

  static generatePDF(template: DocumentTemplate): Blob {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    const margin = 20;
    const lineHeight = 7;

    // Header
    if (template.content.header) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(template.content.header, margin, yPosition, { maxWidth: 170 });
      yPosition += lineHeight * 2;
    }

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Sections
    template.content.sections.forEach((section) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Section title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Section content
      if (section.content) {
        section.content.forEach((paragraph) => {
          const lines = doc.splitTextToSize(paragraph, 170);
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
          yPosition += 2; // Extra space between paragraphs
        });
      }

      // Section list
      if (section.list) {
        section.list.forEach((item) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${item}`, margin + 5, yPosition);
          yPosition += lineHeight;
        });
      }

      yPosition += lineHeight; // Space between sections
    });

    // Footer
    if (template.content.footer) {
      // Add some space before footer
      yPosition += lineHeight;
      
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const footerLines = doc.splitTextToSize(template.content.footer, 170);
      footerLines.forEach((line: string) => {
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    }

    return doc.output('blob');
  }

  static downloadDocument(template: DocumentTemplate): void {
    try {
      const pdfBlob = this.generatePDF(template);
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Show success message
      alert(`✅ Documento "${template.title}" descargado exitosamente`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`❌ Error al generar el documento: ${error}`);
    }
  }

  static async previewDocument(template: DocumentTemplate): Promise<string> {
    try {
      const pdfBlob = this.generatePDF(template);
      return URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Error generating preview:', error);
      throw new Error('No se pudo generar la vista previa del documento');
    }
  }
}

export default DocumentGenerator;
