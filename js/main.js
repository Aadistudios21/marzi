// Cart State Management
let cart = JSON.parse(localStorage.getItem('marzi_cart')) || [];

function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

// Render Products on Homepage
function renderProducts() {
    const container = document.getElementById('product-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Render first 4 products for homepage
    const displayProducts = products.slice(0, 4);
    
    displayProducts.forEach(product => {
        let finalPrice = product.price;
        if(product.discount > 0) {
            finalPrice = product.price - (product.price * (product.discount / 100));
        }

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${product.discount > 0 ? `<div class="discount-badge">${product.discount}% OFF</div>` : ''}
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">
                ${formatINR(finalPrice)} 
                ${product.discount > 0 ? `<span style="text-decoration:line-through; color:gray; font-size:0.9rem;">${formatINR(product.price)}</span>` : ''}
            </p>
            <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">Add to Bag</button>
        `;
        container.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    let finalPrice = product.price - (product.price * (product.discount / 100));
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, cartPrice: finalPrice });
    }
    
    saveCart();
    updateCartCount();
    alert(`${product.name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('marzi_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if(countSpan) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.textContent = totalItems;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
});