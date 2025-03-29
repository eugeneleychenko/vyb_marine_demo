import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass } from "lucide-react";
import { Conversation } from '@11labs/client';
import HamburgerMenu from './components/HamburgerMenu';
import GenerateLandingPage from './components/GenerateLandingPage';

// Declare the custom element type for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'agent-id': string;
      }, HTMLElement>;
    }
  }

  interface ElevenLabsConvaiEvent extends CustomEvent {
    detail: {
      config: {
        clientTools: {
          openCalendly: () => void;
          openEmployeeTurnover: () => void;
          openOnboarding: () => void;
          openCompliance: () => void;
          openProductivity: () => void;
          openCustomerChurn: () => void;
          openPeerLearning: () => void;
          openKnowledgeRetention: () => void;
          openSeeALearnie: () => void;
          openFactsFigures: () => void;
          openNewsletter: () => void;
          getIndustry: (industry: string) => void;
          getCompanySize: (companySize: string) => void;
          getChallenges: (challenges: string) => void;
          getGoals: (goals: string) => void;
          getExistingSolutions: (solutions: string) => void;
        };
      };
    };
  }
}

interface OverlayProps {
  onClose: () => void;
}

function Overlay({ onClose }: OverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl max-w-2xl w-full relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">Stopping Customer Churn</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="https://i0.wp.com/mylearnie.com/wp-content/uploads/2024/12/Learnie_SAAS_v2_web_graphic_011625-1.png?w=1600&quality=51&ssl=1"
              alt="Learnie SAAS Graphic"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="prose prose-invert">
            <p className="text-gray-300 leading-relaxed">
              Customer churn is one of the most critical challenges facing businesses today. It's not just about losing a customer; it's about losing the potential lifetime value, referrals, and market presence that customer represents. Understanding and preventing churn requires a sophisticated, data-driven approach combined with human insight.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              The key to preventing churn lies in early detection and proactive engagement. By analyzing customer behavior patterns, usage metrics, and satisfaction indicators, businesses can identify at-risk customers before they decide to leave. This early warning system allows companies to intervene with personalized retention strategies.
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              Successful churn prevention strategies often include:
              • Regular check-ins and personalized communication
              • Value-added services and exclusive benefits
              • Continuous product improvement based on feedback
              • Customer success programs and education
              • Proactive problem resolution
            </p>
            <p className="text-gray-300 leading-relaxed mt-4">
              By implementing these strategies through bite-sized learning modules, teams can quickly adapt and respond to customer needs, creating stronger relationships and reducing churn rates significantly. The focus should be on creating value at every customer touchpoint and ensuring that your team has the knowledge and tools to deliver exceptional experiences consistently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface K12OverlayProps {
  onClose: () => void;
}

function K12Overlay({ onClose }: K12OverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-3xl w-full relative max-h-[90vh] flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
        >
          ✕
        </button>
        
        <div className="p-8 overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-cyan-400">Professional Development Made Easy</h2>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-xl mb-8">
              Learnie® partners with Aurora Public Schools in Colorado, giving their teachers a chance to get salary advancement credits by watching bite sized microlessons.
            </p>

            <h3 className="text-2xl font-semibold mb-4">Why Learnie for K-12 Teacher Development?</h3>
            
            <ul className="space-y-3 mb-8">
              <li>✓ Bite-Sized Video-based Learning</li>
              <li>✓ Peer-Driven Learning Communities</li>
              <li>✓ Customizable tailored content</li>
              <li>✓ On-Demand, Anytime Access</li>
            </ul>

            <img 
              src="https://i0.wp.com/mylearnie.com/wp-content/uploads/2024/09/Screenshot-2024-09-30-at-5.01.49%E2%80%AFPM.png?fit=800%2C473&quality=51&ssl=1"
              alt="Learnie K12 Platform"
              className="w-full rounded-lg mb-8"
            />

            <h3 className="text-2xl font-semibold mb-4">Transform the way your teachers learn, grow, and lead</h3>
            
            <ul className="space-y-3 mb-8">
              <li>✓ Cost-Effective Professional Development</li>
              <li>✓ Track Teacher Progress and Growth</li>
              <li>✓ Engagement That Lasts</li>
              <li>✓ Learnie Professional Services Support</li>
            </ul>

            <div className="flex justify-center gap-4 mt-8">
              <a href="https://apps.apple.com/us/app/learnie-app/id1514939672" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://i0.wp.com/mylearnie.com/wp-content/uploads/2022/06/icons_app-store-apple.png?fit=300%2C89&quality=51&ssl=1"
                  alt="Download on App Store"
                  className="h-12"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.daze.learnie" target="_blank" rel="noopener noreferrer">
                <img 
                  src="https://i0.wp.com/mylearnie.com/wp-content/uploads/2022/06/icons_app-store-google-play.png?fit=300%2C89&quality=51&ssl=1"
                  alt="Get it on Google Play"
                  className="h-12"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define FeatureCard props interface
interface FeatureCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// TalkButton component for ElevenLabs Conversational AI
interface TalkButtonProps {
  agentId: string;
}

function TalkButton({ agentId }: TalkButtonProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const toggleConversation = useCallback(async () => {
    if (isLoading) return; // Prevent multiple clicks while processing
    
    if (!isConnected) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start the conversation
        const newConversation = await Conversation.startSession({
          agentId: agentId, // Use the provided agent ID
          onConnect: () => {
            setIsConnected(true);
            setIsLoading(false);
            console.log('Connected to agent');
          },
          onDisconnect: () => {
            setIsConnected(false);
            console.log('Disconnected from agent');
          },
          onError: (error) => {
            console.error('Error during conversation:', error);
            setError('Error during conversation. Please try again.');
            setIsLoading(false);
            setIsConnected(false);
          },
          onModeChange: (mode) => {
            console.log('Mode changed:', mode.mode);
          },
          // Register client tools directly with the Conversation instance
          clientTools: {
            openCalendly: () => {
              // Use a function that has access to the app's state
              window.dispatchEvent(new CustomEvent('learnie:openCalendly'));
            },
            openEmployeeTurnover: () => {
              window.dispatchEvent(new CustomEvent('learnie:openEmployeeTurnover'));
            },
            openOnboarding: () => {
              window.dispatchEvent(new CustomEvent('learnie:openOnboarding'));
            },
            openCompliance: () => {
              window.dispatchEvent(new CustomEvent('learnie:openCompliance'));
            },
            openProductivity: () => {
              window.dispatchEvent(new CustomEvent('learnie:openProductivity'));
            },
            openCustomerChurn: () => {
              window.dispatchEvent(new CustomEvent('learnie:openCustomerChurn'));
            },
            openPeerLearning: () => {
              window.dispatchEvent(new CustomEvent('learnie:openPeerLearning'));
            },
            openKnowledgeRetention: () => {
              window.dispatchEvent(new CustomEvent('learnie:openKnowledgeRetention'));
            },
            openSeeALearnie: () => {
              window.dispatchEvent(new CustomEvent('learnie:openSeeALearnie'));
            },
            openFactsFigures: () => {
              window.dispatchEvent(new CustomEvent('learnie:openFactsFigures'));
            },
            openNewsletter: () => {
              window.dispatchEvent(new CustomEvent('learnie:openNewsletter'));
            },
            getIndustry: (industry: string) => {
              console.log('Industry:', industry);
              window.dispatchEvent(new CustomEvent('learnie:getIndustry', { detail: { industry } }));
            },
            getCompanySize: (companySize: string) => {
              console.log('Company Size:', companySize);
              window.dispatchEvent(new CustomEvent('learnie:getCompanySize', { detail: { companySize } }));
            },
            getChallenges: (challenges: string) => {
              console.log('Challenges:', challenges);
              window.dispatchEvent(new CustomEvent('learnie:getChallenges', { detail: { challenges } }));
            },
            getGoals: (goals: string) => {
              console.log('Goals:', goals);
              window.dispatchEvent(new CustomEvent('learnie:getGoals', { detail: { goals } }));
            },
            getExistingSolutions: (solutions: string) => {
              console.log('Existing Solutions:', solutions);
              window.dispatchEvent(new CustomEvent('learnie:getExistingSolutions', { detail: { existingSolutions: solutions } }));
            }
          }
        });
        
        setConversation(newConversation);
      } catch (error) {
        console.error('Failed to start conversation:', error);
        setError('Failed to start conversation. Please check your microphone permissions.');
        setIsLoading(false);
      }
    } else {
      // End the conversation
      setIsLoading(true);
      try {
        if (conversation) {
          await conversation.endSession();
          setConversation(null);
        }
        setIsConnected(false);
      } catch (error) {
        console.error('Error ending conversation:', error);
        setError('Error ending conversation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isConnected, conversation, agentId, isLoading]);

  // Determine the appropriate class based on state
  const buttonClass = `relative cursor-pointer ${
    isLoading ? 'opacity-70' : ''
  } ${isConnected ? 'animate-pulse' : ''}`;

  return (
    <div className="relative flex flex-col items-center">
      <div 
        onClick={toggleConversation}
        className={`${buttonClass} w-full h-full aspect-square rounded-full min-w-[80px] min-h-[80px] flex items-center justify-center transition-transform duration-300 hover:scale-105 group`}
      >
        {/* Gradient orb background */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#008a12] via-[#4ade80] to-[#008a12] opacity-70 blur-md transition-all duration-300 group-hover:opacity-80 ${isConnected ? 'animate-pulse-slow scale-110' : ''}`}></div>
        
        {/* Second gradient layer for depth */}
        <div className={`absolute inset-[10%] rounded-full bg-gradient-to-br from-[#4ade80] to-[#008a12] opacity-50 blur-sm transition-all duration-300 group-hover:blur-md group-hover:opacity-60 ${isConnected ? 'animate-pulse opacity-70' : ''}`}></div>
        
        {/* Glow effect when active */}
        {isConnected && (
          <div className="absolute inset-0 rounded-full bg-[#008a12] opacity-20 blur-xl animate-pulse"></div>
        )}
        
        {/* White circular background - made larger to fully contain the lightbulb */}
        <div className={`absolute inset-[5%] bg-white rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl ${isConnected ? 'shadow-[0_0_15px_rgba(0,138,18,0.5)]' : ''}`}></div>
        
        {/* Curved "Learnie Guide" text at the top of the circle */}
        <div className="absolute inset-0 z-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
            <defs>
              <path id="textArc" d="M 15,50 A 35,35 0 0,1 85,50" />
            </defs>
            <text className={`fill-[#008a12] text-center font-['Montserrat'] font-semibold`} style={{ fontSize: '10px' }}>
              <textPath xlinkHref="#textArc" startOffset="50%" textAnchor="middle">
                Learnie Agent
              </textPath>
            </text>
          </svg>
        </div>
        
        {/* Image on top - kept the same size to maintain proportions */}
        <img 
          src="./bulb_ai-removebg-preview.png" 
          alt="Click to Begin" 
          className={`w-[60%] h-[60%] md:w-[70%] md:h-[70%] object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 ${isConnected ? 'scale-105' : ''}`}
        />
        
        {/* Text inside the circle */}
        <div className="absolute bottom-[13%] md:bottom-[15%] left-0 right-0 text-center z-20">
          <span className={`text-[14px] md:text-[min(1.9vw,14px)] font-medium transition-colors duration-300 font-['Montserrat'] ${isConnected ? 'text-[#008a12] font-bold' : 'text-[#008a12]'}`}>
            {isLoading ? 'Processing...' : isConnected ? 'Click to stop' : 'Click to Begin'}
          </span>
        </div>
      </div>
      
      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-['Montserrat']">
          {error}
        </div>
      )}
    </div>
  );
}

function Drawer({ isOpen, onClose, children }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer - Updated for mobile responsiveness */}
      <div 
        className={`fixed right-0 top-0 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 overflow-hidden
          w-full sm:w-[90%] md:w-[600px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full relative flex flex-col">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 z-10"
            aria-label="Close"
          >
            <span className="text-xl">✕</span>
          </button>
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

interface EmployeeTurnoverOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function EmployeeTurnoverOverlay({ onClose, openCalendly }: EmployeeTurnoverOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Employee Turnover Solutions</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          <div className="w-full mb-6 rounded-lg overflow-hidden aspect-video">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/FDybrgAZjWo?autoplay=0&rel=0" 
              title="Learnie Brand Video"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              High employee turnover can significantly impact your organization's productivity, morale, and bottom line. The cost of replacing an employee can range from 50% to 200% of their annual salary, making retention a critical business priority.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Common Causes of Turnover</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• Lack of career development opportunities</li>
              <li>• Poor management and leadership</li>
              <li>• Inadequate onboarding and training</li>
              <li>• Misalignment with company culture</li>
              <li>• Compensation and benefits concerns</li>
            </ul>
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">How Learnie Helps Reduce Turnover</h3>
            <p className="text-gray-600 leading-relaxed">
              Learnie's microlearning platform addresses key turnover factors by providing:
            </p>
            <ul className="space-y-3 mt-3 text-gray-600">
              <li>• Personalized career development paths</li>
              <li>• Leadership and management training modules</li>
              <li>• Structured onboarding programs</li>
              <li>• Culture-building content and activities</li>
              <li>• Skills development that increases employee value</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Organizations using Learnie have reported up to 35% reduction in turnover rates within the first year of implementation. Our bite-sized learning approach ensures high engagement and completion rates, making it easier for employees to develop the skills they need to succeed in your organization.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OnboardingOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function OnboardingOverlay({ onClose, openCalendly }: OnboardingOverlayProps) {
  // Use useEffect to autoplay the YouTube video when the modal opens
  React.useEffect(() => {
    // The YouTube iframe API will handle autoplay
    // The video will start playing as soon as it's loaded
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Onboard Your Workforce Quickly and Efficiently</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Added Onboarding Image */}
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="/Learnie_onboarding.png" 
              alt="Learnie Onboarding Solution" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          
          {/* YouTube Video Embed - with autoplay and related videos disabled */}
          {/* <div className="w-full mb-6 rounded-lg overflow-hidden aspect-video">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/FDybrgAZjWo?autoplay=1&rel=0" 
              title="Learnie Onboarding Video"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div> */}
          
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              The <strong>Learnie® Business Onboarding Suite</strong> helps companies get started quickly with Learnie and focuses on new employees – mostly entry level positions – to be swiftly onboarded with Learnie's conversational style content. Quick, to the point videos, to guide your new crew right in their pocket!
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Key Onboarding Benefits</h3>
            <ul className="space-y-3 text-gray-600">
              <li>• 3x faster onboarding for new employees</li>
              <li>• Reduce training costs by 40% with efficient microlearning</li>
              <li>• Increase knowledge retention with bite-sized content</li>
              <li>• Engage new hires with interactive, mobile-friendly training</li>
              <li>• Track onboarding progress with detailed analytics</li>
            </ul>
            
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Onboarding Content Includes</h3>
            <p className="text-gray-600 leading-relaxed">
              Our onboarding suite includes four "learning journeys" covering essential topics:
            </p>
            <ul className="space-y-3 mt-3 text-gray-600">
              <li>• First week essentials (paperwork, accounts, payroll)</li>
              <li>• Company culture and values</li>
              <li>• Role-specific training modules</li>
              <li>• Compliance and policy training</li>
            </ul>
            
            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComplianceOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function ComplianceOverlay({ onClose, openCalendly }: ComplianceOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Less Painful & More Engaging: Compliance & Regulations Training</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Added Compliance Regulations Image */}
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="/Learnie_compliance_regulations.png" 
              alt="Learnie Compliance Regulations Solution" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Let's be honest—traditional compliance training is boring, time-consuming, and ineffective. Endless slides, long-winded lectures, and lifeless modules make employees zone out rather than engage. But what if compliance training was actually social, interactive, and relevant?
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Welcome to Learnie: Community Microlearning—where compliance and regulations training becomes engaging, social, and powered by real people in your organization.
            </p>
            
            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Microlearning + Community = Smarter Compliance Training</h3>
            <p className="text-gray-600 leading-relaxed">
              With Learnie, compliance training doesn't have to feel like a chore. Our user-generated content platform lets your workforce create and share short, relatable video lessons—keeping training fresh, relevant, and even enjoyable.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Bite-sized learning: Quick, digestible videos replace long, monotonous courses</li>
              <li>• Peer-driven training: Employees learn from their own colleagues, not nameless, faceless presenters</li>
              <li>• Relatable content: Learners connect with people they see in the halls or on Zoom, making the training more meaningful</li>
              <li>• Ongoing engagement: Frequent updates ensure teams stay on top of the latest compliance standards effortlessly</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Capture the Magic of Your Best & Brightest</h3>
            <p className="text-gray-600 leading-relaxed">
              Every company has subject matter experts (SMEs)—the people who truly understand compliance and regulations from experience. With Learnie, you can capture and share their knowledge in a way that feels authentic and relevant.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• SME-driven training: Your top experts create content that actually matters</li>
              <li>• Company-specific context: Employees get real-world examples they can apply instantly</li>
              <li>• Scalable & dynamic: Update compliance training as laws and regulations evolve—no more outdated, cookie-cutter content</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Engage, Inspire, and Retain Your Team</h3>
            <p className="text-gray-600 leading-relaxed">
              Learnie doesn't just check the compliance box—it creates a learning culture that engages employees and makes them feel valued:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Build a learning community where employees actively participate</li>
              <li>• Increase retention by making training feel like an investment in growth, not just a requirement</li>
              <li>• Reduce compliance risk by ensuring training is effective, up-to-date, and actually retained</li>
            </ul>

            <p className="text-gray-600 leading-relaxed mt-4 font-bold">
              Compliance Training Doesn't Have to Be Painful!
            </p>

            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductivityOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function ProductivityOverlay({ onClose, openCalendly }: ProductivityOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Boost Workforce Productivity & Efficiency with Learnie</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Added Productivity Image */}
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="/Learnie_productivity.png" 
              alt="Learnie Productivity Solution" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Your workforce is busier than ever—so why waste time on long, outdated training sessions? Traditional learning methods slow down productivity, drain resources, and struggle to keep up with today's fast-moving digital world.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie: Community Microlearning, your team can learn smarter, faster, and in a way that actually fits into their workday.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Bite-Sized Learning = Big Productivity Gains</h3>
            <p className="text-gray-600 leading-relaxed">
              Let's face it—employees don't have hours to sit through training modules. Learnie's microlearning approach delivers quick, impactful lessons that fit into even the busiest schedules.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Learn in minutes, not hours—short, digestible videos keep training efficient</li>
              <li>• On-demand access—employees can learn when and where they need it</li>
              <li>• Zero productivity loss—no more pulling teams away from work for all-day training sessions</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie, your team spends less time in training and more time applying new skills in real-time—directly boosting productivity.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Cut Training Costs by 40% with Microlearning Efficiency</h3>
            <p className="text-gray-600 leading-relaxed">
              Old-school training methods waste time and money. Between expensive course development, long classroom sessions, and lost work hours, traditional training costs companies millions every year. Learnie slashes training costs by up to 40% by:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Eliminating expensive third-party courses—use real experts in your own organization</li>
              <li>• Reducing training time—short lessons get employees up to speed faster</li>
              <li>• Minimizing downtime—teams train without stepping away from critical work</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie, you get higher retention, better efficiency, and a much lower cost per employee.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Speed to Proficiency for Digital Natives</h3>
            <p className="text-gray-600 leading-relaxed">
              Your workforce spends ALL of their free time watching short videos from total strangers. So why would they want to be trained at work with long, outdated methods that don't match how they already consume content?
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Engage digital natives with a training format they already love—short, interactive videos</li>
              <li>• Increase speed to proficiency—employees learn new skills in real-time, not in weeks</li>
              <li>• Make learning second nature—just like scrolling social media, but with real workplace impact</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Learnie delivers learning the way modern workers expect—fast, engaging, and interactive.
            </p>

            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CustomerChurnOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function CustomerChurnOverlay({ onClose, openCalendly }: CustomerChurnOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Stop Customer Churn with Smarter, Faster Training from Learnie</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Added Customer Churn Image */}
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="/Learnie_customer_churn.png" 
              alt="Learnie Customer Churn Solution" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Customer churn is the silent revenue killer—and it often happens because customers feel unsupported, frustrated, or disconnected from your brand. The solution? A well-trained, knowledgeable team that delivers seamless, high-quality customer experiences every time.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie: Community Microlearning, you can train your sales teams, customer success teams, and frontline workers quickly and effectively—ensuring they have the skills and confidence to engage, support, and retain customers.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Knowledgeable Teams = Happy, Loyal Customers</h3>
            <p className="text-gray-600 leading-relaxed">
              Customers don't just leave because of pricing or competition—they leave when they feel undervalued or unsupported. Every customer interaction matters. Learnie helps your team stay ahead by giving them the tools they need to succeed.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Sales teams learn how to communicate value, handle objections, and close deals more effectively</li>
              <li>• Customer success teams get instant access to training on features, updates, and best practices—ensuring customers always get the right support</li>
              <li>• Frontline workers stay up-to-date on policies, promotions, and customer service skills, leading to smoother experiences</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              When your team feels confident and informed, customers feel valued—and valued customers don't churn.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Quick, Continuous Training = Stronger Customer Retention</h3>
            <p className="text-gray-600 leading-relaxed">
              Traditional training methods aren't built for fast-moving customer needs. Sitting through hours of training doesn't prepare employees for real-world customer interactions. Learnie's bite-sized, on-demand training ensures your team learns in real time.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Short, practical lessons—train your teams in minutes, not hours</li>
              <li>• On-demand access—so employees can review key info whenever they need it</li>
              <li>• Real-time product updates—train your team on the latest features before customers even ask</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              When your employees stay sharp, informed, and customer-focused, retention skyrockets.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Share Tips, Tricks, Demos & Updates with Ease</h3>
            <p className="text-gray-600 leading-relaxed">
              Great customer experiences don't happen by accident—they're built with knowledge, confidence, and preparation. Learnie lets your team easily create and share:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Quick video demos of new features or updates</li>
              <li>• Tips & tricks on handling customer challenges</li>
              <li>• Best practices for providing exceptional service</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              No need for complicated LMS systems or outdated training manuals—just fast, relevant learning that keeps your team (and your customers) happy.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">From SaaS to Retail—Equip Your Team for Success</h3>
            <p className="text-gray-600 leading-relaxed">
              Whether you're running a SaaS company, a retail business, or a restaurant, one thing is universal: a knowledgeable, well-trained team creates loyal customers.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• SaaS companies can train customer success teams to ensure smooth onboarding and ongoing support</li>
              <li>• Retail teams can stay up-to-date on product knowledge and sales techniques</li>
              <li>• Restaurants can quickly train staff on customer service and menu updates</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              When employees know their stuff, customers feel valued, heard, and supported—and they stick around.
            </p>

            <p className="text-gray-600 leading-relaxed mt-6 font-bold">
              Train Smarter. Retain Customers. Stop the Churn.<br />
              Happy, informed teams = happy, loyal customers.
            </p>

            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PeerLearningOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function PeerLearningOverlay({ onClose, openCalendly }: PeerLearningOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Peer-to-Peer Learning That Feels Like a Social App</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* Added Peer-to-Peer Learning Image */}
          <div className="w-full mb-6 rounded-lg overflow-hidden">
            <img 
              src="/Learnie_peer_to_peer.png" 
              alt="Learnie Peer-to-Peer Learning Solution" 
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Traditional learning systems feel stale, outdated, and disconnected from how people actually learn. Long, one-size-fits-all courses don't inspire employees to engage, share, or retain information.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Learnie changes that. Our Peer-to-Peer (Social) Learning is built more like a social app than a traditional LMS. It creates a culture of learning by empowering employees to share knowledge, collaborate, and learn from each other in a dynamic, engaging way.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">From Top-Down Training to Peer-Driven Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Employees don't learn best from static training manuals or hours-long courses. They learn from each other. With Learnie's peer-to-peer learning, your organization can:
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Tap into internal expertise—employees share real-world best practices</li>
              <li>• Break down silos—knowledge flows across departments and work groups</li>
              <li>• Encourage continuous learning—everyone is a learner and a teacher</li>
              <li>• Capture institutional knowledge—so critical insights don't leave when employees do</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Instead of forcing top-down training, Learnie fosters an organic learning culture where knowledge is shared by the people who know the work best—your own team.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">The "Community" in Community Microlearning</h3>
            <p className="text-gray-600 leading-relaxed">
              Most learning systems feel isolated and rigid. Learnie creates a connected learning experience where teams interact just like they would on social platforms.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Create and share short videos on best practices, tips, and updates</li>
              <li>• Engage with content through comments, likes, and discussion</li>
              <li>• Encourage participation with gamification and recognition</li>
              <li>• Learn from real people—not faceless training modules</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie, learning feels natural, dynamic, and continuous. Employees don't just consume content—they contribute to it, engage with it, and make it their own.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Capture & Share Institutional Knowledge Before It Walks Out the Door</h3>
            <p className="text-gray-600 leading-relaxed">
              Every company has hidden experts—employees who know the best ways to get things done but don't always have a way to share that knowledge. Learnie ensures that their valuable insights don't get lost.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Preserve best practices across teams and generations</li>
              <li>• Make knowledge accessible to everyone in the organization</li>
              <li>• Reduce ramp-up time for new employees with instant peer-driven insights</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              With Learnie, institutional knowledge becomes a shared resource, not a lost asset.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">A Social Learning Experience That Works for Everyone</h3>
            <p className="text-gray-600 leading-relaxed">
              Whether you're training customer success teams, frontline employees, or corporate leaders, Learnie creates a space where learning happens naturally and socially.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Sales teams can share winning pitches and techniques</li>
              <li>• Customer support teams can swap best practices on handling tough situations</li>
              <li>• Technical teams can record and share process improvements</li>
              <li>• Leadership teams can offer mentorship and insights in a way that scales</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              The result? A smarter, more connected workforce where learning never stops.
            </p>

            <p className="text-gray-600 leading-relaxed mt-6 font-bold">
              Bring Social Learning to Your Organization with Learnie<br />
              When employees teach each other, learning sticks.<br />
              When knowledge is shared, your organization thrives.<br />
              When learning is social, it becomes part of your culture.
            </p>

            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface KnowledgeRetentionOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function KnowledgeRetentionOverlay({ onClose, openCalendly }: KnowledgeRetentionOverlayProps) {
  // Use useEffect to autoplay the YouTube video when the modal opens
  React.useEffect(() => {
    // The YouTube iframe API will handle autoplay
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">The Future of Learning is Micro</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          {/* YouTube Video Embed - with autoplay and related videos disabled */}
          <div className="w-full mb-6 rounded-lg overflow-hidden aspect-video">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/-toIEvelLR0?si=JRT9Wzc7pNVa6tAY&autoplay=1&rel=0" 
              title="Knowledge Retention Video"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          
          <p className="mb-4">
            Stop wasting time on ineffective, bloated training programs—switch to Learnie's microlearning approach and watch knowledge retention soar.
          </p>
          
          <p className="mb-4">
            Your workforce is busier than ever—and attention spans are shorter than ever. Long, drawn-out training just doesn't work anymore.
          </p>
          
          <p className="mb-4">
            With Learnie's microburst learning, companies can increase knowledge retention by delivering short, engaging, and memorable lessons that actually stick.
          </p>
          
          <h3 className="text-xl font-bold mb-2 text-[#008a12]">Short & Sweet = Learning That Lasts</h3>
          
          <p className="mb-4">
            Your frontline workforce doesn't have time for hour-long training sessions—and they won't remember most of it anyway. Learnie keeps training fast, focused, and effective.
          </p>
          
          <ul className="list-disc pl-5 mb-6">
            <li className="mb-2">Bite-sized lessons improve retention and recall.</li>
            <li className="mb-2">Quick, engaging videos fit into busy schedules.</li>
            <li className="mb-2">Reinforcement through repetition helps knowledge stick.</li>
            <li className="mb-2">On-demand access ensures employees can revisit key topics anytime.</li>
          </ul>
          
          <p className="mb-4">
            If your employees can binge-watch short videos on social media, they can just as easily absorb critical workplace knowledge through Learnie.
          </p>
          
          <h3 className="text-xl font-bold mb-2 text-[#008a12]">Train Smarter, Not Longer</h3>
          
          <p className="mb-4">
            The reality? If training isn't quick and engaging, it's forgotten. Learnie delivers learning in small bursts so employees can retain information without feeling overwhelmed.
          </p>
          
          <ul className="list-disc pl-5 mb-6">
            <li className="mb-2">Frontline teams can refresh skills in minutes, not hours.</li>
            <li className="mb-2">Sales teams can quickly review key product details before customer calls.</li>
            <li className="mb-2">Customer service reps can retain best practices through rapid reinforcement.</li>
          </ul>
          
          <p className="mb-4">
            By breaking learning into digestible moments, Learnie ensures that your workforce doesn't just learn—they remember.
          </p>
          
          <div className="mt-4 flex justify-center">
            <button
              onClick={openCalendly}
              className="bg-[#008a12] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#006a0e] transition-colors"
            >
              MEET WITH US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SeeALearnieOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function SeeALearnieOverlay({ onClose, openCalendly }: SeeALearnieOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">See What a Learnie Is</h2>
        
        <div className="overflow-y-auto pr-2 flex-1">
          <div className="w-full mb-6 rounded-lg overflow-hidden aspect-video">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/SnUO8RZMvG4" 
              title="What is a Learnie?"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              A Learnie is a microlesson made of :30 second video bursts that you can make as long as you'd like. But remember - if it's over 1:30, Too Long, Didn't Watch!
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Our bite-sized format ensures maximum engagement and retention, making learning feel more like scrolling through social media than traditional training.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FactsFiguresOverlayProps {
  onClose: () => void;
  openCalendly: () => void;
}

function FactsFiguresOverlay({ onClose, openCalendly }: FactsFiguresOverlayProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-xl max-w-2xl w-full relative h-[75vh] flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        
        <div className="overflow-y-auto pr-2 flex-1">
          <img 
            src="/Learnie_facts_figures.png" 
            alt="Learnie Facts and Figures" 
            className="w-full mb-6 object-contain max-h-96"
          />
          <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Learnie Facts & Figures</h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Learnie is transforming workforce training for good. As a public benefit corp and certified B Corp, we're on a mission to democratize and decentralize workforce training by putting it into the hands of those who do the work and know it best…your internal subject matter experts.
            </p>
            <br />
            <p className="text-gray-600 leading-relaxed">
              Our goal is to engage and inspire learners with short, on demand videos to help them excel at their jobs and progress in their careers. Of course, by doing so, we help businesses retain their workforce and grow.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">Why Community Microlearning?</h3>
            
            <p className="text-gray-600 leading-relaxed">
              Employee turnover is crippling…to families and to businesses. Did you know losing an employee costs a business often 1.5 - 2x their salary to replace that person. Moreso, traditional LMS' are top down, rigid, expensive and BORING.
            </p>
            <br />
            <p className="text-gray-600 leading-relaxed">
              Learnie's social, peer-to-peer style learning is bottom up and helps retention. While Learnie is user generated content it's also user generated "context." Learners lean in when they see someone from the company sharing their best practices.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-[#008a12]">How did Learnie Come About?</h3>
            <p className="text-gray-600 leading-relaxed">
              Our founders have decades of edtech and L&D experience. Unfortunately, after decades working in the highest levels of Fortune 500 businesses, we don't have a lot of great things to say about traditional learning systems or their success rates. We knew something had to be done.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              We thought: how can we accommodate modern learners and make learning stick while protecting the licenses to operate for businesses losing institutional knowledge to retirement and downsizing? How about a new platform inspired by social apps, microlearning and Japanese PechaKucha that helps companies quickly and effectively capture the best of their company's talent via short video and layered into learning journeys?
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              The result? Learnie's Community Microlearning — the perfect solution to distracted, disengaged and deskless learners
            </p>

            <div className="mt-6">
              <button 
                onClick={() => {
                  onClose();
                  openCalendly();
                }} 
                className="bg-[#008a12] hover:bg-[#006a0e] text-white py-3 px-8 rounded-lg transition duration-200"
              >
                Meet With Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NewsletterOverlayProps {
  onClose: () => void;
}

function NewsletterOverlay({ onClose }: NewsletterOverlayProps) {
  useEffect(() => {
    // Load HubSpot form script
    const script = document.createElement('script');
    script.src = '//js.hsforms.net/forms/embed/v2.js';
    script.async = true;
    script.charset = 'utf-8';
    script.onload = () => {
      // @ts-ignore - HubSpot forms global
      if (window.hbspt) {
        // @ts-ignore
        window.hbspt.forms.create({
          portalId: "8695411",
          formId: "6ff13fe8-cee2-4fc3-97fb-e7e5c8562c0e",
          region: "na1",
          target: '#newsletter-form-container'
        });
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up script when component unmounts
      const scriptToRemove = document.querySelector('script[src="//js.hsforms.net/forms/embed/v2.js"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-xl max-w-md w-full relative flex flex-col border-2 border-[#008a12]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-[#008a12]"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#008a12]">Stay in Touch With Us</h2>
        
        <div className="pr-2">
          <div className="prose max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              Sign up for our newsletter to receive the latest updates, tips, and insights from Learnie.
            </p>
            
            <div id="newsletter-form-container" className="w-full">
              {/* HubSpot form will be rendered here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Data collection state
  const [userIndustry, setUserIndustry] = useState<string[]>([]);
  const [userCompanySize, setUserCompanySize] = useState<string[]>([]);
  const [userChallenges, setUserChallenges] = useState<string[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [userExistingSolutions, setUserExistingSolutions] = useState<string[]>([]);
  
  // Calendly state
  const [showCalendly, setShowCalendly] = useState(false);
  const [showEmployeeTurnoverOverlay, setShowEmployeeTurnoverOverlay] = useState(false);
  const [showOnboardingOverlay, setShowOnboardingOverlay] = useState(false);
  const [showComplianceOverlay, setShowComplianceOverlay] = useState(false);
  const [showProductivityOverlay, setShowProductivityOverlay] = useState(false);
  const [showCustomerChurnOverlay, setShowCustomerChurnOverlay] = useState(false);
  const [showPeerLearningOverlay, setShowPeerLearningOverlay] = useState(false);
  const [showKnowledgeRetentionOverlay, setShowKnowledgeRetentionOverlay] = useState(false);
  const [showFactsFiguresOverlay, setShowFactsFiguresOverlay] = useState(false);
  const [showNewsletterOverlay, setShowNewsletterOverlay] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  
  // Track if we have all the required data
  const hasAllUserData = userIndustry && userCompanySize && userExistingSolutions && userExistingSolutions.length > 0;
  
  // TODO: Replace with your actual ElevenLabs agent ID from your ElevenLabs dashboard
  const [agentId, setAgentId] = useState("t1ntRmSdirioaqkczYq0");

  // Carousel state
  const heroImages = [
    "./1920x1080_teacherpd_01.jpg",
    "./1920x1080_solar.jpg", 
    "./1920x1080_RE.jpg"
  ];

  // Auto advance carousel every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

  // Navigate to specific slide
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Add a ref to track the See A Learnie modal
  const seeALearnieModalRef = useRef<HTMLElement | null>(null);

  // Function to close all modals
  const closeAllModals = () => {
    setShowCalendly(false);
    setShowEmployeeTurnoverOverlay(false);
    setShowOnboardingOverlay(false);
    setShowComplianceOverlay(false);
    setShowProductivityOverlay(false);
    setShowCustomerChurnOverlay(false);
    setShowPeerLearningOverlay(false);
    setShowKnowledgeRetentionOverlay(false);
    setShowFactsFiguresOverlay(false);
    setShowNewsletterOverlay(false);
    setShowLandingPage(false);
    
    // Also remove any "See A Learnie" modal from the DOM
    if (seeALearnieModalRef.current) {
      document.body.removeChild(seeALearnieModalRef.current);
      seeALearnieModalRef.current = null;
    }
    
    // As a fallback, also look for any modal by ID
    const existingModal = document.getElementById('see-a-learnie-modal');
    if (existingModal && existingModal.parentNode) {
      existingModal.parentNode.removeChild(existingModal);
    }
  };

  // Function to safely open a modal by closing others first
  const openModal = (setterFunction: (value: boolean) => void) => {
    closeAllModals();
    setterFunction(true);
  };

  // Function to show the See A Learnie iframe
  const handleOpenSeeALearnie = () => {
    // Close all other modals first
    closeAllModals();
    
    // Create a modal div for the iframe
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.id = 'see-a-learnie-modal'; // Add an ID for easier selection
    
    // Store reference to the modal
    seeALearnieModalRef.current = modal;
    
    // Create the content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'bg-white p-6 rounded-xl max-w-md w-full relative border-2 border-[#008a12] flex flex-col items-center justify-center';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.className = 'absolute top-4 right-4 text-gray-600 hover:text-[#008a12]';
    closeButton.onclick = () => {
      if (modal.parentNode) {
        document.body.removeChild(modal);
        seeALearnieModalRef.current = null;
      }
    };
    
    // Add iframe container for centering
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'flex items-center justify-center w-full';
    
    // Add the iframe
    const iframe = document.createElement('iframe');
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.marginHeight = "0";
    iframe.marginWidth = "0";
    iframe.width = "300";
    iframe.height = "510";
    iframe.src = "https://learnie.app/playCircle/NlBNdUFENExPd1VuQndxTFBYVk15U1VyNlRuMS0tYy0tLU9MamVQMlJlOGFYSjhMSnhzS28=";
    
    // Assemble the components
    iframeContainer.appendChild(iframe);
    contentContainer.appendChild(closeButton);
    contentContainer.appendChild(iframeContainer);
    modal.appendChild(contentContainer);
    
    // Add click handler to close when clicking outside
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        seeALearnieModalRef.current = null;
      }
    };
    
    // Add to body
    document.body.appendChild(modal);
  };

  // Function to check if we have all user data and show landing page
  const checkAndShowLandingPage = () => {
    // Check if all required fields are filled
    const hasIndustry = userIndustry && userIndustry.length > 0;
    const hasCompanySize = userCompanySize && userCompanySize.length > 0;
    const hasExistingSolutions = userExistingSolutions && userExistingSolutions.length > 0;
    
    console.log('Current state values:', {
      userIndustry,
      userCompanySize,
      userExistingSolutions
    });
    
    console.log('Data collection status:', {
      hasIndustry,
      hasCompanySize,
      hasExistingSolutions
    });
    
    // If all required data is collected, show the landing page
    if (hasIndustry && hasCompanySize && hasExistingSolutions) {
      console.log('All required data collected, showing landing page');
      console.log('Using data:', {
        industry: userIndustry[0],
        companySize: userCompanySize[0],
        existingSolutions: userExistingSolutions[0]
      });
      setShowLandingPage(true);
    } else {
      console.log('Missing required data, landing page will not show');
      console.log('Missing:', {
        industry: !hasIndustry,
        companySize: !hasCompanySize,
        existingSolutions: !hasExistingSolutions
      });
    }
  };

  useEffect(() => {
    // Add event listeners for the custom events
    const handleOpenCalendly = () => openModal(setShowCalendly);
    const handleOpenEmployeeTurnover = () => openModal(setShowEmployeeTurnoverOverlay);
    const handleOpenOnboarding = () => openModal(setShowOnboardingOverlay);
    const handleOpenCompliance = () => openModal(setShowComplianceOverlay);
    const handleOpenProductivity = () => openModal(setShowProductivityOverlay);
    const handleOpenCustomerChurn = () => openModal(setShowCustomerChurnOverlay);
    const handleOpenPeerLearning = () => openModal(setShowPeerLearningOverlay);
    const handleOpenKnowledgeRetention = () => openModal(setShowKnowledgeRetentionOverlay);
    const handleOpenFactsFigures = () => openModal(setShowFactsFiguresOverlay);
    const handleOpenNewsletter = () => openModal(setShowNewsletterOverlay);
    const handleGetIndustry = (event: CustomEvent) => {
      console.log('Industry event:', event);
      
      // Enhanced extraction to handle nested objects
      let industryValue = '';
      
      try {
        if (event.detail && typeof event.detail === 'object') {
          if ('industry' in event.detail) {
            const industryField = event.detail.industry;
            
            // Check if the industry field is itself an object with an industry property
            if (typeof industryField === 'object' && industryField !== null && 'industry' in industryField) {
              industryValue = industryField.industry;
            } 
            // Or if it's a string directly
            else if (typeof industryField === 'string') {
              industryValue = industryField;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting industry:', error);
      }
      
      console.log('Final extracted industry value:', industryValue);
      
      // Convert to array if it's a string
      const industry = typeof industryValue === 'string' && industryValue 
        ? [industryValue] 
        : Array.isArray(industryValue) ? industryValue : [];
        
      console.log('Industry array:', industry);
      setUserIndustry(industry);
      
      // Immediately check state after setting
      setTimeout(() => {
        console.log('Current industry state after update:', userIndustry);
        checkAndShowLandingPage();
      }, 100);
    };
    const handleGetCompanySize = (event: CustomEvent) => {
      console.log('Company Size event:', event);
      
      // Enhanced extraction to handle nested objects
      let companySizeValue = '';
      
      try {
        if (event.detail && typeof event.detail === 'object') {
          if ('companySize' in event.detail) {
            const companySizeField = event.detail.companySize;
            
            // Check if the companySize field is itself an object with a companySize property
            if (typeof companySizeField === 'object' && companySizeField !== null && 'companySize' in companySizeField) {
              companySizeValue = companySizeField.companySize;
            } 
            // Or if it's a string directly
            else if (typeof companySizeField === 'string') {
              companySizeValue = companySizeField;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting company size:', error);
      }
      
      console.log('Final extracted company size value:', companySizeValue);
      
      // Convert to array if it's a string
      const companySize = typeof companySizeValue === 'string' && companySizeValue 
        ? [companySizeValue] 
        : Array.isArray(companySizeValue) ? companySizeValue : [];
        
      console.log('Company Size array:', companySize);
      setUserCompanySize(companySize);
      
      // Add timeout to ensure state has updated
      setTimeout(() => {
        console.log('Current company size state after update:', userCompanySize);
        checkAndShowLandingPage();
      }, 100);
    };
    const handleGetChallenges = (event: CustomEvent) => {
      console.log('Challenges event:', event);
      console.log('Challenges detail:', event.detail);
      
      // Enhanced extraction to handle nested objects
      let challengesValue = '';
      
      try {
        if (event.detail && typeof event.detail === 'object') {
          if ('challenges' in event.detail) {
            const challengesField = event.detail.challenges;
            
            // Check if the challenges field is itself an object with a challenges property
            if (typeof challengesField === 'object' && challengesField !== null && 'challenges' in challengesField) {
              challengesValue = challengesField.challenges;
            } 
            // Or if it's a string directly
            else if (typeof challengesField === 'string') {
              challengesValue = challengesField;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting challenges:', error);
      }
      
      console.log('Final extracted challenges value:', challengesValue);
      
      // Convert to array if it's a string
      const challenges = typeof challengesValue === 'string' && challengesValue 
        ? [challengesValue] 
        : Array.isArray(challengesValue) ? challengesValue : [];
        
      console.log('Challenges array:', challenges);
      setUserChallenges(challenges);
      
      // Immediately check state after setting
      setTimeout(() => {
        console.log('Current challenges state after update:', userChallenges);
        checkAndShowLandingPage();
      }, 0);
    };
    const handleGetGoals = (event: CustomEvent) => {
      console.log('Goals event:', event);
      
      // Enhanced extraction to handle nested objects
      let goalsValue = '';
      
      try {
        if (event.detail && typeof event.detail === 'object') {
          if ('goals' in event.detail) {
            const goalsField = event.detail.goals;
            
            // Check if the goals field is itself an object with a goals property
            if (typeof goalsField === 'object' && goalsField !== null && 'goals' in goalsField) {
              goalsValue = goalsField.goals;
            } 
            // Or if it's a string directly
            else if (typeof goalsField === 'string') {
              goalsValue = goalsField;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting goals:', error);
      }
      
      console.log('Final extracted goals value:', goalsValue);
      
      // Convert to array if it's a string
      const goals = typeof goalsValue === 'string' && goalsValue 
        ? [goalsValue] 
        : Array.isArray(goalsValue) ? goalsValue : [];
        
      console.log('Goals array:', goals);
      setUserGoals(goals);
      
      // Immediately check state after setting
      setTimeout(() => {
        console.log('Current goals state after update:', userGoals);
        checkAndShowLandingPage();
      }, 0);
    };
    
    const handleGetExistingSolutions = (event: CustomEvent) => {
      console.log('Existing Solutions event:', event);
      
      // Enhanced extraction to handle nested objects
      let solutionsValue = '';
      
      try {
        if (event.detail && typeof event.detail === 'object') {
          if ('solutions' in event.detail) {
            const solutionsField = event.detail.solutions;
            
            // Check if the solutions field is itself an object with a solutions property
            if (typeof solutionsField === 'object' && solutionsField !== null && 'solutions' in solutionsField) {
              solutionsValue = solutionsField.solutions;
            } 
            // Or if it's a string directly
            else if (typeof solutionsField === 'string') {
              solutionsValue = solutionsField;
            }
          } else if ('existingSolutions' in event.detail) {
            // Try to extract from existingSolutions instead
            const solutionsField = event.detail.existingSolutions;
            
            // Check if it's an object with existingSolutions property
            if (typeof solutionsField === 'object' && solutionsField !== null && 'existingSolutions' in solutionsField) {
              solutionsValue = solutionsField.existingSolutions;
            } 
            // Or if it's a string directly
            else if (typeof solutionsField === 'string') {
              solutionsValue = solutionsField;
            }
          }
        }
      } catch (error) {
        console.error('Error extracting existing solutions:', error);
      }
      
      console.log('Final extracted existing solutions value:', solutionsValue);
      
      // Convert to array if it's a string
      const solutions = typeof solutionsValue === 'string' && solutionsValue 
        ? [solutionsValue] 
        : Array.isArray(solutionsValue) ? solutionsValue : [];
        
      console.log('Existing Solutions array:', solutions);
      setUserExistingSolutions(solutions);
      
      // Add timeout to ensure state has updated
      setTimeout(() => {
        console.log('Current existing solutions state after update:', userExistingSolutions);
        checkAndShowLandingPage();
      }, 100); // Use a slightly longer timeout
    };
    
    window.addEventListener('learnie:openCalendly', handleOpenCalendly);
    window.addEventListener('learnie:openEmployeeTurnover', handleOpenEmployeeTurnover);
    window.addEventListener('learnie:openOnboarding', handleOpenOnboarding);
    window.addEventListener('learnie:openCompliance', handleOpenCompliance);
    window.addEventListener('learnie:openProductivity', handleOpenProductivity);
    window.addEventListener('learnie:openCustomerChurn', handleOpenCustomerChurn);
    window.addEventListener('learnie:openPeerLearning', handleOpenPeerLearning);
    window.addEventListener('learnie:openKnowledgeRetention', handleOpenKnowledgeRetention);
    window.addEventListener('learnie:openSeeALearnie', handleOpenSeeALearnie);
    window.addEventListener('learnie:openFactsFigures', handleOpenFactsFigures);
    window.addEventListener('learnie:openNewsletter', handleOpenNewsletter);
    window.addEventListener('learnie:getIndustry', handleGetIndustry as EventListener);
    window.addEventListener('learnie:getCompanySize', handleGetCompanySize as EventListener);
    window.addEventListener('learnie:getChallenges', handleGetChallenges as EventListener);
    window.addEventListener('learnie:getGoals', handleGetGoals as EventListener);
    window.addEventListener('learnie:getExistingSolutions', handleGetExistingSolutions as EventListener);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('learnie:openCalendly', handleOpenCalendly);
      window.removeEventListener('learnie:openEmployeeTurnover', handleOpenEmployeeTurnover);
      window.removeEventListener('learnie:openOnboarding', handleOpenOnboarding);
      window.removeEventListener('learnie:openCompliance', handleOpenCompliance);
      window.removeEventListener('learnie:openProductivity', handleOpenProductivity);
      window.removeEventListener('learnie:openCustomerChurn', handleOpenCustomerChurn);
      window.removeEventListener('learnie:openPeerLearning', handleOpenPeerLearning);
      window.removeEventListener('learnie:openKnowledgeRetention', handleOpenKnowledgeRetention);
      window.removeEventListener('learnie:openSeeALearnie', handleOpenSeeALearnie);
      window.removeEventListener('learnie:openFactsFigures', handleOpenFactsFigures);
      window.removeEventListener('learnie:openNewsletter', handleOpenNewsletter);
      window.removeEventListener('learnie:getIndustry', handleGetIndustry as EventListener);
      window.removeEventListener('learnie:getCompanySize', handleGetCompanySize as EventListener);
      window.removeEventListener('learnie:getChallenges', handleGetChallenges as EventListener);
      window.removeEventListener('learnie:getGoals', handleGetGoals as EventListener);
      window.removeEventListener('learnie:getExistingSolutions', handleGetExistingSolutions as EventListener);
    };
  }, []);

  useEffect(() => {
    const widget = document.querySelector('elevenlabs-convai');
    
    if (widget) {
      // Configure the client tools directly on widget initialization
      // This must happen BEFORE the agent tries to use them
      widget.addEventListener('elevenlabs-convai:init', (event: any) => {
        event.detail.clientTools = {
          openCalendly: () => {
            openModal(setShowCalendly);
          },
          openEmployeeTurnover: () => {
            openModal(setShowEmployeeTurnoverOverlay);
          },
          openOnboarding: () => {
            openModal(setShowOnboardingOverlay);
          },
          openCompliance: () => {
            openModal(setShowComplianceOverlay);
          },
          openProductivity: () => {
            openModal(setShowProductivityOverlay);
          },
          openCustomerChurn: () => {
            openModal(setShowCustomerChurnOverlay);
          },
          openPeerLearning: () => {
            openModal(setShowPeerLearningOverlay);
          },
          openKnowledgeRetention: () => {
            openModal(setShowKnowledgeRetentionOverlay);
          },
          openSeeALearnie: () => {
            handleOpenSeeALearnie();
          },
          openFactsFigures: () => {
            openModal(setShowFactsFiguresOverlay);
          },
          openNewsletter: () => {
            openModal(setShowNewsletterOverlay);
          },
          getIndustry: (industry: string) => {
            console.log('Industry:', industry);
            window.dispatchEvent(new CustomEvent('learnie:getIndustry', { detail: { industry } }));
          },
          getCompanySize: (companySize: string) => {
            console.log('Company Size:', companySize);
            window.dispatchEvent(new CustomEvent('learnie:getCompanySize', { detail: { companySize } }));
          },
          getChallenges: (challenges: string) => {
            console.log('Challenges:', challenges);
            window.dispatchEvent(new CustomEvent('learnie:getChallenges', { detail: { challenges } }));
          },
          getGoals: (goals: string) => {
            console.log('Goals:', goals);
            window.dispatchEvent(new CustomEvent('learnie:getGoals', { detail: { goals } }));
          },
          getExistingSolutions: (solutions: string) => {
            console.log('Existing Solutions:', solutions);
            window.dispatchEvent(new CustomEvent('learnie:getExistingSolutions', { detail: { existingSolutions: solutions } }));
          }
        };
      });
      
      // You can still keep your call event listener for other purposes if needed
      widget.addEventListener('elevenlabs-convai:call', (event: any) => {
        // Other call-specific handling if needed
      });
    }
    
    return () => {
      // Clean up event listeners
      const widget = document.querySelector('elevenlabs-convai');
      if (widget) {
        widget.removeEventListener('elevenlabs-convai:init', () => {});
        widget.removeEventListener('elevenlabs-convai:call', () => {});
      }
    };
  }, []);

  const cards: FeatureCardProps[] = [
    {
      title: "Employee Turnover",
      description: "Engage, inspire & retain your workforce with training that fits the modern, frontline workforce.",
      onClick: () => openModal(setShowEmployeeTurnoverOverlay)
    },
    {
      title: "Onboarding Challenges",
      description: "Onboard your workforce in style and welcome them into your Community! Customize our suite of Onboarding Content to fit your specific programs.",
      onClick: () => openModal(setShowOnboardingOverlay)
    },
    {
      title: "See a Learnie",
      description: "Learnie's are microlessons made of :30 video bursts you can make as long as you'd like, but warning: if it's over 1:30…TLDW:/",
      onClick: handleOpenSeeALearnie
    },
    {
      title: "Compliance and Regulations",
      description: "Less painfully boring, more social. Ensure your team is up-to-date with the latest compliance standards with the latest Learnie technology.",
      onClick: () => openModal(setShowComplianceOverlay)
    },
    {
      title: "Knowledge Retention",
      description: "Better memory: us or goldfish? Short and sweet is the only way forward. Improve your workforce knowledge retention through burst learning",
      onClick: () => openModal(setShowKnowledgeRetentionOverlay)
    },
    {
      title: "Customer Churn",
      description: "Happy customers don't churn. Equip your teams with the skills they need to enhance customer satisfaction.",
      onClick: () => openModal(setShowCustomerChurnOverlay)
    },
    {
      title: "Peer-to-Peer Learning",
      description: "Learnie is more a social app than a traditional learning system. Foster a culture of learning with peer-derived knowledge sharing.",
      onClick: () => openModal(setShowPeerLearningOverlay)
    },
    {
      title: "Productivity and Efficiency",
      description: "Learnie boosts productivity & speed to efficiency with bite-sized learning that fits into busy schedules. Cut training time, costs and fatigue with engaging microlearning solutions.",
      onClick: () => openModal(setShowProductivityOverlay)
    },
    {
      title: "More About Learnie",
      description: "Check out our blogs, success stories, industries and press here.",
      onClick: () => window.open('https://mylearnie.com', '_blank')
    }
  ];

  // Get the first item from the array or empty string if array is empty
  const getFirstItemOrEmpty = (arr: string[]): string => {
    return arr && arr.length > 0 ? arr[0] : '';
  };

  // Monitor state changes
  useEffect(() => {
    console.log('State changed - Current values:', {
      userIndustry,
      userCompanySize,
      userExistingSolutions
    });
    
    if (userIndustry?.length > 0 && 
        userCompanySize?.length > 0 && 
        userExistingSolutions?.length > 0) {
      console.log('All required data is present, showing landing page');
      setShowLandingPage(true);
    }
  }, [userIndustry, userCompanySize, userExistingSolutions]);

  return (
    <main className="min-h-screen w-full bg-white p-0 m-0">
      {/* Hamburger Menu - Fixed to the top right */}
      <div className="fixed top-4 right-4 z-50">
        <HamburgerMenu onOpenCalendly={() => openModal(setShowCalendly)} />
      </div>
      
      {/* Hero Section with Carousel */}
      <div className="relative w-full overflow-hidden -mt-1">
        {/* Mobile Background - Only visible on mobile */}
        <div className="md:hidden h-[40vw] min-h-[120px] max-h-[220px] w-full overflow-hidden relative">
          <img 
            src="/mobile-bg.png" 
            alt="Mobile Hero Background" 
            className="w-full h-full object-cover"
          />
          
          {/* Mobile Talk Button - Positioned within the mobile background */}
          <div className="absolute md:hidden top-[calc(50%-20px)] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 w-[75%] h-[75%] aspect-square max-w-[160px] max-h-[160px] ">
            <TalkButton agentId={agentId} />
          </div>
        </div>
        
        {/* Carousel Container - Hidden on mobile */}
        <div
          className="relative w-full hidden md:block"
          style={{
            minHeight: '150px',
          }}
        >
          {/* Desktop Talk Button - Same height as carousel, horizontally centered */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 z-40 w-auto h-full flex items-center justify-center">
            <div className="w-[300px] h-auto aspect-square">
              <TalkButton agentId={agentId} />
            </div>
          </div>
          
          {/* Carousel Slides */}
          {heroImages.map((image, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full transition-opacity duration-500"
              style={{
                opacity: currentSlide === index ? 1 : 0,
                pointerEvents: currentSlide === index ? 'auto' : 'none',
              }}
              onClick={() => goToSlide((index + 1) % heroImages.length)}
            >
              <img
                src={image}
                alt={`Hero slide ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Use the first image to set the aspect ratio - only for desktop */}
        <img 
          src={heroImages[0]} 
          alt="" 
          className="w-full h-auto invisible md:block hidden" 
        />
      </div>

      {/* Cards Section */}
      <div className="mx-auto max-w-7xl px-4 pt-1 pb-4 md:px-6 mt-4 md:-mt-32" >
        <h2 className="mb-4 text-center text-[24px] sm:text-[30px] md:text-[40px] font-bold text-[#008a12]">How can we help you?</h2>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center min-h-[100px] text-center rounded-lg border-2 border-[#008a12] p-6 transition-all hover:shadow-lg ${card.onClick ? 'cursor-pointer hover:bg-[#f0f9f1]' : ''}`}
              onClick={card.onClick}
            >
              <h3 className="text-[12px] sm:text-xl font-bold text-[#008a12] flex-1 flex items-center">{card.title}</h3>
              <p className="text-gray-600 text-[10px] sm:text-[16px] hidden md:block">{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showEmployeeTurnoverOverlay && <EmployeeTurnoverOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showOnboardingOverlay && <OnboardingOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showComplianceOverlay && <ComplianceOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showProductivityOverlay && <ProductivityOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showCustomerChurnOverlay && <CustomerChurnOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showPeerLearningOverlay && <PeerLearningOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showKnowledgeRetentionOverlay && <KnowledgeRetentionOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showFactsFiguresOverlay && <FactsFiguresOverlay onClose={() => closeAllModals()} openCalendly={() => openModal(setShowCalendly)} />}
      {showNewsletterOverlay && <NewsletterOverlay onClose={() => closeAllModals()} />}
      
      {/* Landing Page */}
      {showLandingPage && (() => {
        console.log('Rendering landing page with user data:', {
          industry: userIndustry,
          companySize: userCompanySize,
          existingSolutions: userExistingSolutions
        });
        return (
          <GenerateLandingPage 
            userProfile={{
              industry: getFirstItemOrEmpty(userIndustry),
              companySize: getFirstItemOrEmpty(userCompanySize),
              challenges: userChallenges, // Still passing these but not required for showing the page
              goals: userGoals, // Still passing these but not required for showing the page
              existingSolutions: [getFirstItemOrEmpty(userExistingSolutions)]
            }}
            onClose={() => closeAllModals()}
          />
        );
      })()}
      
      {/* Calendly Drawer */}
      <Drawer isOpen={showCalendly} onClose={() => closeAllModals()}>
        <div className="h-full w-full overflow-hidden bg-white">
          <iframe
            src="https://calendly.com/learnie_pays/learnie-for-business-show-and-tell?month=2025-02&embed_type=inline&text_color=333333&primary_color=008a12"
            style={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              minHeight: "100vh"
            }}
            frameBorder="0"
            title="Schedule a meeting with Learnie"
            data-mobile-optimized="true"
          />
        </div>
      </Drawer>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left md:w-1/3">
              <p className="text-gray-600 text-sm">
                © 2025 All rights reserved Learnie, LLC 2025
              </p>
            </div>
            
            <div className="flex space-x-8 my-4 md:my-0 md:w-1/3 justify-center">
              <a href="https://www.linkedin.com/company/learnie" className="text-[#008a12] hover:text-[#006a0e]" aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
                  <path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
                </svg>
              </a>
              <a href="https://www.youtube.com/@MyLearnie" className="text-[#008a12] hover:text-[#006a0e]" aria-label="YouTube">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 576 512" aria-hidden="true">
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
                </svg>
              </a>
            </div>
            
            <div className="text-center md:text-right md:w-1/3 flex items-center justify-center md:justify-end space-x-4">
              <a href="mailto:bill@mylearnie.com" className="text-[#008a12] hover:text-[#006a0e] font-medium">
                Email us
              </a>
              <span className="text-gray-400">|</span>
              <button 
                onClick={() => openModal(setShowNewsletterOverlay)} 
                className="text-[#008a12] hover:text-[#006a0e] font-medium"
              >
                Newsletter
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, onClick }: FeatureCardProps) {
  return (
    <div 
      className="bg-gray-800 p-6 rounded-xl hover:bg-gray-700 transition-all cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default App;