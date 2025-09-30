import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  image: string;
  propertyType: string;
}

const TestimonialsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "María González",
      location: "Medellín",
      rating: 5,
      text: "Excelente servicio! Encontré el apartamento perfecto para mi familia en menos de una semana. El equipo de Coworking Inmobiliario fue muy profesional y me acompañaron en todo el proceso.",
      image: "/img/testimonial1.jpg",
      propertyType: "Apartamento"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      location: "Envigado",
      rating: 5,
      text: "Vendí mi casa mucho más rápido de lo que esperaba. El avalúo fue justo y el marketing que hicieron fue excepcional. Totalmente recomendado.",
      image: "/img/testimonial2.jpg",
      propertyType: "Casa"
    },
    {
      id: 3,
      name: "Ana María López",
      location: "Sabaneta",
      rating: 5,
      text: "El proceso de arriendo fue muy transparente y sin complicaciones. Me explicaron todo claramente y me sentí segura en todo momento. ¡Gracias por hacer realidad mi sueño!",
      image: "/img/testimonial3.jpg",
      propertyType: "Apartamento"
    },
    {
      id: 4,
      name: "Juan David Martínez",
      location: "Itagüí",
      rating: 5,
      text: "Después de buscar por meses, finalmente encontré la oficina perfecta para mi negocio. El asesoramiento fue clave para tomar la mejor decisión.",
      image: "/img/testimonial4.jpg",
      propertyType: "Oficina"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // Change testimonial every 6 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Lo que dicen nuestros <span className="text-green-600">clientes</span>
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Historias reales de personas que confiaron en nosotros
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-green-200 dark:border-green-700"
                      onError={(e) => {
                        // Fallback to placeholder
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonials[currentIndex].name)}&background=10b981&color=fff&size=128`;
                      }}
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                      <Quote className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Rating */}
                  <div className="flex justify-center md:justify-start mb-2">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-3 italic">
                    "{testimonials[currentIndex].text}"
                  </blockquote>

                  {/* Author Info */}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                      {testimonials[currentIndex].location} • {testimonials[currentIndex].propertyType}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full p-2 shadow-lg transition-colors duration-200"
            aria-label="Testimonial anterior"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-full p-2 shadow-lg transition-colors duration-200"
            aria-label="Siguiente testimonial"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Ir al testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;