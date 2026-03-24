import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoice = async (order, userInfo) => {
    // 1. Create wrapper div off-screen
    const invoiceWrapper = document.createElement('div');
    invoiceWrapper.style.position = 'absolute';
    invoiceWrapper.style.top = '-9999px';
    invoiceWrapper.style.left = '-9999px';
    invoiceWrapper.style.width = '800px';
    invoiceWrapper.style.backgroundColor = '#ffffff';
    invoiceWrapper.style.color = '#333333';
    invoiceWrapper.style.fontFamily = 'Georgia, serif';
    invoiceWrapper.style.padding = '40px';
    invoiceWrapper.style.zIndex = '-1';
    
    // 2. Build HTML content exactly how it should look in the PDF
    const date = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    invoiceWrapper.innerHTML = `
        <div style="border: 1px solid #111; padding: 40px; background: #fff;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                <div>
                    <h1 style="font-size: 32px; margin: 0; color: #111; letter-spacing: 2px;">SONISH</h1>
                    <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 4px; color: #999; margin-top: 5px;">Modern Elegance</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="font-size: 16px; margin: 0; color: #111; text-transform: uppercase;">Tax Invoice</h2>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">#${order._id}</p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Date: ${date}</p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                <div>
                    <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 10px;">Billed To:</h3>
                    <p style="font-size: 14px; margin: 0; font-weight: bold;">${userInfo.name || 'Customer'}</p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${userInfo.email}</p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${userInfo.phone || ''}</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 10px;">Shipped To:</h3>
                    <p style="font-size: 14px; margin: 0;">${order.shippingAddress?.address || ''}</p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}</p>
                    <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">${order.shippingAddress?.country || ''}</p>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr style="border-bottom: 2px solid #333;">
                        <th style="text-align: left; padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666;">Description</th>
                        <th style="text-align: center; padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666;">Qty</th>
                        <th style="text-align: right; padding: 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.orderItems.map(item => `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 15px 0; font-size: 14px;">${item.name} <br/><span style="font-size: 10px; color: #999;">Size: ${item.selectedSize || 'OS'}</span></td>
                            <td style="text-align: center; padding: 15px 0; font-size: 14px;">${item.qty}</td>
                            <td style="text-align: right; padding: 15px 0; font-size: 14px;">₹${(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end;">
                <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 12px; color: #666;">Subtotal:</span>
                        <span style="font-size: 14px;">₹${(order.itemsPrice || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 12px; color: #666;">Shipping:</span>
                        <span style="font-size: 14px;">₹${(order.shippingPrice || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="font-size: 12px; color: #666;">Tax / GST:</span>
                        <span style="font-size: 14px;">₹${(order.taxPrice || 0).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333;">
                        <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Total Paid:</span>
                        <span style="font-size: 18px; font-weight: bold;">₹${(order.totalPrice || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div style="margin-top: 60px; text-align: center; color: #999; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                <p>Payment Status: <strong style="color: ${order.isPaid ? '#22c55e' : '#ef4444'};">${order.isPaid ? 'PAID' : 'PENDING'}</strong> via Secure Gateway</p>
                <p style="margin-top: 10px;">Thank you for shopping with Sonish.</p>
                <p>This is a computer generated invoice and requires no physical signature.</p>
            </div>
        </div>
    `;

    document.body.appendChild(invoiceWrapper);

    try {
        const canvas = await html2canvas(invoiceWrapper, {
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        // Initialize jsPDF (portrait, millimeter, A4)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Sonish-Invoice-${order._id.slice(-8)}.pdf`);
    } catch (err) {
        console.error("Failed to generate PDF:", err);
        alert("Failed to generate invoice. Please try again.");
    } finally {
        document.body.removeChild(invoiceWrapper);
    }
};
