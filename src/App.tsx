import { useEffect, useRef, useState } from "react";

type Property = {
  name: string;
  location: string;
  price: string;
  meta: string;
  type: string;
  image: string;
  gallery: string[];
  luxury?: boolean;
  category?: "buy" | "projects" | "commercial" | "luxury";
  amenities?: string[];
  description?: string;
};

type AdminProperty = {
  category: "buy" | "projects" | "commercial" | "luxury";
  name: string;
  location: string;
  price: string;
  type: string;
  meta: string;
  description?: string;
  amenities?: string[];
  images?: string[];
};

const images = {
  skyline: "https://images.unsplash.com/photo-1682414593649-c3e4024a7995?auto=format&fit=crop&w=2200&q=88",
  tower: "https://images.unsplash.com/photo-1710582308582-55cc0c461c4e?auto=format&fit=crop&w=1600&q=85",
  city: "https://images.unsplash.com/photo-1648197685224-18c96a8d116d?auto=format&fit=crop&w=1600&q=85",
  highrise: "https://images.unsplash.com/photo-1594146032116-80033545b0b8?auto=format&fit=crop&w=1600&q=85",
  coast: "https://images.unsplash.com/photo-1569571389865-3a197e6a1cc9?auto=format&fit=crop&w=1600&q=85",
  interior: "https://images.unsplash.com/photo-1738168246881-40f35f8aba0a?auto=format&fit=crop&w=1600&q=85",
  interior2: "https://images.unsplash.com/photo-1682184805271-11671b7ecf4c?auto=format&fit=crop&w=1600&q=85",
  villa: "https://images.unsplash.com/photo-1748063578185-3d68121b11ff?auto=format&fit=crop&w=1600&q=85",
  villa2: "https://images.unsplash.com/photo-1706164971302-e30c0640cc3b?auto=format&fit=crop&w=1600&q=85",
  agent: "/BK-Shedge.png",
  dining: "https://images.unsplash.com/photo-1737898378296-94dc316cd443?auto=format&fit=crop&w=1600&q=85",
  living: "https://images.unsplash.com/photo-1699239116624-85268dce7377?auto=format&fit=crop&w=1600&q=85",
  living2: "https://images.unsplash.com/photo-1680416124510-5eae1beca412?auto=format&fit=crop&w=1600&q=85",
  bedroom: "https://images.unsplash.com/photo-1663811397207-418a92396ad5?auto=format&fit=crop&w=1600&q=85",
};

const properties: Property[] = [
  { name: "Cosmopolis", location: "Andheri West", price: "₹4.70 Cr", meta: "3 BHK · 1,080 sq.ft. · Semi-furnished", type: "For Sale", image: images.interior, gallery: [images.interior, images.dining, images.bedroom, images.living] },
  { name: "The Sea Crest", location: "Worli", price: "₹8.25 Cr", meta: "4 BHK · 2,140 sq.ft. · Sea view", type: "Exclusive", image: images.tower, gallery: [images.tower, images.interior2, images.living2, images.coast], luxury: true },
  { name: "Pali Hill House", location: "Bandra West", price: "₹6.40 Cr", meta: "3 BHK · 1,420 sq.ft. · Furnished", type: "For Sale", image: images.interior2, gallery: [images.interior2, images.living, images.dining, images.bedroom] },
  { name: "One Powai", location: "Powai", price: "₹3.15 Cr", meta: "2 BHK · 940 sq.ft. · Ready", type: "New", image: images.highrise, gallery: [images.highrise, images.living2, images.interior, images.city] },
  { name: "Altamount Residence", location: "Cumballa Hill", price: "₹18.5 Cr", meta: "4 BHK · 3,200 sq.ft. · Private deck", type: "Private Listing", image: images.villa, gallery: [images.villa, images.living, images.dining, images.bedroom], luxury: true },
  { name: "Harbour Lights", location: "Colaba", price: "₹9.80 Cr", meta: "3 BHK · 1,850 sq.ft. · Harbour view", type: "For Sale", image: images.coast, gallery: [images.coast, images.interior2, images.living2, images.dining], luxury: true },
];

const adminApiUrl = import.meta.env.VITE_ADMIN_API_URL || "http://localhost:8787";
const whatsappUrl = "https://wa.me/919769017399?text=Hi%20BK%20Shedge%2C%20I%27m%20interested%20in%20a%20Mumbai%20property.";

