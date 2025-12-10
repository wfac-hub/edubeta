
import React from 'react';

interface BirthdayIconProps {
    size?: number;
    className?: string;
}

/**
 * Renders an animated "Partying Face" emoji using Google Noto Emoji assets.
 */
const BirthdayIcon: React.FC<BirthdayIconProps> = ({ size = 30, className = '' }) => {
    return (
        <img 
            src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.gif" 
            alt="Cumpleaños" 
            style={{ width: size, height: size }}
            className={`drop-shadow-md select-none pointer-events-none ${className}`}
        />
    );
};

export default BirthdayIcon;
