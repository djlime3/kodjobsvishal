import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './JobDashboard.module.css';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  lpa: string;
  skills: string[];
  postedTime: string;
  expiresIn: string;
  isEligible: boolean;
  isBookmarked?: boolean;
  enrolledCount: number; // Number of people enrolled
  appliedAt?: string;
  jobDescription?: string;
  employmentType?: string;
  responsibilities?: string[];
  benefits?: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  theme?: 'light' | 'dark';
  // ... other user properties
}

// Update API key
const RAPID_API_KEY = '2948140962mshd5b5cd5df92c5cap1a1d41jsne7ab9ba04c6a';
const RAPID_API_HOST = 'jsearch.p.rapidapi.com';

// Add color palette for company logos
const COMPANY_COLORS = [
  { bg: '#E3F2FD', text: '#1976D2' }, // Blue
  { bg: '#F3E5F5', text: '#7B1FA2' }, // Purple
  { bg: '#E8F5E9', text: '#388E3C' }, // Green
  { bg: '#FFF3E0', text: '#F57C00' }, // Orange
  { bg: '#FFEBEE', text: '#C62828' }, // Red
  { bg: '#E0F2F1', text: '#00796B' }, // Teal
];

// Add company logos mapping
const COMPANY_LOGOS: Record<string, string> = {
  'Apple': 'https://banner2.cleanpng.com/20180625/pgg/aaz8nox3y.webp',
  'Netflix': 'https://static.vecteezy.com/system/resources/previews/020/336/373/non_2x/netflix-logo-netflix-icon-free-free-vector.jpg',
  'Google' : 'https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-512.png',
  'Amazon' : 'https://banner2.cleanpng.com/20180830/ilu/kisspng-amazon-com-logo-brand-aws-turkey-symbol-flysteadi-home-1713946389438.webp',
  'Microsoft' : 'https://i.pinimg.com/736x/f5/9f/e1/f59fe1a61ac1aff705d0ce0aa4be4ab3.jpg',
  'Facebook' : 'https://static.vecteezy.com/system/resources/previews/018/910/719/non_2x/facebook-logo-facebook-icon-free-free-vector.jpg',
  'Twitter' : 'https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/twitter_logo-512.png',
  'Meta' : 'https://www.citypng.com/public/uploads/preview/hd-facebook-meta-logo-png-701751694777707v6bil7t1yh.png',
  
  
  // Add more company logos here as they become available
};

// Function to get consistent color for a company
const getCompanyColor = (companyName: string) => {
  const index = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COMPANY_COLORS[index % COMPANY_COLORS.length];
};

