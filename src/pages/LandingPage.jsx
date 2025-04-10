import React, { useState } from 'react';
import AuthModal from '../components/AuthModal';

const LandingPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="pt-6 pb-4 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 relative">
              <div className="absolute inset-0 bg-[#D4FF56] rounded-sm rotate-45"></div>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-black">S</div>
            </div>
            <span className="text-2xl font-bold text-white">SkillStream</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="#courses" className="text-white hover:text-[#D4FF56] transition">Courses</a>
            <a href="#features" className="text-white hover:text-[#D4FF56] transition">Features</a>
            <a href="#pricing" className="text-white hover:text-[#D4FF56] transition">Pricing</a>
            <a href="#testimonials" className="text-white hover:text-[#D4FF56] transition">Testimonials</a>
          </div>
          
          <div>
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition"
            >
              Start Learning
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 md:px-8 lg:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-white">
                Master New Skills with Expert-Led Courses
              </h1>
              <p className="text-lg text-gray-100 mb-8 max-w-lg">
                Join thousands of learners worldwide and unlock your potential with our comprehensive online courses. Learn at your own pace, from anywhere.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-[#D4FF56] text-black font-medium rounded hover:bg-[#D4FF56]/90 transition">
                  Explore Courses
                </button>
              </div>
              
              <div className="mt-12">
                <p className="text-gray-400 mb-4">Trusted by learners worldwide</p>
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="text-gray-400">100,000+ Students</div>
                  <div className="text-gray-400">500+ Courses</div>
                  <div className="text-gray-400">4.8/5 Rating</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative flex justify-center">
                <div className="absolute -inset-4 border-2 border-[#D4FF56]/30 rounded-full"></div>
                <div className="absolute -inset-16 border border-[#D4FF56]/20 rounded-full"></div>
                <div className="absolute -inset-28 border border-[#D4FF56]/10 rounded-full"></div>
                <div className="relative bg-black p-4 rounded-full border-4 border-[#D4FF56]">
                  <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#D4FF56]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                      <path d="M18 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M2 12L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 6L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 22L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="inline-block bg-[#D4FF56] px-4 py-1 rounded text-black font-medium mb-4">
              Features
            </div>
            <p className="text-gray-300 max-w-3xl">
              Discover what makes SkillStream the perfect platform for your learning journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Expert Instructors",
                icon: "👨‍🏫",
                color: "#D4FF56",
                dark: true
              },
              {
                title: "Interactive Learning",
                icon: "💡",
                color: "#D4FF56",
                dark: false
              },
              {
                title: "Progress Tracking",
                icon: "📊",
                color: "black",
                dark: true
              },
              {
                title: "Community Support",
                icon: "🤝",
                color: "#D4FF56",
                dark: false
              },
              {
                title: "Mobile Learning",
                icon: "📱",
                color: "#D4FF56",
                dark: false
              },
              {
                title: "Certification",
                icon: "🎓",
                color: "black",
                dark: true
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`p-6 rounded-lg ${feature.dark 
                  ? 'bg-black border border-gray-800 text-white' 
                  : 'bg-[#D4FF56] text-black'}`}
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="text-3xl">{feature.icon}</div>
                  <button className={`p-2 rounded-full ${feature.dark 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-[#D4FF56]/50 hover:bg-[#D4FF56]'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <div className="mt-6">
                  <button className={`flex items-center gap-2 ${feature.dark 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-black/70 hover:text-black'} transition`}>
                    <span>Learn more</span>
                    <span className="text-xl">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-4 md:px-8 lg:px-12 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#D4FF56]"></div>
              <span className="text-[#D4FF56] font-medium">What Our Students Say</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Student Testimonials</h2>
          </div>
          
          <div className="p-12 bg-black rounded-lg border border-gray-800">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex mb-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-4 h-4 bg-[#D4FF56] rounded-full mx-1"></div>
                  ))}
                </div>
                <p className="text-lg text-white mb-6">
                  "SkillStream has transformed my learning experience. The courses are well-structured, and the instructors are incredibly knowledgeable. I've gained practical skills that I use in my daily work."
                </p>
                <div>
                  <p className="text-white font-bold">Sarah Johnson</p>
                  <p className="text-gray-400">Web Development Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 md:px-8 lg:px-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="h-8 w-8 relative">
                <div className="absolute inset-0 bg-[#D4FF56] rounded-sm rotate-45"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-black">S</div>
              </div>
              <span className="text-2xl font-bold text-white">SkillStream</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Courses</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Instructors</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Subscribe</h3>
              <p className="text-gray-400 mb-4">Get the latest updates and course recommendations</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-gray-900 border border-gray-800 text-white px-4 py-2 rounded-l w-full focus:outline-none focus:ring-1 focus:ring-[#D4FF56]"
                />
                <button className="bg-[#D4FF56] text-black px-4 py-2 rounded-r hover:bg-[#D4FF56]/90 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} SkillStream. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
