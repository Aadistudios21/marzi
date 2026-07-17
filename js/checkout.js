let checkoutCart = JSON.parse(localStorage.getItem('marzi_cart')) || [];
let finalTotalAmount = 0;
// Replace this URL with your published Google Apps Script Web App URL (Step 7)
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'; 

function formatMoney(amount) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount); }

function renderCheckout() {
    const itemsContainer = document.getElementById('checkout-items');
    let subtotal = 0;
    
    checkoutCart.forEach(item => {
        subtotal += item.cartPrice * item.quantity;
        itemsContainer.innerHTML += `
            <div class="summary-row" style="align-items:center;">
                <div style="font-size: 0.9rem;">
                    <strong>${item.name}</strong> x ${item.quantity}<br>
                    <small style="color: gray;">SKU: ${item.sku}</small>
                </div>
                <div>${formatMoney(item.cartPrice * item.quantity)}</div>
            </div>
        `;
    });

    const gst = subtotal * 0.03; // Jewelry GST in India is 3%
    finalTotalAmount = subtotal + gst;

    document.getElementById('sum-subtotal').innerText = formatMoney(subtotal);
    document.getElementById('sum-gst').innerText = formatMoney(gst);
    document.getElementById('sum-total').innerText = formatMoney(finalTotalAmount);
}

document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if(checkoutCart.length === 0) { alert("Cart is empty!"); return; }
    
    const upiId = "ektabhalerao29@ybl";
    const name = "MarziJewelry";
    // Construct standard UPI deep link string
    const upiString = `upi://pay?pa=${upiId}&pn=${name}&cu=INR&am=${finalTotalAmount.toFixed(2)}`;
    
    // Generate QR using public API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
    
    document.getElementById('qr-code').src = qrUrl;
    document.getElementById('checkout-form').style.display = 'none';
    document.getElementById('qr-container').style.display = 'block';
});

function confirmOrder() {
    const orderData = {
        orderId: 'MZ-' + Date.now().toString().slice(-6),
        name: document.getElementById('c_name').value,
        email: document.getElementById('c_email').value,
        phone: document.getElementById('c_phone').value,
        address: `${document.getElementById('c_address').value}, ${document.getElementById('c_city') || ''}, ${document.getElementById('c_state').value} - ${document.getElementById('c_pin').value}`,
        total: finalTotalAmount,
        date: new Date().toLocaleString(),
        items: JSON.stringify(checkoutCart.map(i => `${i.name} (x${i.quantity})`))
    };

    // Send to Google Sheets Backend
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    }).then(() => {
        localStorage.removeItem('marzi_cart');
        alert(`Payment Confirmed! Your Order ID is ${orderData.orderId}. You will receive an invoice via email shortly.`);
        window.location.href = 'index.html';
    }).catch(err => {
        alert("Order placed, but there was an issue logging it. Please contact support with screenshot of payment.");
    });
}

// Init
if(document.getElementById('checkout-items')) renderCheckout();