// Function to get company initials
const getCompanyInitials = (companyName: string) => {
  return companyName
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Function to generate fallback logo
const generateFallbackLogo = (company: string, style: 'default' | 'modern' | 'minimal'): string => {
  const { bg, text } = getCompanyColor(company);
  const initials = getCompanyInitials(company);

  let shape = '';
  if (style === 'modern') {
    shape = `<circle cx="20" cy="20" r="20" fill="${bg}"/>`;
  } else if (style === 'default') {
    shape = `<rect width="40" height="40" rx="8" fill="${bg}"/>`;
  } else {
    shape = `<rect width="40" height="40" fill="${bg}"/>`;
  }

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${shape}
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" 
        font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" fill="${text}">
        ${initials}
      </text>
    </svg>
  `)}`;
};

// Function to get company logo
const getCompanyLogo = (company: string): string => {
  return COMPANY_LOGOS[company] || generateFallbackLogo(company, 'default');
};

const LoadingJobCard: React.FC = () => (
  <div className={`${styles.jobCard} ${styles.loadingCard}`}>
    <div className={`${styles.companyLogo} ${styles.loading}`}>
      <div className={styles.loadingPulse}></div>
    </div>
    <div className={styles.jobContent}>
      <div className={styles.jobHeader}>
        <div className={styles.companyInfo}>
          <div className={`${styles.companyName} ${styles.loading}`}>
            <div className={styles.loadingPulse}></div>
          </div>
          <div className={`${styles.lpa} ${styles.loading}`}>
            <div className={styles.loadingPulse}></div>
          </div>
        </div>
        <div className={`${styles.jobTitle} ${styles.loading}`}>
          <div className={styles.loadingPulse}></div>
        </div>
        <div className={`${styles.location} ${styles.loading}`}>
          <div className={styles.loadingPulse}></div>
        </div>
      </div>
      <div className={styles.skillTags}>
        {[1, 2, 3].map((_, index) => (
          <span key={index} className={`${styles.skillTag} ${styles.loading}`}>
            <div className={styles.loadingPulse}></div>
          </span>
        ))}
      </div>
      <div className={styles.jobFooter}>
        <div className={`${styles.timeInfo} ${styles.loading}`}>
          <div className={styles.loadingPulse}></div>
        </div>
        <div className={styles.actions}>
          <div className={`${styles.eligibilityStatus} ${styles.loading}`}>
            <div className={styles.loadingPulse}></div>
          </div>
          <div className={`${styles.checkDetailsButton} ${styles.loading}`}>
            <div className={styles.loadingPulse}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Add helper function for formatting time
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

const JobDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommended' | 'applications'>('recommended');
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showAppliedMessage, setShowAppliedMessage] = useState(false);
  const [appliedJob, setAppliedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Add job type interface extensions for API data
  interface JobApiResponse {
    employer_name: string;
    employer_logo: string;
    job_title: string;
    job_city: string;
    job_country: string;
    job_min_salary: number;
    job_max_salary: number;
    job_employment_type: string;
    job_highlights: {
      Qualifications?: string[];
      Responsibilities?: string[];
      Benefits?: string[];
    };
    job_required_skills: string;
    job_posted_at_datetime_utc: string;
    job_description: string;
    job_id: string;
  }

  // Modify fetchJobs function
  const fetchJobs = useCallback(async (page: number = 1, query: string = '') => {
    try {
      setLoading(true);
      setError('');

      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': RAPID_API_HOST
        }
      };

      // Encode the search query and use it if provided, otherwise use default
      const searchQuery = query ? 
        encodeURIComponent(query) : 
        'software%20developer%20india';

      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?query=${searchQuery}&page=${page}&num_pages=1&country=IN`,
        options
      );

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      // Transform API response to match our Job interface
      const transformedJobs: Job[] = data.data.map((job: JobApiResponse) => {
        // Calculate salary in LPA (Lakhs Per Annum)
        const minSalaryLPA = job.job_min_salary ? Math.floor(job.job_min_salary / 100000) : 3;
        const maxSalaryLPA = job.job_max_salary ? Math.floor(job.job_max_salary / 100000) : 15;
        
        // Extract skills from job description and required skills
        const skillsFromDesc = job.job_required_skills
          ? job.job_required_skills.split(',').map(skill => skill.trim())
          : [];
        
        // Get qualifications from job highlights
        const qualifications = job.job_highlights?.Qualifications || [];
        
        // Combine skills and filter duplicates
        const skills = Array.from(new Set([...skillsFromDesc, ...qualifications]))
          .slice(0, 5); // Limit to 5 skills

        return {
          id: job.job_id || String(Math.random()),
          title: job.job_title || 'Software Developer',
          company: job.employer_name || 'Unknown Company',
          companyLogo: job.employer_logo || getCompanyLogo(job.employer_name || 'Unknown Company'),
          location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
          lpa: `${minSalaryLPA}-${maxSalaryLPA} LPA`,
          skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'],
          postedTime: job.job_posted_at_datetime_utc ? 
            formatTimeAgo(new Date(job.job_posted_at_datetime_utc)) : 
            '3 days ago',
          expiresIn: '30 days',
          isEligible: true,
          isBookmarked: false,
          enrolledCount: Math.floor(Math.random() * 80) + 20,
          jobDescription: job.job_description,
          employmentType: job.job_employment_type,
          responsibilities: job.job_highlights?.Responsibilities || [],
          benefits: job.job_highlights?.Benefits || []
        };
      });

      setJobs(prevJobs => page === 1 ? transformedJobs : [...prevJobs, ...transformedJobs]);
      setHasMore(transformedJobs.length === 10);
      setCurrentPage(page);
      setShowLoadingScreen(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't use any external values

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData) as User;
      // Only set theme if not present
      if (!parsedUser.theme || !['light', 'dark'].includes(parsedUser.theme)) {
        parsedUser.theme = 'light';
      }
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (user) {
      const newTheme = user.theme === 'light' ? 'dark' : 'light' as const;
      const updatedUser: User = { ...user, theme: newTheme };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Apply theme to body for global styles
      document.body.style.backgroundColor = newTheme === 'dark' ? '#111827' : '#f5f5f5';
      document.body.style.color = newTheme === 'dark' ? '#e5e7eb' : '#333';
    }
  };

  // Apply theme on mount
  useEffect(() => {
    if (user?.theme) {
      document.body.style.backgroundColor = user.theme === 'dark' ? '#111827' : '#f5f5f5';
      document.body.style.color = user.theme === 'dark' ? '#e5e7eb' : '#333';
    }
  }, [user?.theme]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/authorization');
  };

  // Add bookmark functions
  const toggleBookmark = (jobId: string) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const newBookmarkState = !job.isBookmarked;
          // Save to localStorage
          const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
          if (newBookmarkState) {
            bookmarks.push(jobId);
          } else {
            const index = bookmarks.indexOf(jobId);
            if (index > -1) bookmarks.splice(index, 1);
          }
          localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarks));
          
          return { ...job, isBookmarked: newBookmarkState };
        }
        return job;
      });
      return updatedJobs;
    });
  };

  // Load bookmarks from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
    setJobs(prevJobs => 
      prevJobs.map(job => ({
        ...job,
        isBookmarked: bookmarks.includes(job.id)
      }))
    );
  }, []);

  // Load applied jobs from localStorage
  useEffect(() => {
    const storedAppliedJobs = localStorage.getItem('appliedJobs');
    if (storedAppliedJobs) {
      setAppliedJobs(JSON.parse(storedAppliedJobs));
    }
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchJobs(currentPage + 1);
    }
  };

  const filteredJobs = [...jobs, ...recommendedJobs].filter(job => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchTermLower) ||
      job.company.toLowerCase().includes(searchTermLower) ||
      job.location.toLowerCase().includes(searchTermLower) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTermLower))
    );
  });

  // Update handleLogoError function
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>, job: Job, attempt = 0) => {
    const target = e.target as HTMLImageElement;
    const styles: Array<'default' | 'modern' | 'minimal'> = ['default', 'modern', 'minimal'];
    
    if (attempt < styles.length) {
      target.src = generateFallbackLogo(job.company, styles[attempt]);
      target.onerror = (nextError) => handleLogoError(nextError as any, job, attempt + 1);
    }
  };

  // Add registration closed section
  const closedJobs: Job[] = [
    {
      id: '4',
      title: 'ServiceNow Developer Intern',
      company: 'ITnow Inc',
      companyLogo: '/images/itnow-logo.png',
      location: 'Bengaluru',
      lpa: '3-5 LPA',
      skills: ['Java', 'JavaScript automation'],
      postedTime: '4 days ago',
      expiresIn: 'Expired 3 days ago',
      isEligible: false,
      enrolledCount: Math.floor(Math.random() * 80) + 20 // Random between 20-100
    },
    {
      id: '5',
      title: 'Associate Database Administrator (DBA)',
      company: 'Ahana Systems and Solutions',
      companyLogo: '/images/ahana-logo.png',
      location: 'Mumbai, Bengaluru',
      lpa: '4-7 LPA',
      skills: ['SQL', 'Oracle', 'Python'],
      postedTime: '5 days ago',
      expiresIn: 'Expired 5 days ago',
      isEligible: false,
      enrolledCount: Math.floor(Math.random() * 80) + 20 // Random between 20-100
    },
    {
      id: '6',
      title: 'Trainee Tester & Functional Analyst',
      company: 'Infanion',
      companyLogo: '/images/infanion-logo.png',
      location: 'Bangalore',
      lpa: '3-6 LPA',
      skills: ['Core Java', 'Manual Testing', 'Automation testing'],
      postedTime: '5 days ago',
      expiresIn: 'Expired 5 days ago',
      isEligible: false,
      enrolledCount: Math.floor(Math.random() * 80) + 20 // Random between 20-100
    }
  ];

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Add initial loading animation
  useEffect(() => {
    // Show loading screen for 2 seconds
    setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2000);
  }, []);

  // Handle clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowJobModal(false);
      }
    };

    if (showJobModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showJobModal]);

  // Handle opening job details
  const handleOpenJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Handle closing job details
  const handleCloseJobDetails = () => {
    setShowJobModal(false);
    setSelectedJob(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle applying for a job
  const handleApplyForJob = (jobId: string) => {
    // Find the job that was applied for
    const job = [...jobs, ...recommendedJobs, ...closedJobs].find(j => j.id === jobId);
    
    if (job) {
      // Here you would typically send an API request to apply for the job
      setAppliedJob(job);
      setShowAppliedMessage(true);
      
      // Add to applied jobs if not already applied
      if (!appliedJobs.some(j => j.id === job.id)) {
        const jobWithTimestamp = {
          ...job,
          appliedAt: new Date().toLocaleString()
        };
        const updatedAppliedJobs = [...appliedJobs, jobWithTimestamp];
        setAppliedJobs(updatedAppliedJobs);
        
        // Save to localStorage
        localStorage.setItem('appliedJobs', JSON.stringify(updatedAppliedJobs));
      }
      
      handleCloseJobDetails();
      
      // Create confetti effect
      createConfetti();
      
      // Hide the success message after 3 seconds
      setTimeout(() => {
        setShowAppliedMessage(false);
      }, 3000);
    }
  };

  // Function to create confetti effect
  const createConfetti = () => {
    const confettiCount = 100;
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '1500';
    document.body.appendChild(container);
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      
      confetti.style.position = 'absolute';
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      
      container.appendChild(confetti);
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      confetti.animate([
        { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg)', opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${tx}vw, ${ty}vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 2000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: Math.random() * 200
      });
    }
    
    setTimeout(() => {
      container.remove();
    }, 3000);
  };

  // Update the loadRecommendedJobs function
  useEffect(() => {
    const loadRecommendedJobs = async () => {
      if (activeTab === 'recommended' && recommendedJobs.length === 0) {
        try {
          const recommendedQueries = [
            'frontend developer india',
            'backend developer india',
            'full stack developer india',
            'mobile developer india',
            'devops engineer india',
            'software engineer india'
          ];
          
          const options = {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': RAPID_API_KEY,
              'X-RapidAPI-Host': RAPID_API_HOST
            }
          };

          // Fetch one job for each query
          const recommendedJobsPromises = recommendedQueries.map(async query => {
            try {
              const response = await fetch(
                `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=IN`,
                options
              );

              if (!response.ok) {
                throw new Error('Failed to fetch recommended jobs');
              }

              const data = await response.json();
              return data.data[0]; // Get first job from each query
            } catch (error) {
              console.error(`Error fetching recommended job for ${query}:`, error);
              return null;
            }
          });

          const recommendedJobsData = await Promise.all(recommendedJobsPromises);
          
          // Transform and filter out null results
          const transformedRecommendedJobs: Job[] = recommendedJobsData
            .filter(job => job !== null)
            .map((job: JobApiResponse) => {
              // Calculate salary in LPA (Lakhs Per Annum)
              const minSalaryLPA = job.job_min_salary ? Math.floor(job.job_min_salary / 100000) : 3;
              const maxSalaryLPA = job.job_max_salary ? Math.floor(job.job_max_salary / 100000) : 15;
              
              // Extract skills from job description and required skills
              const skillsFromDesc = job.job_required_skills
                ? job.job_required_skills.split(',').map(skill => skill.trim())
                : [];
              
              // Get qualifications from job highlights
              const qualifications = job.job_highlights?.Qualifications || [];
              
              // Combine skills and filter duplicates
              const skills = Array.from(new Set([...skillsFromDesc, ...qualifications]))
                .slice(0, 5); // Limit to 5 skills

              return {
                id: job.job_id || String(Math.random()),
                title: job.job_title || 'Software Developer',
                company: job.employer_name || 'Unknown Company',
                companyLogo: job.employer_logo || getCompanyLogo(job.employer_name || 'Unknown Company'),
                location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
                lpa: `${minSalaryLPA}-${maxSalaryLPA} LPA`,
                skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'],
                postedTime: job.job_posted_at_datetime_utc ? 
                  formatTimeAgo(new Date(job.job_posted_at_datetime_utc)) : 
                  '3 days ago',
                expiresIn: '30 days',
                isEligible: true,
                isBookmarked: false,
                enrolledCount: Math.floor(Math.random() * 80) + 20,
                jobDescription: job.job_description,
                employmentType: job.job_employment_type,
                responsibilities: job.job_highlights?.Responsibilities || [],
                benefits: job.job_highlights?.Benefits || []
              };
            });

          if (transformedRecommendedJobs.length === 0) {
            throw new Error('No recommended jobs found');
          }

          // Apply any existing bookmarks
          const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
          const recommendationsWithBookmarks = transformedRecommendedJobs.map(job => ({
            ...job,
            isBookmarked: bookmarks.includes(job.id)
          }));

          setRecommendedJobs(recommendationsWithBookmarks);
        } catch (error) {
          console.error('Error loading recommended jobs:', error);
          setError('Failed to load recommended jobs. Please try again later.');
        }
      }
    };

    loadRecommendedJobs();
  }, [activeTab, recommendedJobs.length]);

  // Also load recommended jobs on initial load
  useEffect(() => {
    const loadInitialRecommendedJobs = async () => {
      try {
        const recommendedQueries = [
          'frontend developer india',
          'backend developer india',
          'full stack developer india',
          'mobile developer india',
          'devops engineer india',
          'software engineer india'
        ];
        
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': RAPID_API_HOST
          }
        };

        // Fetch one job for each query
        const recommendedJobsPromises = recommendedQueries.map(async query => {
          try {
            const response = await fetch(
              `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=IN`,
              options
            );

            if (!response.ok) {
              throw new Error('Failed to fetch recommended jobs');
            }

            const data = await response.json();
            return data.data[0]; // Get first job from each query
          } catch (error) {
            console.error(`Error fetching recommended job for ${query}:`, error);
            return null;
          }
        });

        const recommendedJobsData = await Promise.all(recommendedJobsPromises);
        
        // Transform and filter out null results
        const transformedRecommendedJobs: Job[] = recommendedJobsData
          .filter(job => job !== null)
          .map((job: JobApiResponse) => {
            // Calculate salary in LPA (Lakhs Per Annum)
            const minSalaryLPA = job.job_min_salary ? Math.floor(job.job_min_salary / 100000) : 3;
            const maxSalaryLPA = job.job_max_salary ? Math.floor(job.job_max_salary / 100000) : 15;
            
            // Extract skills from job description and required skills
            const skillsFromDesc = job.job_required_skills
              ? job.job_required_skills.split(',').map(skill => skill.trim())
              : [];
            
            // Get qualifications from job highlights
            const qualifications = job.job_highlights?.Qualifications || [];
            
            // Combine skills and filter duplicates
            const skills = Array.from(new Set([...skillsFromDesc, ...qualifications]))
              .slice(0, 5); // Limit to 5 skills

            return {
              id: job.job_id || String(Math.random()),
              title: job.job_title || 'Software Developer',
              company: job.employer_name || 'Unknown Company',
              companyLogo: job.employer_logo || getCompanyLogo(job.employer_name || 'Unknown Company'),
              location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
              lpa: `${minSalaryLPA}-${maxSalaryLPA} LPA`,
              skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'],
              postedTime: job.job_posted_at_datetime_utc ? 
                formatTimeAgo(new Date(job.job_posted_at_datetime_utc)) : 
                '3 days ago',
              expiresIn: '30 days',
              isEligible: true,
              isBookmarked: false,
              enrolledCount: Math.floor(Math.random() * 80) + 20,
              jobDescription: job.job_description,
              employmentType: job.job_employment_type,
              responsibilities: job.job_highlights?.Responsibilities || [],
              benefits: job.job_highlights?.Benefits || []
            };
          });

        if (transformedRecommendedJobs.length === 0) {
          throw new Error('No recommended jobs found');
        }

        // Apply any existing bookmarks
        const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
        const recommendationsWithBookmarks = transformedRecommendedJobs.map(job => ({
          ...job,
          isBookmarked: bookmarks.includes(job.id)
        }));

        setRecommendedJobs(recommendationsWithBookmarks);
      } catch (error) {
        console.error('Error loading initial recommended jobs:', error);
        setError('Failed to load recommended jobs. Please try again later.');
      }
    };

    loadInitialRecommendedJobs();
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh regular jobs with current search term
      await fetchJobs(1, searchTerm);
      
      // Refresh recommended jobs
      const recommendedQueries = [
        'frontend developer india',
        'backend developer india',
        'full stack developer india',
        'mobile developer india',
        'devops engineer india',
        'software engineer india'
      ];
      
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': RAPID_API_HOST
        }
      };

      // Fetch one job for each query
      const recommendedJobsPromises = recommendedQueries.map(async query => {
        try {
          const response = await fetch(
            `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=IN`,
            options
          );

          if (!response.ok) {
            throw new Error('Failed to fetch recommended jobs');
          }

          const data = await response.json();
          return data.data[0]; // Get first job from each query
        } catch (error) {
          console.error(`Error fetching recommended job for ${query}:`, error);
          return null;
        }
      });

      const recommendedJobsData = await Promise.all(recommendedJobsPromises);
      
      // Transform and filter out null results
      const transformedRecommendedJobs: Job[] = recommendedJobsData
        .filter(job => job !== null)
        .map((job: JobApiResponse) => {
          // Calculate salary in LPA (Lakhs Per Annum)
          const minSalaryLPA = job.job_min_salary ? Math.floor(job.job_min_salary / 100000) : 3;
          const maxSalaryLPA = job.job_max_salary ? Math.floor(job.job_max_salary / 100000) : 15;
          
          // Extract skills from job description and required skills
          const skillsFromDesc = job.job_required_skills
            ? job.job_required_skills.split(',').map(skill => skill.trim())
            : [];
          
          // Get qualifications from job highlights
          const qualifications = job.job_highlights?.Qualifications || [];
          
          // Combine skills and filter duplicates
          const skills = Array.from(new Set([...skillsFromDesc, ...qualifications]))
            .slice(0, 5); // Limit to 5 skills

          return {
            id: job.job_id || String(Math.random()),
            title: job.job_title || 'Software Developer',
            company: job.employer_name || 'Unknown Company',
            companyLogo: job.employer_logo || getCompanyLogo(job.employer_name || 'Unknown Company'),
            location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || 'Remote',
            lpa: `${minSalaryLPA}-${maxSalaryLPA} LPA`,
            skills: skills.length > 0 ? skills : ['JavaScript', 'React', 'Node.js'],
            postedTime: job.job_posted_at_datetime_utc ? 
              formatTimeAgo(new Date(job.job_posted_at_datetime_utc)) : 
              '3 days ago',
            expiresIn: '30 days',
            isEligible: true,
            isBookmarked: false,
            enrolledCount: Math.floor(Math.random() * 80) + 20,
            jobDescription: job.job_description,
            employmentType: job.job_employment_type,
            responsibilities: job.job_highlights?.Responsibilities || [],
            benefits: job.job_highlights?.Benefits || []
          };
        });

      if (transformedRecommendedJobs.length === 0) {
        throw new Error('No recommended jobs found');
      }

      // Apply any existing bookmarks
      const bookmarks = JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
      const recommendationsWithBookmarks = transformedRecommendedJobs.map(job => ({
        ...job,
        isBookmarked: bookmarks.includes(job.id)
      }));

      setRecommendedJobs(recommendationsWithBookmarks);
      
      // Show success message
      setShowRefreshMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowRefreshMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
      setError('Failed to refresh jobs. Please try again later.');
    } finally {
      // Stop spinning animation after 1 second minimum
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const removeJob = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    setRecommendedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
    // Also remove from applied jobs if present
    setAppliedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  return (
    <>
      {showLoadingScreen && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingLogo}>
            <span className={styles.loadingKod}>Kod</span>
            <span className={styles.loadingJobs}>Jobs</span>
          </div>
        </div>
      )}
      
      {/* Success Message Popup */}
      {showAppliedMessage && appliedJob && (
        <div className={styles.successMessageOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <div className={styles.successText}>
              <h3>Application Submitted!</h3>
              <p>{appliedJob.title} at {appliedJob.company}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Refresh Success Message */}
      {showRefreshMessage && (
        <div className={styles.successMessageOverlay}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={styles.successText}>
              <h3>Jobs Refreshed!</h3>
              <p>New job recommendations are ready</p>
            </div>
          </div>
        </div>
      )}
      
      <div className={`${styles.dashboardContainer} ${showLoadingScreen ? styles.hidden : ''}`} data-theme={user?.theme || 'light'}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.kod}>Kod</span>
            <span className={styles.jobs}>Jobs</span>
          </div>
          <nav className={styles.nav}>
            <button 
              className={`${styles.navButton} ${activeTab === 'recommended' ? styles.active : ''}`}
              onClick={() => setActiveTab('recommended')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: '6px' }}>
                <path d="M5 3v4M3 5h4M6 17v4M4 19h4M13 3l4 4L5 19l-4-4L13 3z" />
              </svg>
              Recommended
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'applications' ? styles.active : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" style={{ marginRight: '6px' }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Applications
            </button>
          </nav>
          <div className={styles.userSection}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <span 
                className={styles.username}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {user?.username || 'User'}
              </span>
              <div className={`${styles.userDropdown} ${isDropdownOpen ? styles.open : ''}`}>
                <div className={styles.dropdownItem} onClick={toggleTheme}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {user?.theme === 'light' ? (
                      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                    ) : (
                      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                    )}
                  </svg>
                  <span>{user?.theme === 'light' ? 'Dark Theme' : 'Light Theme'}</span>
                </div>
                <div className={styles.dropdownDivider} />
                <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span>Log Out</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className={styles.main}>
          <section className={styles.searchSection}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button 
              className={`${styles.refreshButton} ${isRefreshing ? styles.spinning : ''}`}
              onClick={handleRefresh}
              aria-label="Refresh jobs"
              disabled={isRefreshing}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </section>

          {activeTab === 'recommended' ? (
            <div className={styles.tabContent}>
              {loading ? (
                <div className={styles.loadingContainer}>
                  {[1, 2, 3].map((_, index) => (
                    <LoadingJobCard key={index} />
                  ))}
                </div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : (
                <>
                  {/* Recommended Jobs Section */}
                  <h2 className={styles.sectionTitle}>
                    {searchTerm ? 'Search Results' : 'Recommended For You'}
                    {searchTerm && <span className={styles.resultCount}>({filteredJobs.length} results)</span>}
                  </h2>
                  <section className={styles.jobsList}>
                    {(searchTerm ? filteredJobs : recommendedJobs).map(job => (
                      <div key={job.id} className={styles.jobCard}>
                        <button 
                          className={styles.closeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeJob(job.id);
                          }}
                          aria-label="Remove job"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className={styles.companyLogo}>
                          <img 
                            src={job.companyLogo} 
                            alt={`${job.company} logo`}
                            onError={(e) => handleLogoError(e, job)}
                          />
                        </div>
                        <div className={styles.jobContent}>
                          <div className={styles.jobHeader}>
                            <div className={styles.companyInfo}>
                              <h3 className={styles.companyName}>{job.company}</h3>
                              <div className={styles.lpa}>{job.lpa}</div>
                              <button
                                className={`${styles.bookmarkButton} ${job.isBookmarked ? styles.bookmarked : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(job.id);
                                }}
                                aria-label={job.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill={job.isBookmarked ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                </svg>
                              </button>
                            </div>
                            <div className={styles.jobTitle}>{job.title}</div>
                            <div className={styles.location}>
                              <svg viewBox="0 0 24 24" className={styles.locationIcon}>
                                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              {job.location}
                            </div>
                            <div className={`${styles.enrolledCount} ${job.enrolledCount > 50 ? styles.highEnrollment : ''}`}>
                              <svg viewBox="0 0 24 24" className={styles.enrolledIcon}>
                                <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7z"/>
                              </svg>
                              {job.enrolledCount > 0 ? `${job.enrolledCount} people enrolled` : 'No enrollments yet'}
                            </div>
                          </div>
                          <div className={styles.skillTags}>
                            {job.skills.map((skill, index) => (
                              <span key={index} className={styles.skillTag}>{skill}</span>
                            ))}
                          </div>
                          <div className={styles.jobFooter}>
                            <div className={styles.timeInfo}>
                              <span>Posted {job.postedTime}</span>
                              <span className={styles.dot}>•</span>
                              <span>Expires in {job.expiresIn}</span>
                            </div>
                            <div className={styles.actions}>
                              <div className={`${styles.eligibilityStatus} ${job.isEligible ? styles.eligible : styles.notEligible}`}>
                                {appliedJobs.some(j => j.id === job.id) ? (
                                  <div className={styles.alreadyApplied}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Applied
                                  </div>
                                ) : (
                                  job.isEligible ? 'Eligible to apply' : 'Not Eligible to apply'
                                )}
                              </div>
                              <button 
                                className={styles.checkDetailsButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenJobDetails(job);
                                }}
                              >
                                Check Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>

                  {/* Regular Jobs Section */}
                  <h2 className={styles.sectionTitle}>All Available Jobs</h2>
                  <section className={styles.jobsList}>
                    {filteredJobs.map(job => (
                      <div key={job.id} className={styles.jobCard}>
                        <button 
                          className={styles.closeButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeJob(job.id);
                          }}
                          aria-label="Remove job"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className={styles.companyLogo}>
                          <img 
                            src={job.companyLogo} 
                            alt={`${job.company} logo`}
                            onError={(e) => handleLogoError(e, job)}
                          />
                        </div>
                        <div className={styles.jobContent}>
                          <div className={styles.jobHeader}>
                            <div className={styles.companyInfo}>
                              <h3 className={styles.companyName}>{job.company}</h3>
                              <div className={styles.lpa}>{job.lpa}</div>
                              <button
                                className={`${styles.bookmarkButton} ${job.isBookmarked ? styles.bookmarked : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBookmark(job.id);
                                }}
                                aria-label={job.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill={job.isBookmarked ? 'currentColor' : 'none'}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                </svg>
                              </button>
                            </div>
                            <div className={styles.jobTitle}>{job.title}</div>
                            <div className={styles.location}>
                              <svg viewBox="0 0 24 24" className={styles.locationIcon}>
                                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              {job.location}
                            </div>
                            <div className={`${styles.enrolledCount} ${job.enrolledCount > 50 ? styles.highEnrollment : ''}`}>
                              <svg viewBox="0 0 24 24" className={styles.enrolledIcon}>
                                <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7z"/>
                              </svg>
                              {job.enrolledCount > 0 ? `${job.enrolledCount} people enrolled` : 'No enrollments yet'}
                            </div>
                          </div>
                          <div className={styles.skillTags}>
                            {job.skills.map((skill, index) => (
                              <span key={index} className={styles.skillTag}>{skill}</span>
                            ))}
                          </div>
                          <div className={styles.jobFooter}>
                            <div className={styles.timeInfo}>
                              <span>Posted {job.postedTime}</span>
                              <span className={styles.dot}>•</span>
                              <span>Expires in {job.expiresIn}</span>
                            </div>
                            <div className={styles.actions}>
                              <div className={`${styles.eligibilityStatus} ${job.isEligible ? styles.eligible : styles.notEligible}`}>
                                {appliedJobs.some(j => j.id === job.id) ? (
                                  <div className={styles.alreadyApplied}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Applied
                                  </div>
                                ) : (
                                  job.isEligible ? 'Eligible to apply' : 'Not Eligible to apply'
                                )}
                              </div>
                              <button 
                                className={styles.checkDetailsButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenJobDetails(job);
                                }}
                              >
                                Check Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </section>

                  {hasMore && (
                    <div className={styles.loadMoreContainer}>
                      <button 
                        className={styles.loadMoreButton}
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Load More Jobs'}
                      </button>
                    </div>
                  )}

                  {closedJobs.length > 0 && (
                    <>
                      <h2 className={styles.sectionTitle}>Registration Closed</h2>
                      <section className={styles.jobsList}>
                        {closedJobs.map(job => (
                          <div key={job.id} className={styles.jobCard}>
                            <button 
                              className={styles.closeButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeJob(job.id);
                              }}
                              aria-label="Remove job"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div className={styles.companyLogo}>
                              <img 
                                src={job.companyLogo} 
                                alt={`${job.company} logo`}
                                onError={(e) => handleLogoError(e, job)}
                              />
                            </div>
                            <div className={styles.jobContent}>
                              <div className={styles.jobHeader}>
                                <div className={styles.companyInfo}>
                                  <h3 className={styles.companyName}>{job.company}</h3>
                                  <div className={styles.lpa}>{job.lpa}</div>
                                  <button
                                    className={`${styles.bookmarkButton} ${job.isBookmarked ? styles.bookmarked : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBookmark(job.id);
                                    }}
                                    aria-label={job.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                                  >
                                    <svg
                                      viewBox="0 0 24 24"
                                      fill={job.isBookmarked ? 'currentColor' : 'none'}
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                    </svg>
                                  </button>
                                </div>
                                <div className={styles.jobTitle}>{job.title}</div>
                                <div className={styles.location}>
                                  <svg viewBox="0 0 24 24" className={styles.locationIcon}>
                                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                  </svg>
                                  {job.location}
                                </div>
                                <div className={`${styles.enrolledCount} ${job.enrolledCount > 50 ? styles.highEnrollment : ''}`}>
                                  <svg viewBox="0 0 24 24" className={styles.enrolledIcon}>
                                    <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7z"/>
                                  </svg>
                                  {job.enrolledCount > 0 ? `${job.enrolledCount} people enrolled` : 'No enrollments yet'}
                                </div>
                              </div>
                              <div className={styles.skillTags}>
                                {job.skills.map((skill, index) => (
                                  <span key={index} className={styles.skillTag}>{skill}</span>
                                ))}
                              </div>
                              <div className={styles.jobFooter}>
                                <div className={styles.timeInfo}>
                                  <span>Posted {job.postedTime}</span>
                                  <span className={styles.dot}>•</span>
                                  <span>{job.expiresIn}</span>
                                </div>
                                <div className={styles.actions}>
                                  <div className={styles.eligibilityStatus}>
                                    {appliedJobs.some(j => j.id === job.id) ? (
                                      <div className={styles.alreadyApplied}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Applied
                                      </div>
                                    ) : (
                                      'Registration Closed'
                                    )}
                                  </div>
                                  <button 
                                    className={styles.checkDetailsButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenJobDetails(job);
                                    }}
                                  >
                                    Check Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </section>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={styles.tabContent}>
              <div className={styles.applicationsContainer}>
                {appliedJobs.length > 0 ? (
                  <>
                    <h2 className={styles.sectionTitle}>
                      My Applications
                      <span className={styles.applicationCount}>{appliedJobs.length} application{appliedJobs.length !== 1 ? 's' : ''}</span>
                    </h2>
                    <section className={styles.jobsList}>
                      {appliedJobs.map(job => (
                        <div key={job.id} className={styles.jobCard}>
                          <button 
                            className={styles.closeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeJob(job.id);
                            }}
                            aria-label="Remove job"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <div className={styles.companyLogo}>
                            <img 
                              src={job.companyLogo} 
                              alt={`${job.company} logo`}
                              onError={(e) => handleLogoError(e, job)}
                            />
                          </div>
                          <div className={styles.jobContent}>
                            <div className={styles.jobHeader}>
                              <div className={styles.companyInfo}>
                                <h3 className={styles.companyName}>{job.company}</h3>
                                <div className={styles.lpa}>{job.lpa}</div>
                                <button
                                  className={`${styles.bookmarkButton} ${job.isBookmarked ? styles.bookmarked : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(job.id);
                                  }}
                                  aria-label={job.isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill={job.isBookmarked ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                                  </svg>
                                </button>
                              </div>
                              <div className={styles.jobTitle}>{job.title}</div>
                              <div className={styles.location}>
                                <svg viewBox="0 0 24 24" className={styles.locationIcon}>
                                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                {job.location}
                              </div>
                              <div className={`${styles.enrolledCount} ${job.enrolledCount > 50 ? styles.highEnrollment : ''}`}>
                                <svg viewBox="0 0 24 24" className={styles.enrolledIcon}>
                                  <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7z"/>
                                </svg>
                                {job.enrolledCount > 0 ? `${job.enrolledCount} people enrolled` : 'No enrollments yet'}
                              </div>
                            </div>
                            <div className={styles.skillTags}>
                              {job.skills.map((skill, index) => (
                                <span key={index} className={styles.skillTag}>{skill}</span>
                              ))}
                            </div>
                            <div className={styles.jobFooter}>
                              <div className={styles.timeInfo}>
                                <span>Posted {job.postedTime}</span>
                                <span className={styles.dot}>•</span>
                                <span>Expires in {job.expiresIn}</span>
                              </div>
                              <div className={styles.actions}>
                                <div className={styles.applicationStatus}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div>
                                    <div>Application Submitted</div>
                                    <div className={styles.appliedTime}>
                                      {job.appliedAt ? `Applied on ${job.appliedAt}` : 'Recently applied'}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  className={styles.checkDetailsButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenJobDetails(job);
                                  }}
                                >
                                  Check Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </section>
                  </>
                ) : (
                  <div className={styles.noApplications}>
                    <div className={styles.noApplicationsIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3>No Applications Yet</h3>
                    <p>You haven't applied to any jobs yet. Browse available jobs and apply!</p>
                    <button 
                      className={styles.browseJobsButton}
                      onClick={() => setActiveTab('recommended')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Jobs
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Add footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>About KodJobs</h3>
              <p>Your gateway to tech opportunities. Find your dream job in technology and software development.</p>
              <div className={styles.footerSocial}>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h3>For Job Seekers</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/profile">Create Profile</a></li>
                <li><a href="/saved-jobs">Saved Jobs</a></li>
                <li><a href="/job-alerts">Job Alerts</a></li>
                <li><a href="/career-resources">Career Resources</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3>For Employers</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/post-job">Post a Job</a></li>
                <li><a href="/browse-candidates">Browse Candidates</a></li>
                <li><a href="/pricing">Pricing Plans</a></li>
                <li><a href="/recruitment-solutions">Recruitment Solutions</a></li>
              </ul>
            </div>

            <div className={styles.footerSection}>
              <h3>Support</h3>
              <ul className={styles.footerLinks}>
                <li><a href="/help-center">Help Center</a></li>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/feedback">Feedback</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <div>© {new Date().getFullYear()} KodJobs. All rights reserved.</div>
            <div>
              <a href="/privacy">Privacy Policy</a> • <a href="/terms">Terms of Service</a> • <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </footer>
      </div>

      {showScrollTop && (
        <button 
          className={styles.scrollTopButton}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className={styles.modalOverlay}>
          <div className={styles.jobModal} ref={modalRef}>
            <button className={styles.closeModalButton} onClick={handleCloseJobDetails}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className={styles.modalHeader}>
              <div className={styles.modalCompanyLogo}>
                <img 
                  src={selectedJob.companyLogo} 
                  alt={`${selectedJob.company} logo`}
                  onError={(e) => handleLogoError(e, selectedJob)}
                />
              </div>
              <div className={styles.modalCompanyInfo}>
                <h2 className={styles.modalJobTitle}>{selectedJob.title}</h2>
                <div className={styles.modalCompanyName}>{selectedJob.company}</div>
                <div className={styles.modalLocation}>
                  <svg viewBox="0 0 24 24" className={styles.locationIcon}>
                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {selectedJob.location}
                </div>
                {selectedJob.employmentType && (
                  <div className={styles.modalEmploymentType}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {selectedJob.employmentType}
                  </div>
                )}
              </div>
              <div className={styles.modalSalary}>
                <div className={styles.modalLpa}>{selectedJob.lpa}</div>
                <div className={styles.modalEnrolled}>
                  <svg viewBox="0 0 24 24" className={styles.enrolledIcon}>
                    <path fill="currentColor" d="M16 17v2H2v-2s0-4 7-4 7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.39 3.39 0 0 0-1.93.59 5 5 0 0 1 0 5.82A3.39 3.39 0 0 0 15 11a3.5 3.5 0 0 0 0-7z"/>
                  </svg>
                  {selectedJob.enrolledCount} people enrolled
                </div>
              </div>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Required Skills</h3>
                <div className={styles.modalSkillTags}>
                  {selectedJob.skills.map((skill, index) => (
                    <span key={index} className={styles.modalSkillTag}>{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Job Description</h3>
                <p className={styles.modalDescription}>
                  {selectedJob.jobDescription || `We are looking for a talented ${selectedJob.title} to join our team at ${selectedJob.company}. 
                  This is an exciting opportunity to work on cutting-edge projects in a collaborative environment.`}
                </p>
              </div>
              
              {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Responsibilities</h3>
                  <ul className={styles.modalList}>
                    {selectedJob.responsibilities.map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>Qualifications</h3>
                <ul className={styles.modalList}>
                  <li>Strong proficiency in {selectedJob.skills.slice(0, 3).join(', ')}</li>
                  <li>Experience with {selectedJob.skills.slice(3).join(', ')}</li>
                  <li>Excellent problem-solving and communication skills</li>
                  <li>Experience with agile development methodologies</li>
                </ul>
              </div>
              
              {selectedJob.benefits && selectedJob.benefits.length > 0 ? (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Benefits</h3>
                  <ul className={styles.modalList}>
                    {selectedJob.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className={styles.modalSection}>
                  <h3 className={styles.modalSectionTitle}>Benefits</h3>
                  <ul className={styles.modalList}>
                    <li>Competitive salary: {selectedJob.lpa}</li>
                    <li>Flexible work hours and remote work options</li>
                    <li>Health insurance and wellness programs</li>
                    <li>Professional development opportunities</li>
                    <li>Modern office with great amenities</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <div className={styles.modalTimeInfo}>
                <span>Posted {selectedJob.postedTime}</span>
                <span className={styles.dot}>•</span>
                <span>Expires in {selectedJob.expiresIn}</span>
              </div>
              {appliedJobs.some(job => job.id === selectedJob.id) ? (
                <div className={styles.modalApplicationStatus}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div>Application Submitted</div>
                    <div className={styles.appliedTime}>
                      {selectedJob.appliedAt ? `Applied on ${selectedJob.appliedAt}` : 'Recently applied'}
                    </div>
                  </div>
                </div>
              ) : selectedJob.isEligible ? (
                <button 
                  className={styles.applyButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyForJob(selectedJob.id);
                  }}
                >
                  Apply Now
                </button>
              ) : (
                <div className={styles.notEligibleMessage}>
                  Registration Closed
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobDashboard; 