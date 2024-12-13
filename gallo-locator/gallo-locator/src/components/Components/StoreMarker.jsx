import React from 'react';
import PropTypes from 'prop-types';

const StoreMarker = ({ imageUrl, onClick, businessName }) => {
    const markerRef = React.useRef(null);

    const styles = {
        marker: {
            position: 'relative',
            backgroundImage: `url(${imageUrl || 'https://via.placeholder.com/50'})`,
            backgroundSize: 'cover',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '2px solid #FF4444',
            cursor: 'pointer',
        },
        tooltip: {
            position: 'absolute',
            bottom: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FFF',
            color: '#333',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            visibility: 'hidden',
            opacity: 0,
            transition: 'visibility 0s, opacity 0.2s ease-in-out',
            zIndex: 10,
        },
        tooltipVisible: {
            visibility: 'visible',
            opacity: 1,
        },
    };

    const handleMouseEnter = () => {
        if (markerRef.current) {
            const tooltip = markerRef.current.querySelector('.tooltip');
            Object.assign(tooltip.style, styles.tooltipVisible);
        }
    };

    const handleMouseLeave = () => {
        if (markerRef.current) {
            const tooltip = markerRef.current.querySelector('.tooltip');
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = 0;
        }
    };

    return (
        <div
            ref={markerRef}
            style={styles.marker}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="tooltip" style={styles.tooltip}>
                {businessName}
            </div>
        </div>
    );
};

StoreMarker.propTypes = {
    imageUrl: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    businessName: PropTypes.string.isRequired,
};

export default StoreMarker;
