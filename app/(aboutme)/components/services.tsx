import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Heart,
  Scale,
  Lock,
  Leaf,
  Zap,
  BarChart,
  Lightbulb,
  GraduationCap,
  MapIcon,
  Workflow,
  Crosshair,
  Code,
  Microscope,
  ChartNoAxesCombined,
  BrainCircuit,
  Repeat,
  FileCheck,
  Users,
  BookOpenCheck,
  Headset,
  SmilePlus,
} from 'lucide-react';
import Image from 'next/image';
import { ScrollArrow } from './scroll-arrow';
import { CTAButton } from './cta-button';

interface SubSection {
  title: string;
  description: string;
  icon: React.ElementType;
}

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  subsections: SubSection[];
  image: string;
  index: number;
}

function ServiceCard({
  title,
  description,
  icon: Icon,
  subsections,
  image,
  index,
}: ServiceCardProps) {
  const imageOnRight = index % 2 === 0;

  return (
    <motion.div
      className="rounded-lg p-6 text-left relative overflow-hidden mb-8 z-10"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {!imageOnRight && (
          <div className="md:w-1/3 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              width={500}
              height={300}
              className="rounded-lg object-cover w-full h-40 md:h-full"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <Icon className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-bold text-foreground font-mono tracking-tight">{title}</h3>
          </div>
          <p className="text-muted-foreground mb-6 text-xs">{description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subsections.map((subsection, index) => (
              <motion.div
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <subsection.icon className="w-4 h-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1 font-mono tracking-tight">
                    {subsection.title}
                  </h4>
                  <p className="text-muted-foreground text-xs">{subsection.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        {imageOnRight && (
          <div className="md:w-1/3 flex-shrink-0">
            <Image
              src={image}
              alt={title}
              width={200}
              height={200}
              className="rounded-lg object-cover w-full h-40 md:h-full"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

const services = [
  {
    title: 'AI Audits',
    description: 'Comprehensive analysis of your business processes and AI opportunities.',
    icon: Workflow,
    image: '/bulb.png',
    subsections: [
      {
        title: 'Current State Assessment',
        description: 'Evaluate existing processes and technology usage.',
        icon: Microscope,
      },
      {
        title: 'Opportunity Analysis',
        description: 'Identify bespoke high-impact areas for AI implementation.',
        icon: Crosshair,
      },
      {
        title: 'Implementation Roadmap',
        description: 'Develop strategic plan for AI adoption.',
        icon: MapIcon,
      },
      {
        title: 'ROI Calculation',
        description: 'Project potential returns and efficiency gains.',
        icon: BarChart,
      },
    ],
  },
  {
    title: 'Implementation & Automation',
    description: 'Expert deployment of AI solutions and process automation.',
    icon: Zap,
    image: '/factory.png',
    subsections: [
      {
        title: 'Solution Development',
        description: 'Build and integrate custom AI tools.',
        icon: Code,
      },
      {
        title: 'Process Automation',
        description: 'Streamline workflows and reduce manual tasks.',
        icon: Repeat,
      },
      {
        title: 'System Integration',
        description: 'Connect AI solutions with existing systems.',
        icon: BrainCircuit,
      },
      {
        title: 'Performance Monitoring',
        description: 'Track and optimize AI implementation.',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: 'AI Training & Education',
    description: 'Empower your team with AI knowledge and skills.',
    icon: GraduationCap,
    image: '/lecture.png',
    subsections: [
      {
        title: 'Workshops',
        description: 'Interactive sessions on AI tools and best practices.',
        icon: Users,
      },
      {
        title: 'Custom Guides',
        description: 'Tailored documentation for your AI implementation.',
        icon: BookOpenCheck,
      },
      {
        title: 'Ongoing Support',
        description: 'Regular check-ins and assistance as needed.',
        icon: Headset,
      },
      {
        title: 'Best Practices',
        description: 'Guidelines for effective AI utilization.',
        icon: FileCheck,
      },
    ],
  },
  {
    title: 'Responsible AI & Sustainability',
    description: 'Ensuring ethical, secure, and environmentally conscious AI implementation.',
    icon: Heart,
    image: '/beach.png',
    subsections: [
      {
        title: 'Data Privacy & Security',
        description: 'Ensure GDPR compliance and robust security measures.',
        icon: Lock,
      },
      {
        title: 'Environmental Impact Assessment',
        description: "Monitor and optimize AI's ecological footprint.",
        icon: Leaf,
      },
      {
        title: 'Bias Monitoring & Ethics',
        description: 'Address AI bias and maintain ethical standards.',
        icon: Scale,
      },
      {
        title: 'Compliance & Best Practices',
        description: 'Adhere to regulations and industry standards.',
        icon: ShieldCheck,
      },
    ],
  },
];

export function Services() {
  return (
    <div className="text-center relative">
      <motion.div
        className="absolute top-0 left-0 text-red-500"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <Lightbulb className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
      </motion.div>
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-red-400 to-red-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Services
      </motion.h2>
      <motion.p
        className="mb-8 max-w-2xl mx-auto text-foreground leading-relaxed text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Leveraging cutting-edge AI technologies, I offer a range of services designed to elevate you
        and your business.
      </motion.p>
      <div className="space-y-6">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} index={index} />
        ))}
      </div>
      <div className="flex justify-center mt-12">
        <CTAButton />
      </div>
      <motion.div className="mt-12">
        <ScrollArrow />
      </motion.div>
    </div>
  );
}
