import { useConfigStore } from "../stores/configStore"
import { formatCurrency } from "../lib/formatters"

export const ticketService = {
  // Generar datos del ticket
  generateTicketData: (saleData) => {
    const { companyInfo, systemConfig } = useConfigStore.getState()

    return {
      // Información de la empresa
      company: {
        name: companyInfo.name,
        address: companyInfo.address,
        phone: companyInfo.phone,
        email: companyInfo.email,
        cuit: companyInfo.cuit,
        logo: companyInfo.logo,
      },

      // Información de la venta
      sale: {
        id: saleData.id,
        date: new Date(saleData.created_at).toLocaleDateString("es-AR"),
        time: new Date(saleData.created_at).toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        cashier: saleData.cashier_name || "Sistema",
        customer: saleData.customer_name || "Consumidor Final",
        paymentMethod: ticketService.getPaymentMethodName(saleData.payment_method),
        paymentMethods: saleData.payment_methods || [],
      },

      // Items de la venta
      items: saleData.items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.subtotal,
        unitType: item.product_unit_type || "unidades",
      })),

      // Totales
      totals: {
        subtotal: saleData.subtotal,
        discount: saleData.discount || 0,
        tax: saleData.tax || 0,
        total: saleData.total,
      },

      // Configuración del sistema
      config: {
        currency: systemConfig.currency,
        decimalPlaces: systemConfig.decimalPlaces,
      },
    }
  },

  // Obtener nombre del método de pago
  getPaymentMethodName: (method) => {
    const methods = {
      efectivo: "Efectivo",
      tarjeta_credito: "Tarjeta de Crédito",
      transferencia: "Transferencia",
      cuenta_corriente: "Cuenta Corriente",
      multiple: "Múltiples Métodos",
    }
    return methods[method] || method
  },

  printThermalTicket: async (ticketData) => {
    try {
      // Crear contenido del ticket para impresión térmica
      const ticketContent = ticketService.generateThermalTicketContent(ticketData)

      // Crear ventana de impresión
      const printWindow = window.open("", "_blank", "width=300,height=600")

      if (!printWindow) {
        throw new Error("No se pudo abrir la ventana de impresión. Verifique que no esté bloqueada por el navegador.")
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ticket de Venta #${ticketData.sale.id}</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 5mm;
              width: 70mm;
              color: #000;
              background: #fff;
            }
            
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 5px;
            }
            
            .company-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 2px;
            }
            
            .company-info {
              font-size: 10px;
              line-height: 1.1;
            }
            
            .sale-info {
              margin: 5px 0;
              font-size: 10px;
            }
            
            .items {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 5px 0;
              margin: 5px 0;
            }
            
            .item {
              margin-bottom: 2px;
            }
            
            .item-name {
              font-weight: bold;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
            }
            
            .totals {
              margin-top: 5px;
            }
            
            .total-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 1px;
            }
            
            .total-final {
              font-weight: bold;
              font-size: 13px;
              border-top: 1px solid #000;
              padding-top: 2px;
              margin-top: 3px;
            }
            
            .footer {
              text-align: center;
              margin-top: 10px;
              font-size: 10px;
              border-top: 1px dashed #000;
              padding-top: 5px;
            }
            
            .no-print {
              display: none;
            }
            
            @media screen {
              body {
                max-width: 300px;
                margin: 20px auto;
                border: 1px solid #ccc;
                padding: 20px;
              }
              
              .no-print {
                display: block;
                text-align: center;
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          ${ticketContent}
          <div class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; margin-right: 10px;">
              Imprimir
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px;">
              Cerrar
            </button>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()

      // Auto-imprimir después de cargar
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }

      return { success: true }
    } catch (error) {
      console.error("Error al imprimir ticket:", error)
      throw error
    }
  },

  // Generar contenido HTML del ticket térmico
  generateThermalTicketContent: (ticketData) => {
    const { company, sale, items, totals } = ticketData

    return `
      <div class="header">
        <div class="company-name">${company.name}</div>
        <div class="company-info">
          ${company.address}<br>
          ${company.phone}<br>
          ${company.email}<br>
          ${company.cuit ? `CUIT: ${company.cuit}` : ""}
        </div>
      </div>
      
      <div class="sale-info">
        <div><strong>Ticket #${sale.id}</strong></div>
        <div>Fecha: ${sale.date} ${sale.time}</div>
        <div>Cajero: ${sale.cashier}</div>
        <div>Cliente: ${sale.customer}</div>
        <div>Pago: ${sale.paymentMethod}</div>
      </div>
      
      <div class="items">
        ${items
          .map(
            (item) => `
          <div class="item">
            <div class="item-name">${item.name}</div>
            <div class="item-details">
              <span>${item.quantity} ${ticketService.getUnitLabel(item.unitType)} x ${formatCurrency(item.unitPrice)}</span>
              <span>${formatCurrency(item.total)}</span>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>${formatCurrency(totals.subtotal)}</span>
        </div>
        ${
          totals.discount > 0
            ? `
          <div class="total-line">
            <span>Descuento:</span>
            <span>-${formatCurrency(totals.discount)}</span>
          </div>
        `
            : ""
        }
        ${
          totals.tax > 0
            ? `
          <div class="total-line">
            <span>Impuestos:</span>
            <span>${formatCurrency(totals.tax)}</span>
          </div>
        `
            : ""
        }
        <div class="total-line total-final">
          <span>TOTAL:</span>
          <span>${formatCurrency(totals.total)}</span>
        </div>
      </div>
      
      <div class="footer">
        ¡Gracias por su compra!<br>
        ${new Date().toLocaleString("es-AR")}
      </div>
    `
  },

  // Obtener etiqueta de unidad
  getUnitLabel: (unitType) => {
    const labels = {
      unidades: "un",
      kg: "kg",
      litros: "lt",
      metros: "m",
    }
    return labels[unitType] || "un"
  },
}
