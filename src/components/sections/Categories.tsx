
export const Categories = () => {
  const categories = [
    { title: "Exotic Destinations", count: "15,000+" },
    { title: "Luxury Hotels & Resorts", count: "12,000+" },
    { title: "Private Jets & Yachts", count: "8,500+" },
    { title: "Fine Dining", count: "10,000+" },
    { title: "Luxury Cars", count: "9,200+" },
    { title: "Fashion & Jewelry", count: "11,500+" },
    { title: "Wellness & Spa", count: "7,800+" },
    { title: "Architecture & Design", count: "13,000+" },
    { title: "Events & Galas", count: "6,500+" },
    { title: "Adventure & Sports", count: "8,900+" },
    { title: "Art & Culture", count: "9,600+" },
    { title: "Lifestyle & Beauty", count: "12,800+" },
    { title: "Fitness & Gym", count: "8,400+" },
    { title: "Premium Lifestyle", count: "9,200+" }
  ];

  return (
    <section className="categories bg-[#1a1a1a] text-white py-24" id="categories">
      <div className="container mx-auto px-5">
        <h2 className="section-title text-4xl md:text-5xl text-center font-bold mb-16 text-white animate-on-scroll">Luxury Categories</h2>
        
        <div className="categories-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-12">
          {categories.map((category, index) => (
            <div key={index} className="category-card bg-gradient-to-r from-[#2d2d2d] to-[#1a1a1a] p-6 rounded-xl text-center transition-all hover:-translate-y-1 hover:border-[#ffd700] border border-[rgba(255,215,0,0.2)] relative overflow-hidden animate-on-scroll">
              <h3 className="text-xl font-bold mb-2 text-[#ffd700]">{category.title}</h3>
              <p className="category-count opacity-80">{category.count} Videos</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