function formatDisplayPrice(value: string) {
  const input = String(value || "").trim().replace(/^₹\s*/, "").replace(/,/g, "");
  const match = input.match(/^(\d+(?:\.\d+)?)\s*(cr|crore|crores|lac|lakh|lakhs)?$/i);
  if (!match) return input ? `₹${input}` : "Price on request";
  const unit = match[2]?.toLowerCase();
  if (unit && ["cr", "crore", "crores"].includes(unit)) return `₹${match[1]} Cr`;
  if (unit) return `₹${match[1]} Lac`;
  return `₹${match[1]}`;
}

function mapAdminProperty(record: AdminProperty): Property {
  const gallery = (record.images || []).map((image) => image.startsWith("http") ? image : `${adminApiUrl}${image}`);
  const fallbackImage = images.interior;
  return {
    name: record.name,
    location: record.location,
    price: formatDisplayPrice(record.price),
    meta: record.meta,
    type: record.type,
    image: gallery[0] || fallbackImage,
    gallery: gallery.length ? gallery : [fallbackImage],
    luxury: record.category === "luxury",
    category: record.category,
    amenities: record.amenities,
    description: record.description,
  };
}

const zones: Record<string, string[]> = {
  "South Mumbai": ["Malabar Hill", "Colaba", "Cuffe Parade", "Altamount Road"],
  "Worli to Mahim": ["Worli", "Prabhadevi", "Lower Parel", "Mahim"],
  "Western Suburbs": ["Bandra West", "Juhu", "Andheri West", "Khar West"],
  "Eastern Suburbs": ["Powai", "Ghatkopar", "Chembur", "Vikhroli"],
  "Thane & Beyond": ["Thane West", "Ghodbunder Road", "Mulund", "Navi Mumbai"],
};

