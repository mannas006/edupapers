import React, { useState, useRef } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import { motion } from "framer-motion";

const TARGET_TEXT = "Submit";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;
const CHARS = "!@#$%^&*():{};|,.<>/?";

const EncryptButton = ({ submitting, isAnimating, text }: { submitting: boolean, isAnimating: boolean, text: string }) => {
  return (
    <motion.button
      type="submit"
      whileTap={{
        scale: 0.975,
      }}
      disabled={submitting}
      className={`group relative overflow-hidden rounded-md border-[1px] border-gray-300 bg-gray-100 px-3 py-1 font-mono font-medium uppercase text-gray-700 transition-colors hover:bg-gray-200 hover:text-indigo-600 ${submitting ? 'opacity-70 cursor-wait' : ''}`}
    >
      <div className="relative z-10 flex items-center gap-2">
        <span className="text-sm">{text}</span>
      </div>
      <motion.span
        initial={{
          y: "100%",
        }}
        animate={{
          y: isAnimating ? "-100%" : "100%",
        }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 1,
          ease: "linear",
        }}
        className="duration-300 absolute inset-0 z-0 scale-125 bg-gradient-to-t from-indigo-400/0 from-40% via-indigo-400/100 to-indigo-400/0 to-60% opacity-0 transition-opacity group-hover:opacity-100"
      />
    </motion.button>
  );
};

function ContactForm() {
  const [state, handleSubmit] = useForm("mnnjvgny");
  const intervalRef = useRef<any>(null);
  const [text, setText] = useState(TARGET_TEXT);
  const [isAnimating, setIsAnimating] = useState(false);

  const scramble = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let pos = 0;

    intervalRef.current = setInterval(() => {
      const scrambled = TARGET_TEXT.split("")
        .map((char, index) => {
          if (pos / CYCLES_PER_LETTER > index) {
            return char;
          }

          const randomCharIndex = Math.floor(Math.random() * CHARS.length);
          const randomChar = CHARS[randomCharIndex];

          return randomChar;
        })
        .join("");

      setText(scrambled);
      pos++;

      if (pos >= TARGET_TEXT.length * CYCLES_PER_LETTER) {
        stopScramble();
      }
    }, SHUFFLE_TIME);
  };

  const stopScramble = () => {
    clearInterval(intervalRef.current || undefined);
    setText(TARGET_TEXT);
    setIsAnimating(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    scramble();
    await handleSubmit(e);
  };

  if (state.succeeded) {
    return (
      <div className="text-center">
        <p className="text-green-600 font-semibold text-lg mb-4">Thanks for your message!</p>
        <p className="text-gray-700">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Send us a message</h2>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Your Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          className="input-field"
          required
        />
        <ValidationError
          prefix="Name"
          field="name"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className="input-field"
          required
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="message" className="form-label">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className="input-field"
          rows={5}
          required
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
          className="text-red-500 text-sm mt-1"
        />
      </div>
      <div>
        <EncryptButton submitting={state.submitting} isAnimating={isAnimating} text={text} />
      </div>
    </form>
  );
}

export default function ContactUs() {
  return (
    <div className="min-h-[80vh] bg-gray-100">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <ContactForm />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">Company Information</h2>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                <span>Kolkata, Salt Lake</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-2 text-gray-500" />
                <span>webnexalabs@gmail.com</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Globe className="h-5 w-5 mr-2 text-gray-500" />
                <a href="https://webnexalabs.onrender.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                  WebNexaLabs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
