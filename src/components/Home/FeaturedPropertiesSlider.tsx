import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import { getFeaturedProperties } from '../../lib/supabase';

const FeaturedPropertiesSlider: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % properties.length);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [properties]);

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedProperties();
      if (data && data.length > 0) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error loading featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (property: Property) => {
    navigate(`/property/${property.id}`);
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  const currentProperty = properties[currentIndex];
  const imageUrl = currentProperty.cover_image || (currentProperty.images && currentProperty.images[0]);

  return (
    <div className="w-full mt-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="relative overflow-hidden rounded-xl shadow-2xl cursor-pointer w-full"
        onClick={() => handleImageClick(currentProperty)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={imageUrl}
            alt={currentProperty.title}
            className="w-full h-[340px] md:h-[400px] lg:h-[530px] object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-property.jpg'; // Fallback image
            }}
          />
        </AnimatePresence>

        {/* Overlay with property info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg md:text-xl font-bold mb-1">{currentProperty.title}</h3>
            <p className="text-sm md:text-base opacity-90">{currentProperty.location}</p>
            <p className="text-lg font-semibold mt-1">
              ${currentProperty.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {properties.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturedPropertiesSlider;