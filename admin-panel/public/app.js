const app = document.querySelector("#app");
const storedKey = sessionStorage.getItem("vynaro-admin-key") || "";
let adminKey = storedKey;
let properties = [];
let leads = [];
let editingId = null;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
const imageUrl = (value) => value?.startsWith("http") ? value : value || "";
const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"];
const furnishingOptions = ["Unfurnished", "Semi-furnished", "Furnished", "Fully furnished", "Bare shell"];
const amenityOptions = ["Covered parking", "2-wheeler parking", "Power backup", "24x7 security", "CCTV surveillance", "Lift access", "High-speed elevators", "Swimming pool", "Gymnasium", "Clubhouse", "Children's play area", "Landscaped garden", "Jogging track", "24x7 concierge", "Visitor parking", "Intercom", "Fire safety", "Central air conditioning", "Private terrace", "Sea view"];

function getLegacyDetails(property) {
    const parts = String(property?.meta || "").split("·").map((part) => part.trim());
    return { bhk: property?.bhk || parts.find((part) => /BHK/i.test(part)) || "", area: property?.area || parts.find((part) => /sq\.?\s*ft/i.test(part))?.replace(/\s*sq\.?\s*ft\.?/i, "") || "", furnishing: property?.furnishing || parts.find((part) => furnishingOptions.includes(part)) || "" };
}

function renderLogin(error = "") {
    app.innerHTML = `
    <main class="auth-shell">
      <section class="auth-card">
        <p class="kicker">Vynaro Prime / Admin</p>
        <h1>Manage the collection.</h1>
        <p class="muted">Add, update and publish property listings across every storefront category.</p>
        <form id="login-form" class="stack-form">
          <label>Admin key<input id="admin-key" type="password" autocomplete="current-password" required autofocus /></label>
          <button class="primary-button" type="submit">Open dashboard <span>↗</span></button>
          ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
        </form>
      </section>
    </main>`;
    document.querySelector("#login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        adminKey = document.querySelector("#admin-key").value;
        sessionStorage.setItem("vynaro-admin-key", adminKey);
        await loadDashboard();
    });
}

async function api(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { "x-admin-key": adminKey, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
}

function renderDashboard() {
    const categories = ["all", "buy", "projects", "commercial", "luxury"];
    app.innerHTML = `
    <main class="admin-shell">
      <header class="admin-header">
        <div><p class="kicker">Vynaro Prime / Admin</p><h1>Property collection</h1></div>
        <div class="header-actions"><button class="ghost-button" id="new-property">+ Add listing</button><button class="text-button" id="logout">Log out</button></div>
      </header>
      <section class="admin-layout">
        <aside class="admin-sidebar">
          <p class="sidebar-label">Collections</p>
          <nav id="category-tabs">${categories.map((category, index) => `<button class="category-tab ${index === 0 ? "active" : ""}" data-category="${category}">${category === "all" ? "All listings" : category}</button>`).join("")}<button class="category-tab" id="leads-tab">Advisor leads <span>${leads.length}</span></button></nav>
          <div class="sidebar-note"><strong>${properties.length}</strong><span>total listings</span></div>
        </aside>
        <section class="listing-area">
          <div class="listing-toolbar"><div><p class="kicker">Live inventory</p><h2 id="listing-title">All listings</h2></div><input id="listing-search" placeholder="Search by name or location" /></div>
          <div id="listing-grid" class="admin-grid"></div>
        </section>
      </section>
      <div id="modal-root"></div>
    </main>`;

    let activeCategory = "all";
    const drawListings = () => {
        const query = document.querySelector("#listing-search").value.toLowerCase();
        const filtered = properties.filter((property) => (activeCategory === "all" || property.category === activeCategory) && `${property.name} ${property.location}`.toLowerCase().includes(query));
        document.querySelector("#listing-title").textContent = activeCategory === "all" ? "All listings" : `${activeCategory} listings`;
        document.querySelector("#listing-grid").innerHTML = filtered.length ? filtered.map(renderPropertyCard).join("") : `<div class="empty-state"><strong>No listings found</strong><span>Add a property or change your filter.</span></div>`;
        document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openForm(properties.find((item) => item._id === button.dataset.edit))));
        document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", () => deleteProperty(button.dataset.delete)));
    };

    document.querySelectorAll(".category-tab").forEach((button) => button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        document.querySelectorAll(".category-tab").forEach((item) => item.classList.toggle("active", item === button));
        drawListings();
    }));
    document.querySelector("#listing-search").addEventListener("input", drawListings);
    document.querySelector("#new-property").addEventListener("click", () => openForm());
    document.querySelector("#leads-tab").addEventListener("click", () => { window.location.hash = "leads"; renderLeads(); });
    document.querySelector("#logout").addEventListener("click", () => { sessionStorage.removeItem("vynaro-admin-key"); adminKey = ""; renderLogin(); });
    drawListings();
    if (window.location.hash === "#leads") renderLeads();
}

