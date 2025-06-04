import React from 'react';

const testimonials = [
  {
    id: 1,
    quote: "ShaktiPath has transformed how I move around the city. I can now identify safer routes and avoid high-risk areas, giving me confidence to travel independently.",
    name: "Priya Sharma",
    title: "Graduate Student",
    avatar: "https://images.pexels.com/photos/1727273/pexels-photo-1727273.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 2,
    quote: "As someone who often works late shifts, this app has been a game-changer. The safety-scored routes help me make informed decisions about my journey home.",
    name: "Ananya Patel",
    title: "IT Professional",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 3,
    quote: "I recommend ShaktiPath to all my female colleagues. The real-time crime alerts and safety information have made me feel more secure in unfamiliar neighborhoods.",
    name: "Deepika Reddy",
    title: "Healthcare Worker",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">What Our Users Say</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Join thousands of women who are using ShaktiPath to navigate their cities with confidence.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <blockquote className="text-gray-600 text-center mb-4">
                "{testimonial.quote}"
              </blockquote>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-blue-700 text-sm">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;