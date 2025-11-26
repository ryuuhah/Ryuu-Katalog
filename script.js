// Data produk dan paket untuk kalkulator dan keranjang
const allProducts = {
    // Paket Promo
    'Paket Sketsa Teknis': 12000,
    'Paket Visual Eksterior': 24000,
    'Paket Siap Bangun': 35000,
    'Paket All-in Design (Premium)': 45000,
    // Layanan Satuan
    'Gambar Kerja Desain 2D': 15000,
    'Desain 3D Eksterior': 15000,
    'Rencana Anggaran Biaya (RAB)': 20000,
    'Desain 3D Interior': 15000,
    // Layanan Menyesuaikan 
    'Desain 2D dan 3D Furnitur': 0,
    'Jasa Desain Web': 0
};

let cart = []; // Struktur: [{ name: 'Nama Produk', price_m2: 12000, m2: 0 }]

// Fungsi untuk format mata uang
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// =================================================================
// 1. Fungsi Floating Cart (Toggle)
// =================================================================

function toggleCart() {
    const cartElement = document.getElementById('floating-cart');
    cartElement.classList.toggle('open');
    
    // Nonaktifkan scroll body saat keranjang terbuka
    document.body.style.overflow = cartElement.classList.contains('open') ? 'hidden' : 'auto';
}

// =================================================================
// 2. Kalkulator Estimasi Biaya & Inisialisasi
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('product-select');
    for (const name in allProducts) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        option.setAttribute('data-price', allProducts[name]);
        select.appendChild(option);
    }
    renderCart(); 
});

function calculateEstimate() {
    const areaInput = document.getElementById('area').value;
    const selectedOption = document.getElementById('product-select').selectedOptions[0];
    
    const area = parseFloat(areaInput) || 0;
    const price_m2 = parseFloat(selectedOption.getAttribute('data-price')) || 0;

    let estimatedCost = area * price_m2;
    const estimatedCostElement = document.getElementById('estimated-cost');

    if (area > 0 && price_m2 > 0) {
        estimatedCostElement.textContent = formatRupiah(estimatedCost);
    } else if (price_m2 === 0 && area > 0) {
        estimatedCostElement.textContent = "Rp 0 (Harga Menyesuaikan, hubungi kami)";
    } else {
        estimatedCostElement.textContent = formatRupiah(0);
    }
}


// =================================================================
// 3. Keranjang Belanja (Dynamic)
// =================================================================

function addToCart(name, price_m2) {
    if (price_m2 === 0) {
        alert("Layanan ini memiliki harga yang menyesuaikan. Silakan gunakan tombol 'Konsultasi' di bawahnya untuk langsung menghubungi kami.");
        return;
    }
    
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        alert(`${name} sudah ada di keranjang. Anda bisa melanjutkan ke Floating Cart untuk checkout.`);
    } else {
        cart.push({ name: name, price_m2: price_m2, m2: 0 }); 
        renderCart();
        alert(`${name} berhasil ditambahkan ke keranjang. Klik ikon keranjang (emas) di pojok kanan bawah untuk checkout!`);
        if (!document.getElementById('floating-cart').classList.contains('open')) {
             toggleCart(); // Buka keranjang setelah menambah
        }
    }

    // Animasi: Memicu animasi timbul (pulse)
    const productElement = document.querySelector(`.package-item[data-name="${name}"]`) || document.querySelector(`.service-item[data-name="${name}"]`);
    if (productElement) {
        productElement.classList.add('pulse-animation');
        setTimeout(() => {
            productElement.classList.remove('pulse-animation');
        }, 500);
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateCartPrices();
}

function renderCart() {
    const cartItemsElement = document.getElementById('cart-items');
    cartItemsElement.innerHTML = '';
    
    const cartItemCountElement = document.getElementById('cart-item-count');
    cartItemCountElement.textContent = cart.length;

    if (cart.length === 0) {
        cartItemsElement.innerHTML = '<tr><td colspan="2" class="empty-cart">Keranjang Anda kosong.</td></tr>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('cart-total-price').textContent = formatRupiah(0);
        return;
    }

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name} <br><small>(${formatRupiah(item.price_m2)} / $m^2$)</small></td>
            <td><button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button></td>
        `;
        cartItemsElement.appendChild(row);
    });

    document.getElementById('checkout-btn').disabled = false;
    updateCartPrices();
}

function updateCartPrices() {
    const totalM2Input = document.getElementById('total-m2');
    const totalM2 = parseFloat(totalM2Input.value) || 0;
    let grandTotal = 0;

    if (totalM2 > 0) {
        cart.forEach(item => item.m2 = totalM2);
    } else {
        cart.forEach(item => item.m2 = 0);
    }
    
    cart.forEach(item => {
        const totalPrice = item.m2 * item.price_m2;
        grandTotal += totalPrice;
    });

    document.getElementById('cart-total-price').textContent = formatRupiah(grandTotal);
}


// =================================================================
// 4. Checkout WhatsApp
// =================================================================

function checkout() {
    if (cart.length === 0) {
        alert("Keranjang belanja Anda masih kosong.");
        return;
    }

    const totalM2 = parseFloat(document.getElementById('total-m2').value) || 0;
    if (totalM2 <= 0) {
        alert("Mohon masukkan total luas bangunan (m²) di Floating Cart untuk melanjutkan pemesanan.");
        document.getElementById('total-m2').focus();
        return;
    }

    let message = "Halo, saya ingin memesan layanan desain bangunan Anda.\n\n";
    message += `Total Luas Bangunan: ${totalM2} m2\n\n`;
    message += "Detail Pesanan:\n";
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.m2 * item.price_m2;
        grandTotal += itemTotal;
        message += `${index + 1}. ${item.name}\n`;
        message += `   Luas: ${item.m2} m2\n`;
        message += `   Harga/m2: ${formatRupiah(item.price_m2)}\n`;
        message += `   Total: ${formatRupiah(itemTotal)}\n`;
    });

    message += "\n-------------------------------------\n";
    message += `Total Biaya Estimasi: ${formatRupiah(grandTotal)}\n`;
    message += "-------------------------------------\n";
    message += "*Catatan: Estimasi biaya ini belum mengikat dan akan dikonfirmasi ulang berdasarkan detail proyek Anda.\n\n";
    message += "Mohon konfirmasi pesanan ini. Terima kasih.";

    const whatsappURL = `https://wa.me/6285117788355?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
}
