import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

import campusEntrance from "@/assets/campus-entrance.jpg";
import collegeGate from "@/assets/college-gate.jpeg";
import studentsGroup from "@/assets/students-group.jpg";
import studentsGossiping from "@/assets/students-gossiping.jpg";

const backgrounds = [campusEntrance, studentsGossiping, collegeGate, studentsGroup];
const thumbnails = [studentsGossiping, studentsGroup, collegeGate, campusEntrance];

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentBg, setCurrentBg] = useState(0);

  const nextBg = useCallback(() => {
    setCurrentBg((prev) => (prev + 1) % backgrounds.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextBg, 3000);
    return () => clearInterval(interval);
  }, [nextBg]);

  const handleExplore = () => {
    navigate(user ? "/dashboard" : "/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero - Full viewport */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Sliding backgrounds */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBg}
            src={backgrounds[currentBg]}
            alt="Campus"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-white/80 md:text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Samarth Rural Educational Institute's
          </motion.p>

          <motion.h1
            className="mb-2 font-display text-6xl font-bold text-white md:text-8xl lg:text-9xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          >
            SAMARTH
          </motion.h1>

          <motion.h2
            className="mb-2 text-2xl font-semibold text-primary md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            College of Engineering & Management
          </motion.h2>

          {/* Animated underline */}
          <motion.div
            className="mb-6 h-0.5 rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          />

          <motion.p
            className="mb-10 max-w-lg text-sm text-white/70 md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Empowering Future Engineers with Excellence & Innovation
          </motion.p>

          {/* Thumbnail gallery */}
          <motion.div
            className="mb-10 flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            {thumbnails.map((thumb, i) => (
              <motion.div
                key={i}
                className="h-16 w-16 overflow-hidden rounded-xl border-2 border-white/20 shadow-lg backdrop-blur-sm md:h-20 md:w-20"
                whileHover={{ scale: 1.15, borderColor: "rgba(255,255,255,0.6)" }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={thumb}
                  alt={`Campus life ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Explore Campus button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            <Button
              size="lg"
              onClick={handleExplore}
              className="gap-3 rounded-full bg-primary px-10 py-6 text-lg font-semibold text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50"
            >
              Explore Campus <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Dot indicators */}
          <motion.div
            className="mt-8 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            {backgrounds.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBg(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentBg
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="mb-12 text-center text-3xl font-bold text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Everything You Need
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Calendar, title: "Campus Events", desc: "Never miss an event. From sports to cultural fests, stay updated with all campus activities." },
              { icon: Users, title: "Communities", desc: "Join clubs and communities that match your interests. Connect with like-minded peers." },
              { icon: MessageSquare, title: "Student Pulse", desc: "Share updates, thoughts, and connect with the entire campus community in real-time." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="rounded-xl border bg-card p-6 text-center shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px hsl(199 89% 48% / 0.2)" }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <span className="font-semibold text-primary">SCOE&M Campus Connect</span>
          <p className="mt-2 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Samarth College of Engineering & Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
