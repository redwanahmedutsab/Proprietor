const MapView = ({lat, lng, address, city}) => {
    if (!lat || !lng) return null;

    const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

    return (
        <div className="map-view-wrap">
            <iframe
                title={`Map — ${address}, ${city}`}
                src={mapSrc}
                className="map-iframe"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-address-bar">
                <span>📍</span>
                <span>{address}, {city}</span>
                <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-open-link"
                >
                    Open in Maps ↗
                </a>
            </div>
        </div>
    );
};

export default MapView;