function renderLeads() {
    const listingArea = document.querySelector(".listing-area");
    listingArea.innerHTML = `<div class="listing-toolbar"><div><p class="kicker">Private client advisory</p><h2>Advisor leads</h2></div><button class="ghost-button" id="back-to-listings">Back to listings</button></div><div class="leads-list">${leads.length ? leads.map((lead) => `<article class="lead-card"><div><strong>${escapeHtml(lead.name)}</strong></div><a href="tel:${escapeHtml(lead.phone)}">${escapeHtml(lead.phone)}</a><p>${escapeHtml(lead.propertyName || "General enquiry")} · ${escapeHtml(lead.source || "advisor-popup")}</p><time>${new Date(lead.createdAt).toLocaleString()}</time></article>`).join("") : `<div class="empty-state"><strong>No advisor leads yet</strong><span>New callback requests will appear here.</span></div>`}</div>`;
    document.querySelector("#back-to-listings").addEventListener("click", () => { window.history.replaceState(null, "", window.location.pathname); renderDashboard(); });
}

function renderPropertyCard(property) {
    const image = imageUrl(property.images?.[0]);
    return `<article class="admin-property-card"><div class="admin-property-image">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(property.name)}" />` : `<span>No image</span>`}<span class="status-pill">${escapeHtml(property.category)}</span></div><div class="admin-property-body"><div class="property-topline"><strong>${escapeHtml(property.price)}</strong><span>${property.published ? "Published" : "Draft"}</span></div><h3>${escapeHtml(property.name)}</h3><p>${escapeHtml(property.location)} · ${escapeHtml(property.meta)}</p><div class="property-actions"><button data-edit="${property._id}">Edit</button><button data-delete="${property._id}" class="danger">Delete</button></div></div></article>`;
}

function openForm(property = null) {
    editingId = property?._id || null;
    const modalRoot = document.querySelector("#modal-root");
    modalRoot.innerHTML = `<div class="modal-backdrop"><section class="form-modal"><div class="modal-heading"><div><p class="kicker">${property ? "Edit listing" : "New listing"}</p><h2>${property ? escapeHtml(property.name) : "Add a property"}</h2></div><button id="close-modal" class="close-button">×</button></div><form id="property-form" class="property-form" enctype="multipart/form-data"><div class="form-grid"><label>Collection<select name="category" required>${["buy", "projects", "commercial", "luxury"].map((item) => `<option value="${item}" ${property?.category === item ? "selected" : ""}>${item}</option>`).join("")}</select></label><label>Listing type<input name="type" value="${escapeHtml(property?.type || "For Sale")}" required /></label><label>Property name<input name="name" value="${escapeHtml(property?.name || "")}" required /></label><label>Location<input name="location" value="${escapeHtml(property?.location || "")}" required /></label><label>Price<input name="price" value="${escapeHtml(property?.price || "")}" placeholder="₹4.70 Cr" required /></label><label>Listing details<input name="meta" value="${escapeHtml(property?.meta || "")}" placeholder="3 BHK · 1,080 sq.ft. · Semi-furnished" required /></label></div><label>Description<textarea name="description" rows="3" placeholder="Optional short description">${escapeHtml(property?.description || "")}</textarea></label><label>Amenities<textarea name="amenities" rows="3" placeholder="Parking, Security, Lift access">${escapeHtml(property?.amenities?.join(", ") || "")}</textarea></label><label>Property images<input name="images" type="file" accept="image/*" multiple /><small>Upload up to 12 images. New uploads are added to this listing.</small></label>${property?.images?.length ? `<div class="existing-images">${property.images.map((image) => `<img src="${escapeHtml(imageUrl(image))}" alt="" />`).join("")}</div><input type="hidden" name="existingImages" value='${escapeHtml(JSON.stringify(property.images))}' />` : ""}<div class="form-options"><label class="check-label"><input name="featured" type="checkbox" ${property?.featured ? "checked" : ""} /> Featured listing</label><label class="check-label"><input name="published" type="checkbox" ${property?.published !== false ? "checked" : ""} /> Published</label></div><div class="modal-actions"><button type="button" class="ghost-button" id="cancel-modal">Cancel</button><button class="primary-button" type="submit">${property ? "Save changes" : "Publish listing"} <span>↗</span></button></div><p id="form-error" class="form-error"></p></form></section></div>`;
    const legacyDetails = getLegacyDetails(property);
    const detailsLabel = [...document.querySelectorAll("#property-form label")].find((label) => label.textContent.includes("Listing details"));
    if (detailsLabel) {
        detailsLabel.outerHTML = `<div class="structured-details"><label>Bedrooms / configuration<select name="bhk"><option value="">Select BHK</option>${bhkOptions.map((option) => `<option value="${option}" ${legacyDetails.bhk === option ? "selected" : ""}>${option}</option>`).join("")}</select></label><label>Built-up area (sq.ft.)<input name="area" inputmode="decimal" value="${escapeHtml(legacyDetails.area)}" placeholder="1080" /></label><label>Furnishing<select name="furnishing"><option value="">Select furnishing</option>${furnishingOptions.map((option) => `<option value="${option}" ${legacyDetails.furnishing === option ? "selected" : ""}>${option}</option>`).join("")}</select></label></div>`;
    }
    const amenitiesLabel = [...document.querySelectorAll("#property-form label")].find((label) => label.textContent.includes("Amenities"));
    if (amenitiesLabel) {
        const selectedAmenities = new Set(property?.amenities || []);
        amenitiesLabel.innerHTML = `<span class="field-label">Amenities</span><div class="amenity-options">${amenityOptions.map((amenity) => `<label class="amenity-option"><input type="checkbox" name="amenities" value="${escapeHtml(amenity)}" ${selectedAmenities.has(amenity) ? "checked" : ""} />${escapeHtml(amenity)}</label>`).join("")}</div>`;
    }
    const priceInput = document.querySelector("#property-form input[name=price]");
    if (priceInput) {
        priceInput.placeholder = "4.7 Cr or 45 Lac";
        const priceLabel = priceInput.closest("label");
        if (priceLabel?.firstChild) priceLabel.firstChild.textContent = "Price (₹)";
    }
    document.querySelector("#close-modal").addEventListener("click", closeForm);
    document.querySelector("#cancel-modal").addEventListener("click", closeForm);
    document.querySelector("#property-form").addEventListener("submit", submitProperty);
}

function closeForm() { document.querySelector("#modal-root").innerHTML = ""; editingId = null; }

async function submitProperty(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("featured", form.elements.featured.checked ? "true" : "false");
    formData.set("published", form.elements.published.checked ? "true" : "false");
    const endpoint = editingId ? `/api/properties/${editingId}` : "/api/properties";
    try {
        await api(endpoint, { method: editingId ? "PUT" : "POST", body: formData });
        closeForm();
        await loadDashboard();
    } catch (error) {
        document.querySelector("#form-error").textContent = error.message;
    }
}

async function deleteProperty(id) {
    if (!window.confirm("Delete this listing and remove it from the admin collection?")) return;
    try {
        await api(`/api/properties/${id}`, { method: "DELETE" });
        await loadDashboard();
    } catch (error) {
        window.alert(error.message);
    }
}

async function loadDashboard() {
    try {
        [properties, leads] = await Promise.all([api("/api/properties"), api("/api/leads")]);
        renderDashboard();
    } catch (error) {
        renderLogin(error.message);
    }
}

if (adminKey) loadDashboard(); else renderLogin();
