import React from 'react';
import { Instagram, Github } from 'lucide-react';

const teamMembers = [
  {
    name: 'Manas',
    role: 'Lead Developer',
    photo: '/assets/manas2.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com/mannas006',
  },
  {
    name: 'Anirban',
    role: 'Developer',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
  },
  {
    name: 'Ananda',
    role: 'Content Manager',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
  },
  {
    name: 'Nowshin',
    role: 'Content Manager',
    photo: 'https://i.pinimg.com/564x/8b/1a/94/8b1a9469971816194228191111222222.jpg',
    instagram: 'https://www.instagram.com',
    github: 'https://github.com',
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">About Us</h1>
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">Our Story</h2>
          <div className="prose prose-sm md:prose-lg text-gray-700">
            <p>
              EduPapers was founded with a simple yet powerful mission: to make quality educational resources accessible to all students. We recognized the challenges students face in preparing for exams, particularly the difficulty in finding reliable and relevant past question papers.
            </p>
            <p>
              Our journey began with a small team of educators and developers who shared a passion for improving the learning experience. We set out to create a platform that not only provides access to these valuable resources but also fosters a community of learners.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">Our Mission</h2>
          <div className="prose prose-sm md:prose-lg text-gray-700">
            <p>
              Our mission is to empower students by providing them with the tools and resources they need to succeed academically. We are committed to offering a comprehensive collection of past question papers, making exam preparation more effective and less stressful.
            </p>
            <p>
              We strive to create a user-friendly platform that is accessible to all, regardless of their background or location. We believe that education is a fundamental right, and we are dedicated to supporting students in their pursuit of knowledge.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4"
                />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-gray-600 text-center mb-2">{member.role}</p>
                <div className="flex space-x-4">
                  {member.instagram && (
                    <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600">
                      <Instagram className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600">
                      <Github className="h-5 w-5 sm:h-6 sm:w-6" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
