import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';
import './HomePageTailwind.css';
import '../components/buttons/buttons.css';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import Chatbot from '../components/Chatbot/Chatbot';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import '../components/Dashboard/ExpertDashboard';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { setDoc, serverTimestamp } from 'firebase/firestore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

const expertFieldsVariants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden' },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
};

const HomePage = ({ userEmail }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [userType, setUserType] = useState('normal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [expertise, setExpertise] = useState('Diet');
  const [clientFee, setClientFee] = useState('');
  const [certification, setCertification] = useState(null);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState({});
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(userEmail || null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const testimonials = [
    {
      id: 1,
      text: "FitnGro's AI-powered home training keeps me competition-ready. Its real-time movement analysis ensures precise form, and the browser-based platform allows training anywhere. It's like having a 24/7 personal coach for consistent, professional-grade results",
      image: "/customer-1.png",
      username: "Abeesh Selvan",
      role: "State-Level Javelin Thrower, University Games Champion"
    },
    {
      id: 2,
      text: "FitnGro revolutionizes fitness training for our institution. Its expert-guided plans and AI-powered workouts are accessible to all, with browser-based technology eliminating app download barriers. The real-time form correction ensures proper technique, making it ideal for both beginners and expert trainers.",
      image: "/customer-2.jpeg",
      username: "Vasanth",
      role: "Disha School, Head Of Physical Education Department"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRotate) {
        setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRotate, testimonials.length]);

  const nextTestimonial = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setAutoRotate(true), 30000);
  };

  const prevTestimonial = () => {
    setAutoRotate(false);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setAutoRotate(true), 30000);
  };

  const solutions = [
    {
      icon: '🌐',
      title: 'No App Downloads Required',
      description: 'Access our complete fitness platform directly through your web browser. No storage space needed, no app store downloads, and instant access from any device.',
      color: darkMode ? 'bg-purple-900' : 'bg-blue-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-blue-600'
    },
    {
      icon: '⚡',
      title: 'Low Battery & Network Usage',
      description: 'Our advanced browser-based processing minimizes battery drain and network consumption, allowing longer workout sessions without performance issues.',
      color: darkMode ? 'bg-purple-900' : 'bg-green-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-green-600'
    },
    {
      icon: '📱',
      title: 'Works on Any Device',
      description: 'Compatible with smartphones, tablets, laptops, and desktops. No specific hardware requirements - just a camera and internet connection.',
      color: darkMode ? 'bg-purple-900' : 'bg-purple-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-purple-600'
    },
    {
      icon: '🚀',
      title: 'Ready in Seconds',
      description: 'No waiting for downloads or installations. Simply visit our website, set up your device, and start your workout immediately with full AI-powered monitoring.',
      color: darkMode ? 'bg-purple-900' : 'bg-yellow-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-yellow-600'
    },
    {
      icon: '🧠',
      title: 'Smart AI Processing',
      description: 'Advanced pose detection and rep counting happen in real-time directly in your browser, providing instant feedback without external servers.',
      color: darkMode ? 'bg-purple-900' : 'bg-indigo-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-indigo-600'
    },
    {
      icon: '🔒',
      title: 'Your Data Stays Local',
      description: 'All processing happens on your device. Your workout videos and personal data never leave your browser, ensuring complete privacy and security.',
      color: darkMode ? 'bg-purple-900' : 'bg-red-50',
      iconColor: darkMode ? 'text-purple-300' : 'text-red-600'
    }
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const storage = getStorage();

  useEffect(() => {
    const fetchApprovedExperts = async () => {
      try {
        const response = await fetch('https://fitngro-backend-dsem.onrender.com/approved-experts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch experts');
        const data = await response.json();
        setExperts(data);
      } catch (error) {
        console.error('Error fetching experts:', error);
        setMessages(prev => [
          ...prev,
          { text: `Failed to load experts: ${error.message}`, sender: 'bot' },
        ]);
      }
    };

    fetchApprovedExperts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed - User:', user?.email);
      setCurrentUser(user?.email || null);

      if (user) {
        try {
          console.log('Fetching expert document for email:', user.email);
          const expertDocRef = doc(db, 'experts', user.email);
          const expertDocSnap = await getDoc(expertDocRef);
          console.log('Expert document exists:', expertDocSnap.exists());
          setCurrentUserType(expertDocSnap.exists() ? 'expert' : 'normal');
        } catch (error) {
          console.error('Error checking expert status:', error);
          console.log('Error code:', error.code);
          console.log('Error message:', error.message);
          if (error.code === 'permission-denied') {
            console.log('Permission denied for experts document, setting user as normal');
            setCurrentUserType('normal');
          } else {
            setErrors({ form: `Error checking user type: ${error.message}` });
          }
        }
      } else {
        setCurrentUserType(null);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (authMode === 'signup') {
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (authMode === 'signup' && userType === 'expert') {
      if (!name || name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
      if (!age) newErrors.age = 'Age is required';
      else if (isNaN(age) || age < 18 || age > 100) newErrors.age = 'Age must be between 18 and 100';
      if (!specialist || specialist.trim().length < 2) newErrors.specialist = 'Specialist field is required';
      if (!expertise) newErrors.expertise = 'Expertise is required';
      if (!clientFee) newErrors.clientFee = 'Client fee is required';
      else if (isNaN(clientFee) || clientFee <= 0) newErrors.clientFee = 'Client fee must be a positive number';
      if (!certification) newErrors.certification = 'Certificate file is required';
      else if (!certification.name.toLowerCase().endsWith('.pdf')) newErrors.certification = 'Certificate must be a PDF';
      else if (certification.size > 5 * 1024 * 1024) newErrors.certification = 'Certificate must be less than 5MB';
      if (!bio || bio.trim().length < 10) newErrors.bio = 'Bio must be at least 10 characters';
      else if (bio.length > 500) newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendPasswordReset = async () => {
    try {
      if (!forgotPasswordEmail) {
        setErrors({ form: 'Please enter your email address' });
        return;
      }

      const response = await fetch('https://fitngro-backend-dsem.onrender.com/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send password reset email');
      }

      alert('Password reset email sent successfully! Please check your inbox.');
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      console.error('Password reset failed:', error);
      setErrors({ form: `Failed to send reset email: ${error.message}` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (authMode === 'signup' && userType === 'expert') {
      try {
        let idToken;
        if (auth.currentUser) {
          if (auth.currentUser.email !== email) {
            throw new Error('Current user email does not match the provided email');
          }
          idToken = await auth.currentUser.getIdToken();
        } else {
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          if (signInMethods.length > 0) {
            try {
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              idToken = await userCredential.user.getIdToken();
            } catch (signInError) {
              throw new Error('Invalid password for existing email');
            }
          } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            idToken = await userCredential.user.getIdToken();
          }
        }

        const formData = new FormData();
        formData.append('user_email', email);
        formData.append('name', name);
        formData.append('age', parseInt(age));
        formData.append('specialist', specialist);
        formData.append('expertise', expertise);
        formData.append('client_fee', parseFloat(clientFee));
        formData.append('certification', certification);
        formData.append('bio', bio);

        const signupResponse = await fetch('https://fitngro-backend-dsem.onrender.com/expert-signup', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}` },
          body: formData,
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          throw new Error(errorData.detail || 'Expert signup failed');
        }

        const responseData = await signupResponse.json();
        const certificateUrl = responseData.certificate_url;
        const emailResponse = await fetch('https://fitngro-backend-dsem.onrender.com/send-admin-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'fitngro@gmail.com',
            subject: 'New Expert Signup Request',
            body: `
            New expert signup request:
            Email: ${email}
            Name: ${name}
            Age: ${age}
            Specialist: ${specialist}
            Expertise: ${expertise}
            Client Fee: ${clientFee}
            Bio: ${bio}
            Certificate URL: ${certificateUrl}
          `,
          }),
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send admin email, but registration succeeded');
        }

        setCurrentUser(email);
        setShowAuth(false);
        setEmail('');
        setPassword('');
        setName('');
        setAge('');
        setSpecialist('');
        setExpertise('Diet');
        setClientFee('');
        setCertification(null);
        setBio('');
        setErrors({});
        alert('Expert registration submitted successfully! You will be notified once approved.');
      } catch (error) {
        console.error('Expert Signup Failed:', error);
        setErrors({ form: `Signup Error: ${error.message}` });
      }
    } else if (authMode === 'login' && userType === 'expert') {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const expertDocRef = doc(db, 'experts', email);
        const expertDocSnap = await getDoc(expertDocRef);

        if (!expertDocSnap.exists()) {
          throw new Error('No expert profile found for this email');
        }

        const expertData = expertDocSnap.data();

        if (!expertData.approved) {
          throw new Error('Your expert account is still pending admin approval');
        }

        setCurrentUser(email);
        setShowAuth(false);
        setEmail('');
        setPassword('');
        setErrors({});

        navigate('/expert-dashboard', { state: { expertData } });
      } catch (error) {
        console.error('Expert Login Failed:', error);
        setErrors({ form: `Login Error: ${error.message}` });
      }
    } else {
      // Normal user login or signup
      try {
        let userCredential;
        if (authMode === 'signup') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        }

        // Call the /signin endpoint to add user to premiumUsers
        const idToken = await userCredential.user.getIdToken();
        const signinResponse = await fetch('https://fitngro-backend-dsem.onrender.com/signin', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!signinResponse.ok) {
          const errorData = await signinResponse.json();
          throw new Error(errorData.detail || 'Failed to add user to premiumUsers');
        }

        setCurrentUser(email);
        setShowAuth(false);
        setEmail('');
        setPassword('');
        setErrors({});
        navigate('/dashboard');
      } catch (error) {
        console.error(`${authMode === 'signup' ? 'Signup' : 'Login'} Failed:`, error);
        setErrors({ form: `${authMode === 'signup' ? 'Signup' : 'Login'} Error: ${error.message}` });
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const handleFirebaseSignIn = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const signinResponse = await fetch('https://fitngro-backend-dsem.onrender.com/signin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!signinResponse.ok) {
        const errorData = await signinResponse.json();
        throw new Error(errorData.detail || 'Failed to add user to premiumUsers');
      }

      setCurrentUser(result.user.email);
      setShowAuth(false);
    } catch (error) {
      console.error('Firebase Sign-In Failed:', error);
      alert(`Sign-In Error: ${error.message}`);
    }
  };

  const handleGeneratePlan = async (formData) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      console.log("Request payload:", {
        user_email: currentUser,
        days: formData.days || 21,
        focus: formData.focus || formData.fitness_goal || "strength"
      });
      console.log("Authorization header:", `Bearer ${idToken}`);
      const response = await fetch('https://fitngro-backend-dsem.onrender.com/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          user_email: currentUser,
          days: formData.days || 21,
          focus: formData.focus || formData.fitness_goal || "strength",
        }),
      });
      if (!response.ok) throw new Error(`Failed to generate plan: ${response.statusText}`);
      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { text: 'Workout plan generated successfully!', sender: 'bot' },
      ]);
      navigate('/dashboard');
    } catch (error) {
      console.error("Plan generation failed:", error);
      setMessages(prev => [
        ...prev,
        { text: `Failed to generate plan: ${error.message}`, sender: 'bot' },
      ]);
    }
  };

  const toggleHamburgerMenu = () => {
    setIsHamburgerOpen(!isHamburgerOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const plans = [
    {
      type: 'Self-Guided',
      title: 'AI Powered Fitness',
      price: 'Free',
      description: 'Smart technology guidance without human experts',
      features: [
        'AI-powered workout plans',
        'Browser-based pose detection',
        'Automated rep counting',
        'Basic progress tracking',
        'Community support forum',
        'Email support (72h response)'
      ],
      cta: 'Start Free',
      popular: false,
      bgColor: darkMode ? 'bg-gray-800' : 'bg-gray-50',
      borderColor: darkMode ? 'border-purple-500' : 'border-gray-200',
      textColor: darkMode ? 'text-white' : 'text-gray-700'
    },
    {
      type: 'Expert-Guided',
      title: 'Precision Training',
      price: '$49',
      period: '/month',
      description: '1-on-1 coaching with certified fitness experts',
      features: [
        'Personalized workout plans',
        'Live video sessions with experts',
        'Form correction in real-time',
        'Nutrition planning',
        'Weekly progress reviews',
        '24/7 priority support',
        'Customized recovery plans',
        'Advanced analytics dashboard'
      ],
      cta: 'Get Started',
      popular: true,
      bgColor: darkMode ? 'bg-purple-900' : 'bg-blue-50',
      borderColor: darkMode ? 'border-purple-400' : 'border-blue-400',
      textColor: darkMode ? 'text-white' : 'text-blue-700'
    }
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className={`min-h-screen ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900 text-white" : "bg-white text-gray-900"}`}>
        <motion.div className="property-1variant3" variants={containerVariants} initial="hidden" animate="visible">
          {currentUser && <Chatbot userEmail={currentUser} onGeneratePlan={handleGeneratePlan} setMessages={setMessages} />}

          {/* Left Navbar */}
          <motion.div className={`navbar ${darkMode ? "bg-gray-900" : "bg-white"}`} variants={containerVariants}>
            <motion.div className="navbar-child" variants={itemVariants} />
            <motion.div className={`about ${darkMode ? "text-white" : "text-black"}`} variants={itemVariants}>About</motion.div>
            <motion.div className={`experts ${darkMode ? "text-white" : "text-black"}`} variants={itemVariants} onClick={() => navigate('/experts')}>
              Experts
            </motion.div>
            {currentUserType === 'expert' && (
              <motion.div className={`profile ${darkMode ? "text-white" : "text-black"}`} variants={itemVariants} onClick={() => navigate('/expert-dashboard')}>
                Profile
              </motion.div>
            )}
            <motion.div className="login-button-navbar" variants={itemVariants}>
              <motion.div className="navbar-child" variants={itemVariants} />
              <button
                onClick={toggleDarkMode}
                className="dark-mode-toggle"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {!currentUser ? (
                <motion.button
                  className={`login-button-navbar1 ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-black"}`}
                  variants={itemVariants}
                  onClick={() => setShowAuth(true)}
                >
                  Login
                </motion.button>
              ) : (
                <motion.button
                  className={`logout-button-navbar ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-black"}`}
                  variants={itemVariants}
                  onClick={handleSignOut}
                >
                  Logout
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Right Navbar with Hamburger Menu */}
          <motion.div className={`right-navbar ${darkMode ? "bg-gray-900" : "bg-white"}`} variants={containerVariants}>
            <motion.button
              className="hamburger-button"
              variants={itemVariants}
              onClick={toggleHamburgerMenu}
              aria-label="Menu"
            >
              <div className={`hamburger-line ${darkMode ? "bg-white" : "bg-black"}`} />
              <div className={`hamburger-line ${darkMode ? "bg-white" : "bg-black"}`} />
              <div className={`hamburger-line ${darkMode ? "bg-white" : "bg-black"}`} />
            </motion.button>
            {isHamburgerOpen && (
              <motion.div
                className={`hamburger-menu ${darkMode ? "bg-gray-800" : "bg-white"}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <motion.ul className="hamburger-menu-list">
                  <motion.li className="hamburger-menu-item">
                    <button
                      className={`hamburger-menu-button ${darkMode ? "text-white" : "text-black"}`}
                      onClick={() => {
                        navigate('/settings');
                        setIsHamburgerOpen(false);
                      }}
                    >
                      Settings
                    </button>
                  </motion.li>
                  {currentUser && (
                    <motion.li className="hamburger-menu-item">
                      <button
                        className={`hamburger-menu-button ${darkMode ? "text-white" : "text-black"}`}
                        onClick={() => {
                          navigate('/dashboard');
                          setIsHamburgerOpen(false);
                        }}
                      >
                        Dashboard
                      </button>
                    </motion.li>
                  )}
                  {currentUserType === 'expert' && (
                    <motion.li className="hamburger-menu-item">
                      <button
                        className={`hamburger-menu-button ${darkMode ? "text-white" : "text-black"}`}
                        onClick={() => {
                          navigate('/expert-dashboard');
                          setIsHamburgerOpen(false);
                        }}
                      >
                        Profile
                      </button>
                    </motion.li>
                  )}
                </motion.ul>
              </motion.div>
            )}
          </motion.div>

          {showAuth && (
            <div className={`auth-modal-overlay ${darkMode ? "bg-black bg-opacity-80" : "bg-black bg-opacity-50"}`}>
              <div className={`auth-modal-content ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                <button className="close-modal" onClick={() => setShowAuth(false)}>×</button>
                <h3 className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Impact, sans-serif'}}>
                  {authMode === 'signup' ? 'Join FitnGro Today' : 'Welcome to FitnGro'}
                </h3>
                
                <div className="user-type-selection">
                  <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>User Type</label>
                  <div className="user-type-options">
                    <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>
                      <input
                        type="radio"
                        value="normal"
                        checked={userType === 'normal'}
                        onChange={() => setUserType('normal')}
                        className="mr-2"
                      />
                      Normal User
                    </label>
                    <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>
                      <input
                        type="radio"
                        value="expert"
                        checked={userType === 'expert'}
                        onChange={() => setUserType('expert')}
                        className="mr-2"
                      />
                      Expert
                    </label>
                  </div>
                </div>

                {userType === 'normal' && (
                  <div className="google-login-container">
                    <button 
                      onClick={handleFirebaseSignIn} 
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-blue-600 hover:bg-blue-700"} text-white font-medium`}
                    >
                      Sign in with Google
                    </button>
                  </div>
                )}

                <div className={`auth-divider ${darkMode ? "text-gray-400" : "text-gray-600"}`}>or</div>

                <div className="scrollable-form-container">
                  <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                      <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`${errors.email ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                        placeholder="Enter your email"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      />
                      {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${errors.password ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                        placeholder="Enter your password"
                        style={{fontFamily: 'Inter, sans-serif'}}
                      />
                      {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {authMode === 'signup' && (
                      <div className="form-group">
                        <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`${errors.confirmPassword ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                          placeholder="Confirm your password"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                      </div>
                    )}

                    {authMode === 'login' && (
                      <div style={{textAlign: 'right', marginTop: '-10px'}}>
                        <button 
                          type="button" 
                          onClick={() => setShowForgotPassword(true)}
                          className={`${darkMode ? "text-purple-400 hover:text-purple-300" : "text-blue-600 hover:text-blue-800"} text-sm font-medium`}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    {showForgotPassword && (
                      <div className={`forgot-password-modal ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                        <h4 className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Impact, sans-serif', marginBottom: '15px'}}>Reset Your Password</h4>
                        <p className={darkMode ? "text-gray-300" : "text-gray-600"} style={{fontFamily: 'Inter, sans-serif', marginBottom: '20px'}}>
                          Enter your email to receive a password reset link
                        </p>
                        <div className="form-group">
                          <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Email Address</label>
                          <input
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black"}
                            style={{fontFamily: 'Inter, sans-serif'}}
                          />
                        </div>
                        {errors.form && <span className="error-message">{errors.form}</span>}
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                          <button 
                            type="button"
                            onClick={() => {
                              setShowForgotPassword(false);
                              setErrors({});
                            }}
                            className={`px-4 py-2 rounded-md ${darkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300"} font-medium`}
                          >
                            Cancel
                          </button>
                          <button 
                            type="button"
                            onClick={handleSendPasswordReset}
                            className={`px-4 py-2 rounded-md ${darkMode ? "bg-purple-700 text-white hover:bg-purple-800" : "bg-blue-600 text-white hover:bg-blue-700"} font-medium`}
                          >
                            Send Reset Link
                          </button>
                        </div>
                      </div>
                    )}

                    <AnimatePresence>
                      {authMode === 'signup' && userType === 'expert' && (
                        <motion.div
                          variants={expertFieldsVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Name</label>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className={`${errors.name ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              placeholder="Enter your full name"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Age</label>
                            <input
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className={`${errors.age ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              placeholder="Enter your age"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.age && <span className="error-message">{errors.age}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Specialist</label>
                            <input
                              type="text"
                              value={specialist}
                              onChange={(e) => setSpecialist(e.target.value)}
                              className={`${errors.specialist ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              placeholder="Enter your specialty"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.specialist && <span className="error-message">{errors.specialist}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Expertise</label>
                            <div style={{ display: 'flex', gap: '20px' }}>
                              <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>
                                <input
                                  type="radio"
                                  value="Diet"
                                  checked={expertise === 'Diet'}
                                  onChange={() => setExpertise('Diet')}
                                  className="mr-2"
                                />
                                Diet
                              </label>
                              <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>
                                <input
                                  type="radio"
                                  value="Fitness"
                                  checked={expertise === 'Fitness'}
                                  onChange={() => setExpertise('Fitness')}
                                  className="mr-2"
                                />
                                Fitness
                              </label>
                            </div>
                            {errors.expertise && <span className="error-message">{errors.expertise}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Client Fee (per session)</label>
                            <input
                              type="number"
                              value={clientFee}
                              onChange={(e) => setClientFee(e.target.value)}
                              className={`${errors.clientFee ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              placeholder="Enter your fee"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.clientFee && <span className="error-message">{errors.clientFee}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Certificate (PDF)</label>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setCertification(e.target.files[0])}
                              className={`${errors.certification ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.certification && <span className="error-message">{errors.certification}</span>}
                          </div>
                          <div className="form-group">
                            <label className={darkMode ? "text-white" : "text-black"} style={{fontFamily: 'Inter, sans-serif'}}>Short Bio</label>
                            <textarea
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              className={`${errors.bio ? 'error' : ''} ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                              placeholder="Enter a short bio (max 500 characters)"
                              rows="4"
                              style={{fontFamily: 'Inter, sans-serif'}}
                            />
                            {errors.bio && <span className="error-message">{errors.bio}</span>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                     
                    {errors.form && <span className="error-message">{errors.form}</span>}
                    
                    <button 
                      type="submit" 
                      className={`auth-submit-btn ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-orange-700"}`} 
                      style={{fontFamily: 'Inter, sans-serif'}}
                    >
                      {authMode === 'signup' ? 'Sign Up' : 'Login'}
                    </button>
                  </form>
                </div>

                <div className={`auth-mode-toggle ${darkMode ? "text-gray-300" : "text-gray-600"}`} style={{fontFamily: 'Inter, sans-serif'}}>
                  {authMode === 'signup' ? (
                    <span>
                      Already have an account? <button 
                        onClick={() => setAuthMode('login')} 
                        className={`${darkMode ? "text-purple-400 hover:text-purple-300" : "text-blue-600 hover:text-blue-800"}`}
                      >
                        Login
                      </button>
                    </span>
                  ) : (
                    <span>
                      Need an account? <button 
                        onClick={() => setAuthMode('signup')} 
                        className={`${darkMode ? "text-purple-400 hover:text-purple-300" : "text-blue-600 hover:text-blue-800"}`}
                      >
                        Sign Up
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
                 
          <div
            className={`relative overflow-hidden bg-center bg-cover ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-white"}`}
            style={{
              backgroundImage: window.innerWidth >= 340 ? `url(/hero-4img.webp)` : 'none',
            }}
          >
            {/* Background pattern (optional) */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent mix-blend-overlay"></div>
            </div>

            {/* Container */}
            <div className="max-w-7xl mx-auto px-4 lg:mt-0 sm:px-6 lg:px-8 py-20 md:py-8 lg:py-50 lg:ml-35">
              {/* Flex container for side-by-side layout */}
              <div className="relative flex flex-col lg:ml-55 lg:mb-10 items-center lg:items-start gap-8 lg:gap-12">

                {/* Left content */}
                <div className="flex-1 text-center lg:mb-35 lg:max-w-2xl">
                  <div className={`backdrop-blur-md rounded-xl p-8 shadow-lg ${darkMode ? "bg-black bg-opacity-50" : "bg-white bg-opacity-80"}`}>
                    {/* Headline */}
                    <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-black"}`}>
                      <span className="block">Transform Your</span>
                      <span className={`block ${darkMode ? "text-purple-400" : "text-orange-600"}`}>Fitness Journey</span>
                    </h1>

                    {/* Subheading */}
                    <p className={`text-lg md:text-xl mb-10 ${darkMode ? "text-gray-300" : "text-gray-800"}`}>
                      AI-powered workout plans tailored to your goals. No downloads required –
                      access everything directly in your browser.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex justify-center sm:flex-row gap-4">
                      <button
                        onClick={() => currentUser ? navigate('/login') : setShowAuth(true)}
                        className={`px-8 py-3 font-bold rounded-lg transition-all transform hover:scale-105 ${darkMode ? "bg-purple-700 text-white hover:bg-purple-800" : "bg-orange-600 text-white hover:bg-black"}`}
                      >
                        Get Started Free
                      </button>
                      <button
                        onClick={() => currentUser ? navigate('/experts') : setShowAuth(true)}
                        className={`px-8 py-3 font-bold rounded-lg transition-all ${darkMode ? "border-2 border-white text-white hover:bg-purple-800" : "border-2 border-black text-black hover:bg-black hover:text-orange-600"}`}
                      >
                        Meet Our Experts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Solutions Section */}
        <section className={`py-16 ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-black"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-200"}`}>
                Revolutionizing Fitness with Smart Technology
              </h2>
              <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-400"} max-w-3xl mx-auto`}>
                No apps, no downloads, no hassle - just results
              </p>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setDetailedView(!detailedView)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${detailedView ? (darkMode ? "bg-purple-800 text-white" : "bg-gray-200 text-black") : (darkMode ? "bg-purple-700 text-white" : "bg-orange-600 text-white")}`}
                >
                  {detailedView ? 'Show Icon View' : 'Show Detailed View'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${darkMode ? "border-purple-500" : "border-orange-600"}`}
                >
                  {detailedView ? (
                    <div className={`p-6 h-full flex flex-col ${solution.color}`}>
                      <div className="flex items-center mb-4">
                        <span className={`text-3xl mr-4 ${solution.iconColor}`}>{solution.icon}</span>
                        <h3 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>{solution.title}</h3>
                      </div>
                      <p className={`flex-grow ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{solution.description}</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className={`${darkMode ? "text-purple-300 hover:text-purple-200" : "text-orange-600 hover:text-orange-800"} font-medium transition-colors`}>
                          Learn more →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-8 flex flex-col items-center text-center h-full ${solution.color}`}>
                      <span className={`text-5xl mb-4 ${solution.iconColor}`}>{solution.icon}</span>
                      <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>{solution.title}</h3>
                      <button
                        className={`mt-4 text-sm ${darkMode ? "text-purple-300 hover:text-purple-200" : "text-orange-600 hover:text-orange-800"} transition-colors`}
                        onClick={() => setDetailedView(true)}
                      >
                        + Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className={`py-16 ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-extrabold sm:text-4xl ${darkMode ? "text-white" : "text-gray-900"}`}>
                Choose Your Fitness Journey
              </h2>
              <p className={`mt-4 text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Compare our self-guided AI platform with expert-led precision training
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
              {/* Self-Guided Plan */}
              <div className={`rounded-lg shadow-lg overflow-hidden ${plans[0].bgColor} ${plans[0].borderColor}`}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${darkMode ? "bg-purple-800 text-white" : "bg-white text-gray-700"}`}>
                      Self-Guided
                    </span>
                  </div>
                  <h3 className={`mt-4 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>AI Powered Fitness</h3>
                  <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Smart technology guidance without human experts</p>
                  <div className="mt-4 flex items-baseline">
                    <span className={`text-4xl font-extrabold ${darkMode ? "text-purple-400" : "text-orange-600"}`}>Free</span>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <ul className="space-y-3">
                    {plans[0].features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className={`h-5 w-5 flex-shrink-0 ${darkMode ? "text-purple-400" : "text-orange-600"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => currentUser ? navigate('/dashboard') : setShowAuth(true)}
                      className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-orange-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "focus:ring-purple-500" : "focus:ring-orange-500"}`}
                    >
                      Start Free
                    </button>
                  </div>

                  <p className={`mt-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No credit card required
                  </p>
                </div>
              </div>

              {/* Expert-Guided Plan */}
              <div className={`rounded-lg shadow-lg overflow-hidden ${plans[1].bgColor} ${plans[1].borderColor} transform scale-105 relative`}>
                <div className="absolute top-0 right-0 bg-black text-orange-600 px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  MOST POPULAR
                </div>
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${darkMode ? "bg-purple-800 text-white" : "bg-black text-orange-600"}`}>
                      Expert-Guided
                    </span>
                  </div>
                  <h3 className={`mt-4 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Precision Training</h3>
                  <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>1-on-1 coaching with certified fitness experts</p>
                  <div className="mt-4 flex items-baseline">
                    <span className={`text-4xl font-extrabold ${darkMode ? "text-purple-400" : "text-orange-600"}`}>PAID</span>
                    <span className={`ml-1 text-xl font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>/month</span>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <ul className="space-y-3">
                    {plans[1].features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className={`h-5 w-5 flex-shrink-0 ${darkMode ? "text-purple-400" : "text-orange-600"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => navigate('/experts')}
                      className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-bold ${darkMode ? "bg-purple-700 text-white hover:bg-purple-800" : "bg-black text-orange-600 hover:bg-gray-900"} focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "focus:ring-purple-500" : "focus:ring-orange-500"}`}
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-12 rounded-lg p-6 text-center ${darkMode ? "bg-purple-900" : "bg-gray-100"} ${darkMode ? "border-purple-700" : "border-gray-300"} border-2`}>
              <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>Not sure which to choose?</h3>
              <p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Try our free AI plan first, then upgrade to expert guidance when you're ready for personalized coaching.
              </p>
              <button
                className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${darkMode ? "text-purple-300 bg-purple-800 hover:bg-purple-700" : "text-orange-600 bg-white hover:bg-gray-100"}`}
                onClick={() => navigate('/experts')}
              >
                Compare all features →
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={`py-16 ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-black"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-extrabold sm:text-4xl ${darkMode ? "text-white" : "text-gray-200"}`}>
                Powerful Features
              </h2>
              <p className={`mt-4 max-w-2xl text-xl ${darkMode ? "text-gray-300" : "text-gray-400"} mx-auto`}>
                Everything you need to transform your fitness journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`w-16 h-16 ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-black"} rounded-full flex items-center justify-center mb-6`}>
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>AI-Powered Workouts</h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Get personalized workout plans tailored to your fitness level and goals using advanced AI technology.</p>
              </div>

              <div className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`w-16 h-16 ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-black"} rounded-full flex items-center justify-center mb-6`}>
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Real-Time Form Correction</h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Our AI system monitors your movements and provides instant feedback to improve your form and prevent injuries.</p>
              </div>

              <div className={`p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <div className={`w-16 h-16 ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-black"} rounded-full flex items-center justify-center mb-6`}>
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Progress Tracking</h3>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>Track your workout performance, set goals, and achieve better results with data-driven insights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`py-16 relative overflow-hidden ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-white"}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-1/4 -left-10 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-extrabold sm:text-4xl ${darkMode ? "text-white" : "text-gray-900"}`}>
                What Our Users Say
              </h2>
              <p className={`mt-4 text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Hear from people who transformed their fitness with us
              </p>
            </div>

            <div className="relative">
              <div className={`relative rounded-xl shadow-lg p-8 md:p-12 ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                <div className={`absolute top-0 left-0 w-full h-2 ${darkMode ? "bg-purple-600" : "bg-orange-600"} rounded-4`}></div>
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/3 mb-8 md:mb-0 flex justify-center">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].username}
                      className="w-32 h-32 rounded-full object-cover border-4 border-orange-600 shadow-md"
                    />
                  </div>
                  <div className="md:w-2/3 md:pl-8">
                    <div className={`text-lg italic mb-6 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      "{testimonials[currentIndex].text}"
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${darkMode ? "text-purple-400" : "text-orange-600"}`}>{testimonials[currentIndex].username}</p>
                      <p className={darkMode ? "text-gray-400" : "text-gray-600"}>{testimonials[currentIndex].role}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={prevTestimonial}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-orange-700"} text-white transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextTestimonial}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? "bg-purple-700 hover:bg-purple-800" : "bg-orange-600 hover:bg-orange-700"} text-white transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className={`py-16 ${darkMode ? "bg-gradient-to-br from-black via-purple-900 to-pink-900" : "bg-black"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
                <h2 className={`text-3xl font-extrabold sm:text-4xl mb-6 ${darkMode ? "text-white" : "text-gray-200"}`}>
                  About FitnGro
                </h2>
                <p className={`text-xl mb-8 ${darkMode ? "text-gray-300" : "text-gray-400"}`}>
                  At FitnGro, our team blends fitness expertise and AI technology to personalize your fitness journey. Our app tailors workouts and nutrition plans based on your goals and data, providing real-time tracking and guidance.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className={`p-4 rounded-lg border-l-4 ${darkMode ? "bg-purple-900 border-purple-600" : "bg-orange-900 border-orange-600"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-200"}`}>100+</h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-400"}>Happy Users</p>
                  </div>
                  <div className={`p-4 rounded-lg border-l-4 ${darkMode ? "bg-purple-900 border-purple-600" : "bg-orange-900 border-orange-600"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-200"}`}>10+</h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-400"}>Certified Experts</p>
                  </div>
                  <div className={`p-4 rounded-lg border-l-4 ${darkMode ? "bg-purple-900 border-purple-600" : "bg-orange-900 border-orange-600"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-200"}`}>24/7</h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-400"}>Support</p>
                  </div>
                  <div className={`p-4 rounded-lg border-l-4 ${darkMode ? "bg-purple-900 border-purple-600" : "bg-orange-900 border-orange-600"}`}>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-200"}`}>AI</h3>
                    <p className={darkMode ? "text-gray-300" : "text-gray-400"}>Powered</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="relative">
                  <img
                    src="/jj-team.JPG"
                    alt="FitnGro Team"
                    className="rounded-lg shadow-xl w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-16 ${darkMode ? "bg-purple-700" : "bg-orange-600"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
              Ready to Transform Your Fitness Journey?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Join thousands of users who are achieving their fitness goals with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => currentUser ? navigate('/dashboard') : setShowAuth(true)}
                className={`px-8 py-4 font-bold rounded-lg ${darkMode ? "bg-white text-purple-700 hover:bg-gray-100" : "bg-white text-orange-600 hover:bg-gray-100"} transition-colors text-lg`}
              >
                Get Started for Free
              </button>
              <button
                onClick={() => navigate('/experts')}
                className={`px-8 py-4 font-bold rounded-lg ${darkMode ? "border-2 border-white text-white hover:bg-purple-800" : "border-2 border-white text-white hover:bg-black"} transition-colors text-lg`}
              >
                Meet Our Experts
              </button>
            </div>
          </div>
        </section>

        <footer className={`py-12 px-4 sm:px-6 lg:px-8 ${darkMode ? "bg-gray-900" : "bg-black"}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="space-y-6">
              <img
                src="Footer-Logo-FG.png"
                alt="FitnGro"
                className="h-12 w-auto"
              />
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Revolutionizing fitness with AI-powered technology and expert guidance.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.linkedin.com/company/fitngro/posts/?feedView=all" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? "text-purple-400" : "text-orange-600"} mb-4`}>Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Home</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>About</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Features</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Pricing</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Experts</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? "text-purple-400" : "text-orange-600"} mb-4`}>Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Blog</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Help Center</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Tutorials</a></li>
                <li><a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Community</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? "text-purple-400" : "text-orange-600"} mb-4`}>Stay Updated</h3>
              <p className={`mb-4 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Subscribe to our newsletter for the latest fitness tips and updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className={`px-4 py-2 w-full rounded-l-lg focus:outline-none focus:ring-2 ${darkMode ? "bg-gray-800 text-white focus:ring-purple-500" : "bg-gray-700 text-white focus:ring-orange-500"}`}
                />
                <button className={`px-4 py-2 rounded-r-lg ${darkMode ? "bg-purple-600 hover:bg-purple-700" : "bg-orange-600 hover:bg-orange-700"} text-white transition-colors`}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className={`max-w-7xl mx-auto border-t ${darkMode ? "border-gray-800" : "border-gray-700"} mt-12 pt-8 text-center text-sm`}>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>&copy; {new Date().getFullYear()} FitnGro. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Privacy Policy</a>
              <a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Terms of Service</a>
              <a href="#" className={`${darkMode ? "text-gray-400 hover:text-purple-400" : "text-gray-500 hover:text-orange-600"} transition-colors`}>Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

function TestComponent() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}

export default HomePage;
