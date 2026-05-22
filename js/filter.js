document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const builderFilters = document.querySelectorAll('.filter-builder');
    const bhkFilters = document.querySelectorAll('.filter-bhk');
    const statusFilters = document.querySelectorAll('.filter-status');
    const sortSelect = document.getElementById('sortSelect');
    const propertyCards = document.querySelectorAll('.property-card');
    const propertyCountSpan = document.getElementById('propertyCount');
    const propertiesGrid = document.getElementById('propertiesGrid');

    function filterProperties() {
        const searchTerm = searchInput.value.toLowerCase();
        
        const selectedBuilders = Array.from(builderFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());
            
        const selectedBHKs = Array.from(bhkFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
            
        const selectedStatuses = Array.from(statusFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value.toLowerCase());

        let visibleCount = 0;

        propertyCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const location = card.querySelector('.card-location').textContent.toLowerCase();
            const builder = card.getAttribute('data-builder').toLowerCase();
            const bhks = card.getAttribute('data-bhk').split(',');
            const status = card.getAttribute('data-status').toLowerCase();

            // Search Match
            const matchesSearch = title.includes(searchTerm) || location.includes(searchTerm);

            // Builder Match
            const matchesBuilder = selectedBuilders.length === 0 || selectedBuilders.includes(builder);

            // BHK Match
            const matchesBHK = selectedBHKs.length === 0 || selectedBHKs.some(bhk => bhks.includes(bhk));

            // Status Match
            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(status);

            if (matchesSearch && matchesBuilder && matchesBHK && matchesStatus) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        propertyCountSpan.textContent = visibleCount;
    }

    function sortProperties() {
        const sortValue = sortSelect.value;
        const cardsArray = Array.from(propertyCards);

        cardsArray.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute('data-price'));
            const priceB = parseFloat(b.getAttribute('data-price'));

            if (sortValue === 'price-low') {
                return priceA - priceB;
            } else if (sortValue === 'price-high') {
                return priceB - priceA;
            }
            // Default to DOM order (relevance)
            return 0;
        });

        // Re-append to grid
        cardsArray.forEach(card => propertiesGrid.appendChild(card));
    }

    // Event Listeners
    if (searchInput) searchInput.addEventListener('keyup', filterProperties);
    builderFilters.forEach(cb => cb.addEventListener('change', filterProperties));
    bhkFilters.forEach(cb => cb.addEventListener('change', filterProperties));
    statusFilters.forEach(cb => cb.addEventListener('change', filterProperties));
    
    if (sortSelect) sortSelect.addEventListener('change', sortProperties);

    // Initial call
    filterProperties();
});