const nav = ["Buy", "Commercial", "Luxury", "Projects", "About"];
const bhks = ["Any", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const projectHighlights = properties.slice(0, 4);
const commercialSpaces = [
  {
    title: "Eros Corporate Hub",
    location: "Lower Parel",
    price: "₹5.8 Cr",
    detail: "Ready-to-move offices with private lift access and skyline views.",
    image: images.tower,
  },
  {
    title: "BKC Retail Avenue",
    location: "BKC",
    price: "₹12.4 Cr",
    detail: "High-footfall retail frontage designed for premium brand presence.",
    image: images.city,
  },
  {
    title: "Powai Business Park",
    location: "Powai",
    price: "₹9.1 Cr",
    detail: "Flexible workspaces with wellness zones, parking and meeting suites.",
    image: images.highrise,
  },
];

const commercialListings: Property[] = commercialSpaces.map((space) => ({
  name: space.title,
  location: space.location,
  price: space.price,
  meta: "Commercial property · Ready to occupy",
  type: "Commercial",
  image: space.image,
  gallery: [space.image, images.interior, images.city, images.highrise],
}));

const luxuryListings: Property[] = [
  { ...properties[4], name: "Malabar Hill Residence", location: "Malabar Hill" },
  { ...properties[1], name: "Worli Sea View Residence", location: "Worli" },
  { ...properties[5], name: "Bandra Heritage Residence", location: "Bandra West" },
  { ...properties[0], name: "Juhu Garden Residence", location: "Juhu", price: "₹11.2 Cr", luxury: true },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function Heading({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return (
    <div className="heading">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

function getPropertyDetails(item: Property) {
  const metaParts = item.meta.split("·").map((part) => part.trim());

  const amenities = item.amenities?.length ? item.amenities : [
    "2-wheeler parking",
    "Covered parking",
    "Power backup",
    "Security",
    "Lift access",
    "Clubhouse",
    "Landscaped garden",
    "24x7 concierge",
  ];

  return {
    amenities,
  };
}

function getAmenityIcon(amenity: string) {
  const icons: Record<string, string> = {
    "2-wheeler parking": "P",
    "Covered parking": "P",
    "Power backup": "✦",
    Security: "◇",
    "Lift access": "↕",
    Clubhouse: "⌂",
    "Landscaped garden": "❋",
    "24x7 concierge": "◷",
  };

  return icons[amenity] || "·";
}

function priceInCrores(price: string) {
  const value = String(price).replace(/₹|,/g, "").trim().match(/(\d+(?:\.\d+)?)\s*(Cr|Lac)?/i);
  if (!value) return 0;
  const amount = Number(value[1]);
  return value[2]?.toLowerCase() === "lac" ? amount / 100 : amount;
}

function matchesBudget(price: string, budget: string) {
  if (budget === "All") return true;
  const amount = priceInCrores(price);
  if (budget.endsWith("+")) return amount >= Number(budget.slice(0, -1));
  const [minimum, maximum] = budget.split("-").map(Number);
  return maximum ? amount >= minimum && amount < maximum : amount >= minimum;
}

function PropertyCard({ item, compact = false, onViewDetails }: { item: Property; compact?: boolean; onViewDetails: (item: Property) => void }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryActive, setGalleryActive] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!galleryActive) return;
    const timer = window.setInterval(() => {
      setGalleryIndex((current) => (current + 1) % item.gallery.length);
    }, 1400);
    return () => window.clearInterval(timer);
  }, [galleryActive, item.gallery.length]);

  const changeImage = (direction: number) => {
    setGalleryIndex((current) => (current + direction + item.gallery.length) % item.gallery.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 40) changeImage(distance > 0 ? -1 : 1);
    touchStartX.current = null;
  };

  return (
    <article className={`listing-card ${compact ? "compact" : ""}`}>
      <div
        className={`listing-image ${galleryActive ? "gallery-active" : ""}`}
        onMouseEnter={() => setGalleryActive(true)}
        onMouseLeave={() => setGalleryActive(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img key={item.gallery[galleryIndex]} src={item.gallery[galleryIndex]} alt={`${item.name}, image ${galleryIndex + 1} of ${item.gallery.length}`} />
        <span className="badge">{item.type}</span>
        <span className="gallery-count">{galleryIndex + 1} / {item.gallery.length}</span>
        <button type="button" className="gallery-arrow gallery-prev" onClick={() => changeImage(-1)} aria-label={`Previous image of ${item.name}`}>←</button>
        <button type="button" className="gallery-arrow gallery-next" onClick={() => changeImage(1)} aria-label={`Next image of ${item.name}`}>→</button>
        <div className="gallery-dots">
          {item.gallery.map((_, index) => (
            <button
              type="button"
              className={galleryIndex === index ? "active" : ""}
              onClick={() => setGalleryIndex(index)}
              aria-label={`Show image ${index + 1} of ${item.name}`}
              key={index}
            />
          ))}
        </div>
        <span className="view">Hover to explore <Arrow /></span>
      </div>
      <div className="listing-body">
        <div className="listing-price"><strong>{item.price}</strong></div>
        <h3>{item.name}</h3>
        <p className="listing-location">{item.location}, Mumbai</p>
        <p className="listing-meta">{item.meta}</p>
        <button type="button" className="card-link" onClick={() => onViewDetails(item)}>View Details <Arrow /></button>
      </div>
    </article>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTab, setSearchTab] = useState("Buy");
  const [searchCategory, setSearchCategory] = useState("Buy");
  const [selectedBhk, setSelectedBhk] = useState("Any");
  const [zone, setZone] = useState("Western Suburbs");
  const [area, setArea] = useState("Bandra West");
  const [property, setProperty] = useState<Property | null>(null);
  const [results, setResults] = useState(false);
  const [lead, setLead] = useState({ name: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadStatus, setLeadStatus] = useState("");
  const [detailGalleryIndex, setDetailGalleryIndex] = useState(0);
  const [directoryType, setDirectoryType] = useState<string | null>(null);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryCategoryFilter, setDirectoryCategoryFilter] = useState("All");
  const [directoryBhkFilter, setDirectoryBhkFilter] = useState("All");
  const [directoryBudgetFilter, setDirectoryBudgetFilter] = useState("All");
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [adminListings, setAdminListings] = useState<Property[]>([]);
  const detailTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    setDetailGalleryIndex(0);
  }, [property?.name]);

  useEffect(() => {
    const handleBrowserBack = (event: PopStateEvent) => {
      setProperty(null);
      setDirectoryType(event.state?.vynaroDirectory || null);
    };
    window.addEventListener("popstate", handleBrowserBack);
    return () => window.removeEventListener("popstate", handleBrowserBack);
  }, []);

  useEffect(() => {
    setDirectoryQuery("");
    setDirectoryCategoryFilter(directoryType === "commercial" ? "Commercial" : directoryType === "luxury" ? "Luxury" : directoryType === "projects" ? "Projects" : directoryType === "search" ? searchCategory : "Buy");
    setDirectoryBhkFilter("All");
    setDirectoryBudgetFilter("All");
  }, [directoryType]);

  useEffect(() => {
    fetch(`${adminApiUrl}/api/properties/public`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Admin listings unavailable")))
      .then((records: AdminProperty[]) => setAdminListings(records.map(mapAdminProperty)))
      .catch(() => setAdminListings([]));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 70);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu || searchOpen || property || directoryType || advisorOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu, searchOpen, property, directoryType, advisorOpen]);

  const showSearchResults = (query = searchQuery) => {
    setSearchQuery(query);
    setSearchCategory(searchTab);
    setResults(true);
    setSearchOpen(false);
    openDirectory("search");
  };

  const openDirectory = (type: string) => {
    window.history.pushState({ vynaroDirectory: type }, "", window.location.href);
    setDirectoryType(type);
  };

  const closeDirectory = () => {
    if (window.history.state?.vynaroDirectory) {
      window.history.back();
    } else {
      setDirectoryType(null);
    }
  };

  const runSearch = () => {
    showSearchResults();
  };

  const openProperty = (item: Property) => {
    setLead({ name: "", phone: "" });
    setLeadSubmitted(false);
    setLeadStatus("");
    window.history.pushState({ vynaroProperty: item.name }, "", window.location.href);
    setProperty(item);
  };

  const closeProperty = () => {
    if (window.history.state?.vynaroProperty) {
      window.history.back();
    } else {
      setProperty(null);
    }
  };

  const handleDetailTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    detailTouchStartX.current = event.touches[0].clientX;
  };

  const handleDetailTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (detailTouchStartX.current === null || !property) return;
    const distance = event.changedTouches[0].clientX - detailTouchStartX.current;
    if (Math.abs(distance) > 40) setDetailGalleryIndex((current) => (current + (distance > 0 ? -1 : 1) + property.gallery.length) % property.gallery.length);
    detailTouchStartX.current = null;
  };

  const handleLeadSubmit = async (source = "advisor-popup") => {
    if (!lead.name.trim()) {
      setLeadStatus("Please enter your name.");
      return;
    }
    if (!/^\d{10}$/.test(lead.phone)) {
      setLeadStatus("Please enter a valid 10-digit phone number.");
      return;
    }
    const submittedName = lead.name.trim();
    try {
      const response = await fetch(`${adminApiUrl}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: submittedName, phone: lead.phone.trim(), propertyName: property?.name || "", source }),
      });
      if (!response.ok) throw new Error("Unable to save your request.");
      setLeadSubmitted(true);
      setLeadStatus(`Thanks ${submittedName}, your request is saved. Our advisor will call you shortly.`);
    } catch {
      setLeadStatus("We could not save your request. Please call the advisor directly.");
    }
  };

  const handleAdvisorOpen = () => {
    setLead({ name: "", phone: "" });
    setLeadSubmitted(false);
    setLeadStatus("");
    setAdvisorOpen(true);
  };

  const adminHomes = adminListings.filter((item) => item.category === "buy");
  const adminProjects = adminListings.filter((item) => item.category === "projects");
  const adminCommercial = adminListings.filter((item) => item.category === "commercial");
  const adminLuxury = adminListings.filter((item) => item.category === "luxury");
  const homeListings = [...adminHomes, ...properties];
  const projectListings = [...adminProjects, ...projectHighlights];
  const luxuryCollection = [...adminLuxury, ...luxuryListings];
  const commercialCollection = [
    ...adminCommercial.map((item) => ({ title: item.name, location: item.location, price: item.price, detail: item.meta, image: item.image, listing: item })),
    ...commercialSpaces.map((space) => ({ ...space, listing: commercialListings.find((item) => item.name === space.title) })),
  ];

  const searchTerm = searchQuery.trim().toLowerCase();
  const allListings = [...adminListings, ...properties];
  const commercialDirectoryListings = commercialCollection.map((item) => item.listing || commercialListings.find((listing) => listing.name === item.title)!).filter(Boolean);
  const searchCollection = searchCategory === "Commercial" ? commercialDirectoryListings : searchCategory === "Luxury" ? luxuryCollection : searchCategory === "Projects" ? projectListings : homeListings;
  const searchMatches = searchCollection.filter((item) => `${item.name} ${item.location} ${item.meta} ${item.type}`.toLowerCase().includes(searchTerm));
  const categoryListings = directoryCategoryFilter === "Commercial" ? commercialDirectoryListings : directoryCategoryFilter === "Luxury" ? luxuryCollection : directoryCategoryFilter === "Projects" ? projectListings : directoryCategoryFilter === "Buy" ? homeListings : allListings;
  const activeSearchMatches = categoryListings.filter((item) => `${item.name} ${item.location} ${item.meta} ${item.type}`.toLowerCase().includes(searchTerm));
  const directorySearchTerm = directoryQuery.trim().toLowerCase();
  const filteredDirectoryItems = categoryListings.filter((item) => {
    const hasBhk = directoryBhkFilter === "All" || item.meta.toLowerCase().includes(directoryBhkFilter.toLowerCase());
    return hasBhk && matchesBudget(item.price, directoryBudgetFilter);
  });
  const rankedDirectoryItems = directorySearchTerm
    ? [...filteredDirectoryItems.filter((item) => `${item.name} ${item.location}`.toLowerCase().includes(directorySearchTerm)), ...filteredDirectoryItems.filter((item) => !`${item.name} ${item.location}`.toLowerCase().includes(directorySearchTerm))]
    : filteredDirectoryItems;
  const visibleDirectoryItems = rankedDirectoryItems;
  const activeDirectoryLabel = directoryCategoryFilter === "Commercial" ? "Commercial" : directoryCategoryFilter === "Luxury" ? "Luxury" : directoryCategoryFilter === "Projects" ? "Projects" : "Buy";
  const directoryTitle = directoryType === "commercial" ? "Explore commercial spaces." : directoryType === "luxury" ? "Explore private residences." : directoryType === "projects" ? "Explore signature projects." : directoryType === "search" ? `${activeDirectoryLabel} results for “${searchQuery || "Mumbai properties"}”.` : "Explore Mumbai homes.";
  const directoryCopy = directoryType === "commercial" ? "Browse offices, retail frontages and workspaces positioned for long-term growth." : directoryType === "luxury" ? "Discover rare residences selected for architecture, provenance and lifestyle fit." : directoryType === "projects" ? "Browse new launches and landmark developments across Mumbai's high-demand neighbourhoods." : directoryType === "search" ? `${activeSearchMatches.length} matching ${activeSearchMatches.length === 1 ? "property" : "properties"} shown first, followed by related ${activeDirectoryLabel.toLowerCase()} listings you may also like.` : "Browse the full collection of homes currently represented by Vynaro Prime.";

  return (
    <main>
      <header className={`header ${scrolled ? "sticky" : ""}`}>
        <a className="brand" href="#home"><span>AM</span><div><strong>Vynaro Prime</strong></div></a>
        <nav className="main-nav">
          {nav.map((item) => <a key={item} href={`#${item.toLowerCase()}`}>{item}</a>)}
        </nav>
        <div className="header-actions">
          <button type="button" className="gold-button small" onClick={handleAdvisorOpen}>Contact Advisor</button>
        </div>
        <button className={`mobile-toggle ${menu ? "active" : ""}`} onClick={() => setMenu(!menu)} aria-label="Toggle navigation"><span /><span /></button>
      </header>

      <div className={`mobile-nav ${menu ? "open" : ""}`}>
        <Eyebrow>Explore Mumbai Real Estate</Eyebrow>
        {nav.map((item, index) => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenu(false)}><small>0{index + 1}</small>{item}<span>＋</span></a>)}
        <button type="button" className="mobile-advisor" onClick={() => { setMenu(false); handleAdvisorOpen(); }}>Talk to an Advisor <Arrow /></button>
        <div className="mobile-contact"><a href="tel:+919769017399">Call</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:hello@anikamehra.com">Email</a></div>
      </div>

      <div className={`global-search ${searchOpen ? "open" : ""}`}>
        <button onClick={() => setSearchOpen(false)} aria-label="Close search">×</button>
        <Eyebrow>Search Mumbai</Eyebrow>
        <label><span>Where would you like to live?</span><input autoFocus={searchOpen} placeholder="Try Bandra West, Worli, Powai..." /></label>
        <div>{["Bandra West", "Worli", "Juhu", "Powai", "Lower Parel"].map((item) => <button type="button" onClick={() => { setSearchOpen(false); showSearchResults(item); }} key={item}>{item} <Arrow /></button>)}</div>
      </div>

      <section className="hero" id="home">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <Eyebrow>Mumbai Real Estate Advisory</Eyebrow>
          <h1>Find a home worth staying in.<br /><em>Curated for your next move.</em></h1>
          <p>From investment-ready apartments to iconic commercial spaces and private luxury listings, we help you buy with clarity.</p>
          <div className="hero-links"><a className="gold-button" href="#buy">Explore Properties <Arrow /></a><button type="button" className="line-link light" onClick={handleAdvisorOpen}>Speak to an Advisor <Arrow /></button></div>
        </div>
        <div className="hero-note"><span>Independent advice</span><span>Local market insight</span><span>Private opportunities</span></div>
      </section>

      <section className="search-wrap">
        <div className="property-search">
          <div className="search-tabs">
            {['Buy', 'Commercial', 'Luxury', 'Projects'].map((tab) => (
              <button key={tab} className={searchTab === tab ? 'active' : ''} onClick={() => setSearchTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="search-fields">
            <label className="location-field"><small>Location / Area</small><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") showSearchResults(); }} placeholder="Enter location or area..." /></label>
            <label><small>Budget</small><select><option>Any budget</option><option>₹1 Cr – ₹1.5 Cr</option><option>₹1.5 Cr – ₹2 Cr</option><option>₹2 Cr – ₹3 Cr</option><option>₹3 Cr – ₹4 Cr</option><option>₹4 Cr – ₹5 Cr</option><option>₹5 Cr+</option></select></label>
            <button type="button" className="search-submit" onClick={runSearch}>Search <Arrow /></button>
          </div>
          <div className="bhk-row"><small>Bedrooms</small>{bhks.map((bhk) => <button className={selectedBhk === bhk ? "active" : ""} onClick={() => setSelectedBhk(bhk)} key={bhk}>{bhk}</button>)}</div>
        </div>
      </section>

      <section className="quick-categories section" id="buy">
        {[
          ["01", "Buy", "Residences chosen for everyday ease and long-term value.", "1,280+ homes"],
          ["02", "Projects", "New launches and landmark developments in high-demand pockets.", "126 launches"],
          ["03", "Commercial", "Premium offices and retail spaces ready to scale with your business.", "840+ spaces"],
          ["04", "Luxury", "Private collection of signature homes and penthouses.", "Curated picks"],
        ].map(([num, title, copy, count], index) => (
          <a className={index === 3 ? "luxury" : ""} href={index === 0 ? "#buy" : index === 1 ? "#projects" : index === 2 ? "#commercial" : "#luxury"} key={title}><span>{num}</span><div><h3>{title}</h3><p>{copy}</p><small>{count}</small></div><Arrow /></a>
        ))}
      </section>

      <section className="listings section" id="buy">
        <div className="section-top">
          <Heading eyebrow={results ? "Search results · 48 matches" : "Fresh on the market"} title={results ? `${selectedBhk} homes in Mumbai` : "Trending homes in Mumbai"} copy="Hand-picked for space, location and design — selected to help you move faster and decide with confidence." />
          <button type="button" className="line-link directory-trigger" onClick={() => openDirectory("homes")}>See all homes <Arrow /></button>
        </div>
        <div className="listing-grid">{homeListings.slice(0, 4).map((item) => <PropertyCard item={item} key={item.name} onViewDetails={openProperty} />)}</div>
      </section>

      <section className="projects section" id="projects">
        <div className="section-top">
          <Heading eyebrow="Signature projects" title="Upcoming developments worth watching." copy="Limited-release residences designed for location, long-term value, and elevated everyday living." />
          <button type="button" className="line-link directory-trigger" onClick={() => openDirectory("projects")}>See all projects <Arrow /></button>
        </div>
        <div className="listing-grid">{projectListings.slice(0, 4).map((item) => <PropertyCard item={item} compact key={item.name} onViewDetails={openProperty} />)}</div>
      </section>

      <section className="commercial-section section" id="commercial">
        <div className="section-top">
          <Heading eyebrow="Commercial real estate" title="Spaces built for ambition." copy="Offices, retail and workspaces positioned for growth, visibility and long-term value in Mumbai's strongest corridors." />
          <button type="button" className="line-link directory-trigger" onClick={() => openDirectory("commercial")}>See all commercial <Arrow /></button>
        </div>
        <div className="commercial-grid">
          {commercialCollection.slice(0, 3).map((space) => (
            <article className="commercial-card" key={space.title}>
              <img src={space.image} alt={space.title} />
              <div className="commercial-body">
                <span>{space.location}</span>
                <h3>{space.title}</h3>
                <p>{space.detail}</p>
                <div className="commercial-meta">
                  <strong>{space.price}</strong>
                  <button onClick={() => openProperty(space.listing || { ...properties[0], name: space.title, location: space.location, price: space.price, meta: space.detail, image: space.image, gallery: [space.image, images.interior, images.city, images.highrise] })}>View details <Arrow /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="luxury-section section" id="luxury">
        <div className="luxury-intro"><Eyebrow>The Private Collection</Eyebrow><h2>Exceptional addresses.<br /><em>Curated for discerning buyers.</em></h2><p>Rare homes, quietly represented. Each residence is selected for provenance, architecture and lifestyle fit.</p><button type="button" className="line-link light directory-trigger" onClick={() => openDirectory("luxury")}>See all luxury <Arrow /></button></div>
        <div className="luxury-grid">
          {luxuryCollection.slice(0, 4).map((item, index) => (
            <button className={`luxury-card card-${index + 1}`} onClick={() => openProperty(item)} key={item.name}><img src={item.image} alt={item.name} /><span>Private residence · {item.location}</span><div><h3>{item.name}</h3><p>{item.meta}</p><strong>{item.price}</strong></div><i>View residence <Arrow /></i></button>
          ))}
        </div>
      </section>

      <section className="advisory section" id="about">
        <div className="section-top"><Heading eyebrow="Why Vynaro Prime" title={"More than listings.\nBetter decisions."} /><p>Thoughtful guidance designed to reduce friction, speed up decisions, and keep your property journey focused.</p></div>
        <div className="advisory-grid">
          {[["01", "Shortlist with intent", "We filter only homes and spaces aligned with your budget, timing and lifestyle."], ["02", "Negotiate with certainty", "Local insight helps you act confidently in high-demand micro-markets."], ["03", "Assess the full picture", "We look beyond aesthetics to location, returns, title clarity and future value."], ["04", "Stay supported", "From first enquiry to final paperwork, your advisor remains involved and proactive."]].map(([num, title, copy]) => <article key={title}><span>{num}</span><div className="advisory-icon">⌂</div><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className="advisor section" id="contact">
        <div className="advisor-copy"><Eyebrow>Independent Mumbai Property Advisor</Eyebrow><h2>Your property needs,<br /><em>over time.</em></h2><p>From your next home to your family's property holdings, get thoughtful guidance for buying, selling, leasing and managing property.</p><div><button type="button" className="gold-button" onClick={handleAdvisorOpen}>Talk to an Advisor <Arrow /></button><a className="line-link" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp <Arrow /></a><a className="line-link" href="tel:+919769017399">Call <Arrow /></a></div></div>
        <div className="advisor-image"><img src={images.agent} alt="BK Shedge, Mumbai property advisor" /><span><strong>BK Shedge</strong>Founder & Client Advisor</span></div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand"><div className="footer-logo">AM</div><h3>Property decisions,<br />made with perspective.</h3><p>Independent residential, luxury and investment property advice across Mumbai.</p><a href="tel:+919769017399">+91 9769017399</a></div>
          <div className="footer-column"><small>Explore</small><a href="#buy">Buy</a><a href="#projects">Projects</a><a href="#luxury">Luxury</a><a href="#commercial">Commercial</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 BK Shedge Property Advisory</span><div><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href="mailto:hello@anikamehra.com">Email</a><a href="#instagram">Instagram</a><a href="#linkedin">LinkedIn</a></div><span>Mumbai, India</span></div>
      </footer>

      <div className="mobile-contact-bar"><a href="tel:+919769017399">Call</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a href="#contact">Enquire</a></div>

      {advisorOpen && (
        <div className="advisor-modal" role="dialog" aria-modal="true" aria-labelledby="advisor-modal-title">
          <button type="button" className="advisor-modal-close" onClick={() => setAdvisorOpen(false)} aria-label="Close advisor form">×</button>
          <div className="advisor-modal-card">
            <Eyebrow>Private Client Advisory</Eyebrow>
            <h2 id="advisor-modal-title">Speak with an advisor</h2>
            <p>Leave your details and our advisor will contact you with thoughtful guidance for your property search.</p>
            <div className="detail-lead-form advisor-lead-form">
              {leadSubmitted ? <p className="lead-success saved">{leadStatus}</p> : <>
                <label>
                  <span>Full name</span>
                  <input value={lead.name} onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" />
                </label>
                <label>
                  <span>Phone number</span>
                  <input type="tel" inputMode="numeric" maxLength={10} value={lead.phone} onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit phone number" />
                </label>
                <button type="button" className="gold-button" disabled={!lead.name.trim() || !/^\d{10}$/.test(lead.phone)} onClick={() => handleLeadSubmit("advisor-popup")}>Request callback <Arrow /></button>
                {leadStatus && <p className="lead-error">{leadStatus}</p>}
              </>}
            </div>
            <div className="advisor-modal-actions">
              <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp Advisor</a>
              <a href="tel:+919769017399">Call +91 9769017399</a>
            </div>
          </div>
        </div>
      )}

      {directoryType && (
        <div className="projects-directory">
          <header className="directory-header">
            <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); closeDirectory(); }}><span>AM</span><div><strong>Vynaro Prime</strong></div></a>
            <button type="button" className="directory-close" onClick={closeDirectory}>Back to home <span>×</span></button>
          </header>
          <div className="directory-inner">
            <div className="directory-intro">
              <div className="detail-hero-copy">
                <Eyebrow>Property directory</Eyebrow>
                <h1>{directoryTitle}</h1>
                <p>{directoryCopy}</p>
              </div>
              <span className="directory-count">{visibleDirectoryItems.length} properties</span>
            </div>
            <div className="directory-toolbar">
              <form className="directory-search" onSubmit={(event) => event.preventDefault()}>
                <input value={directoryQuery} onChange={(event) => setDirectoryQuery(event.target.value)} placeholder="Search project name or location" aria-label="Search project name or location" />
                <button type="submit">Search <Arrow /></button>
              </form>
              <label className="directory-select"><span>Collection</span><select value={directoryCategoryFilter} onChange={(event) => setDirectoryCategoryFilter(event.target.value)}><option>All</option><option>Buy</option><option>Commercial</option><option>Projects</option><option>Luxury</option></select></label>
              <label className="directory-select"><span>BHK</span><select value={directoryBhkFilter} onChange={(event) => setDirectoryBhkFilter(event.target.value)}><option>All</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option><option>4 BHK</option><option>5 BHK</option></select></label>
              <label className="directory-select"><span>Budget</span><select value={directoryBudgetFilter} onChange={(event) => setDirectoryBudgetFilter(event.target.value)}><option value="All">All</option><option value="1-1.5">₹1 Cr – ₹1.5 Cr</option><option value="1.5-2">₹1.5 Cr – ₹2 Cr</option><option value="2-3">₹2 Cr – ₹3 Cr</option><option value="3-4">₹3 Cr – ₹4 Cr</option><option value="4-5">₹4 Cr – ₹5 Cr</option><option value="5+">₹5 Cr+</option></select></label>
            </div>
            <div className="listing-grid directory-grid">
              {visibleDirectoryItems.map((item) => <PropertyCard item={item} key={item.name} onViewDetails={openProperty} />)}
            </div>
          </div>
        </div>
      )}

      {property && (() => {
        const details = getPropertyDetails(property);
        return (
          <div className={`detail-view ${property.luxury ? "luxury-detail" : ""}`}>
            <button className="detail-close" onClick={closeProperty}>×</button>
            <div className="detail-hero" onTouchStart={handleDetailTouchStart} onTouchEnd={handleDetailTouchEnd}>
              <img src={property.gallery[detailGalleryIndex]} alt={`${property.name} view ${detailGalleryIndex + 1}`} />
              <div className="detail-gallery-nav">
                <button type="button" onClick={() => setDetailGalleryIndex((current) => (current - 1 + property.gallery.length) % property.gallery.length)} aria-label="Previous property image">←</button>
                <span>{String(detailGalleryIndex + 1).padStart(2, "0")} / {String(property.gallery.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => setDetailGalleryIndex((current) => (current + 1) % property.gallery.length)} aria-label="Next property image">→</button>
              </div>
              <div className="detail-gallery-thumbs" aria-label="Property image gallery">
                {property.gallery.map((image, index) => (
                  <button type="button" className={index === detailGalleryIndex ? "active" : ""} onClick={() => setDetailGalleryIndex(index)} key={image} aria-label={`Show property image ${index + 1}`}>
                    <img src={image} alt="" />
                  </button>
                ))}
              </div>
              <div>
                <Eyebrow>{property.type} · {property.location}</Eyebrow>
                <h1>{property.name}</h1>
                <p>{property.price}</p>
              </div>
            </div>

            <div className="detail-content">
              <div className="detail-main">
                <div className="detail-summary-grid">
                  <div><small>Location</small><strong>{property.location}, Mumbai</strong></div>
                  <div><small>Price</small><strong>{property.price}</strong></div>
                  <div><small>Configuration</small><strong>{property.meta.split("·")[0].trim()}</strong></div>
                  <div><small>Possession</small><strong>Ready to move</strong></div>
                </div>

                <div className="detail-section">
                  <Eyebrow>Amenities</Eyebrow>
                  <div className="amenities">
                    {details.amenities.map((item, index) => (
                      <div className="amenity-item" key={item}>
                        <span className="amenity-icon" aria-hidden="true">{getAmenityIcon(item)}</span>
                        <span className="amenity-index">0{index + 1}</span>
                        <span className="amenity-name">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <aside className="detail-side-panel">
                <small>Private Client Advisory</small>
                <h3>Interested in this property?</h3>
                <p>Leave your details below and our advisor will contact you with the exact availability, pricing and documentation details.</p>

                <div className="detail-lead-form">
                  {leadSubmitted ? <p className="lead-success saved">{leadStatus}</p> : <>
                    <label>
                      <span>Full name</span>
                      <input value={lead.name} onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" />
                    </label>
                    <label>
                      <span>Phone number</span>
                      <input type="tel" inputMode="numeric" maxLength={10} value={lead.phone} onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit phone number" />
                    </label>
                    <button type="button" className="gold-button" disabled={!lead.name.trim() || !/^\d{10}$/.test(lead.phone)} onClick={() => handleLeadSubmit("property-detail")}>Request callback <Arrow /></button>
                    {leadStatus && <p className="lead-error">{leadStatus}</p>}
                  </>}
                </div>

                <div className="detail-contact-actions">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp Advisor</a>
                  <a href="tel:+919769017399">Call +91 9769017399</a>
                </div>
              </aside>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
