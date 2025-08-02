// Store loaded products globally
let allProducts = [];
let allCollections = new Set();

// Load products
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    data.forEach(p => allCollections.add(p.collection));
    updateCollectionFilter();
    renderProducts(data);
  });

// Load static pages
fetch('pages.json')
  .then(res => res.json())
  .then(pages => {
    document.querySelectorAll('.page-url').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const key = e.target.getAttribute('data-page');
        if (pages[key]) {
          document.getElementById('product-container').innerHTML = '';
          document.getElementById('static-page').innerHTML = `
            <h3 class='mb-3'>${pages[key].title}</h3>
            ${pages[key].content}
          `;
        }
      });
    });
  });

// Update collection filter dynamically
function updateCollectionFilter() {
  const select = document.getElementById('collectionFilter');
  allCollections.forEach(col => {
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    select.appendChild(option);
  });
}

// Render products based on filter
function renderProducts(products) {
  const container = document.getElementById('product-container');
  const staticPage = document.getElementById('static-page');
  container.innerHTML = '';
  staticPage.innerHTML = '';

  // Group by collection
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.collection]) grouped[p.collection] = [];
    grouped[p.collection].push(p);
  });

  Object.entries(grouped).forEach(([collection, items]) => {
    const colTitle = document.createElement('h4');
    colTitle.textContent = collection;
    colTitle.className = 'w-100 text-left my-3';
    container.appendChild(colTitle);

    const row = document.createElement('div');
    row.className = 'row';

    items.forEach(product => {
      const col = document.createElement('div');
      col.className = 'col-md-3 mb-4';
      col.innerHTML = `
        <div class="product-card">
          <img src="${product.images[0]}" alt="${product.title}">
          <div class="card-body">
            <h5 class="product-title">${product.title}</h5>
            <div class="price">
              <span style="text-decoration:line-through;color:#888;">${product.price_before}</span>
              <span style="color:#e74c3c;font-size:18px;">${product.price_after}</span>
            </div>
            <button class="btn-buy-now" onclick='showProductDetails(${JSON.stringify(product)})'>شراء الآن</button>
          </div>
        </div>
      `;
      row.appendChild(col);
    });

    container.appendChild(row);
  });
}

// Collection filter logic
const filter = document.getElementById('collectionFilter');
if (filter) {
  filter.addEventListener('change', function () {
    const selected = this.value;
    const filtered = selected === 'All' ? allProducts : allProducts.filter(p => p.collection === selected);
    renderProducts(filtered);
  });
}

// Show product modal with image gallery
function showProductDetails(product) {
  document.getElementById("modalTitle").innerText = product.title;
  document.getElementById("modalPriceBefore").innerText = product.price_before;
  document.getElementById("modalPriceAfter").innerText = product.price_after;
  document.getElementById("modalRef").innerText = product.ref;
  document.getElementById("modalDescription").innerHTML = product.description;

  let imageHTML = `
    <img id="mainModalImage" src="${product.images[0]}" class="img-fluid mb-2" style="width:100%; border:1px solid #ddd;">
    <div class="d-flex mt-2">`;
  product.images.forEach((img, index) => {
    imageHTML += `
      <img src="${img}" onclick="document.getElementById('mainModalImage').src='${img}'"
           style="width: 60px; height: 60px; object-fit: cover; margin-right: 10px; border: 1px solid #ccc; cursor: pointer;">
    `;
  });
  imageHTML += '</div>';
  document.getElementById("modalImages").innerHTML = imageHTML;

  document.getElementById("whatsappOrderBtn").onclick = () => {
    const name = document.getElementById("buyerName").value;
    const phone = document.getElementById("buyerPhone").value;
    const address = document.getElementById("buyerAddress").value;

    if (!name || !phone || !address) {
      alert("الرجاء ملء جميع الحقول.");
      return;
    }

    const msg = `سلام، بغيت نشري المنتج:\n📌 Ref: ${product.ref}\n🛍 الاسم: ${product.title}\n💵 الثمن: ${product.price_after}\n\n📋 معلوماتي:\n👤 الاسم: ${name}\n📞 الهاتف: ${phone}\n🏠 العنوان: ${address}`;
    const encodedMsg = encodeURIComponent(msg);
    const whatsappNumber = "212676537623"; // Replace with real number
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;
    window.open(url, "_blank");
  };

  $('#productModal').modal('show');
}

function updateCollectionFilter() {
  const select = document.getElementById('collectionFilter');
  const dropdownMenu = document.getElementById('collectionsMenu');

  allCollections.forEach(col => {
    // dropdown <option>
    const option = document.createElement('option');
    option.value = col;
    option.textContent = col;
    select.appendChild(option);

    // nav dropdown item
    const dropItem = document.createElement('a');
    dropItem.className = 'dropdown-item';
    dropItem.href = '#';
    dropItem.textContent = col;
    dropItem.addEventListener('click', () => {
      select.value = col;
      const filtered = allProducts.filter(p => p.collection === col);
      renderProducts(filtered);
    });
    dropdownMenu.appendChild(dropItem);
  });
}